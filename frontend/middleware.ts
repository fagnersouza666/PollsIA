import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting storage (em produção, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Configuração de rate limiting
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100, // máximo de requests por IP
  apiWindowMs: 1 * 60 * 1000, // 1 minuto para API
  apiMaxRequests: 20 // máximo de requests de API por IP
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Rate Limiting
  const rateLimitResult = checkRateLimit(request)
  if (rateLimitResult) return rateLimitResult

  // 2. Security Headers
  const response = NextResponse.next()
  setSecurityHeaders(response)

  // 3. Auth Check para rotas protegidas
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/pools') || 
      pathname.startsWith('/profile')) {
    
    const authResult = checkAuthentication(request)
    if (authResult) return authResult
  }

  // 4. API Route Protection
  if (pathname.startsWith('/api/')) {
    const apiResult = protectApiRoutes(request)
    if (apiResult) return apiResult
  }

  // 5. Redirect legacy routes
  if (pathname === '/app') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

// Rate limiting implementation
function checkRateLimit(request: NextRequest): NextResponse | null {
  const ip = getClientIP(request)
  const now = Date.now()
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
  
  const windowMs = isApiRoute ? RATE_LIMIT.apiWindowMs : RATE_LIMIT.windowMs
  const maxRequests = isApiRoute ? RATE_LIMIT.apiMaxRequests : RATE_LIMIT.maxRequests
  
  const tokenCount = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs }
  
  // Reset counter se o tempo passou
  if (now > tokenCount.resetTime) {
    tokenCount.count = 0
    tokenCount.resetTime = now + windowMs
  }
  
  tokenCount.count++
  rateLimitMap.set(ip, tokenCount)
  
  // Verificar se excedeu o limite
  if (tokenCount.count > maxRequests) {
    return new NextResponse(
      JSON.stringify({
        error: 'Muitas tentativas. Tente novamente mais tarde.',
        retryAfter: Math.ceil((tokenCount.resetTime - now) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((tokenCount.resetTime - now) / 1000)),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': String(Math.max(0, maxRequests - tokenCount.count)),
          'X-RateLimit-Reset': String(tokenCount.resetTime)
        }
      }
    )
  }

  return null
}

// Verificação de autenticação
function checkAuthentication(request: NextRequest): NextResponse | null {
  // Verificar token de autenticação nos cookies
  const authToken = request.cookies.get('pollsia_auth')?.value
  
  // Se não há token, redirecionar para home
  if (!authToken) {
    const url = new URL('/', request.url)
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Validar formato do token (básico)
  try {
    const parsed = JSON.parse(authToken)
    if (!parsed.walletAddress || !parsed.connectedAt) {
      throw new Error('Invalid token format')
    }
    
    // Verificar se não expirou (24 horas)
    const connectedAt = new Date(parsed.connectedAt)
    const now = new Date()
    const hoursDiff = (now.getTime() - connectedAt.getTime()) / (1000 * 60 * 60)
    
    if (hoursDiff > 24) {
      // Token expirado, limpar e redirecionar
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('pollsia_auth')
      return response
    }
    
  } catch (error) {
    // Token inválido, limpar e redirecionar
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.delete('pollsia_auth')
    return response
  }

  return null
}

// Proteção de rotas de API
function protectApiRoutes(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  
  // Rotas públicas da API
  const publicApiRoutes = [
    '/api/health',
    '/api/stats',
    '/api/pools/public'
  ]
  
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return null
  }
  
  // Verificar Content-Type para POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return new NextResponse(
        JSON.stringify({ error: 'Content-Type deve ser application/json' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
  
  // CSRF Protection para rotas de API autenticadas
  if (pathname.startsWith('/api/auth/') || 
      pathname.startsWith('/api/wallet/') ||
      pathname.startsWith('/api/pools/manage')) {
    
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    
    if (!origin || !host || !origin.includes(host)) {
      return new NextResponse(
        JSON.stringify({ error: 'CSRF: Origin não permitida' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  return null
}

// Definir headers de segurança
function setSecurityHeaders(response: NextResponse) {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.devnet.solana.com https://api.mainnet-beta.solana.com wss:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ')
  )

  // Outros headers de segurança
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Strict Transport Security (apenas em HTTPS)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
}

// Obter IP do cliente
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return request.ip || '127.0.0.1'
}

// Configuração do matcher
export const config = {
  matcher: [
    // Aplicar middleware a todas as rotas exceto assets estáticos
    '/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)',
  ]
}