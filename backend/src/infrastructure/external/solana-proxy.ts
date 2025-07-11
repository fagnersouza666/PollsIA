import { Request, Response } from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { logger } from '../../shared/utils/logger'

export const solanaRpcProxy = createProxyMiddleware({
  target: 'https://solana-rpc.publicnode.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/solana/rpc': '',
  },
  onProxyReq: (proxyReq, req, res) => {
    // Remove headers que podem identificar como browser
    proxyReq.removeHeader('origin')
    proxyReq.removeHeader('referer')
    // Define um User-Agent server-like
    proxyReq.setHeader('user-agent', 'PollsIA-Backend-Proxy')
    
    logger.info('Solana RPC proxy request', {
      url: req.url,
      method: req.method,
      target: 'https://solana-rpc.publicnode.com',
    })
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers
    proxyRes.headers['Access-Control-Allow-Origin'] = '*'
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, solana-client'
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    
    logger.info('Solana RPC proxy response', {
      url: req.url,
      statusCode: proxyRes.statusCode,
    })
  },
  onError: (err, req, res) => {
    logger.error('Solana RPC proxy error', {
      error: err.message,
      url: req.url,
    })
    
    res.status(500).json({
      error: 'Proxy error',
      message: err.message,
    })
  },
})

export async function getRaydiumPairs(req: Request, res: Response) {
  try {
    logger.info('Fetching Raydium pairs')
    
    const response = await fetch('https://api.raydium.io/v2/main/pairs')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    logger.info('Raydium pairs fetched successfully', {
      pairsCount: data.length || 0,
    })
    
    res.json(data)
  } catch (error) {
    logger.error('Error fetching Raydium pairs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    
    res.status(500).json({
      error: 'Failed to fetch Raydium pairs',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}