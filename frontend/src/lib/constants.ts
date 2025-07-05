// Application constants
export const APP_NAME = "PollsIA"
export const APP_DESCRIPTION = "Sistema automatizado de gestão de pools de liquidez na Solana"
export const APP_VERSION = "1.0.0"

// API endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
export const API_VERSION = "v1"

// Solana configuration
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com"

// Wallet configuration
export const SUPPORTED_WALLETS = [
  "phantom",
  "solflare",
  "slope",
  "sollet",
] as const

export const PHANTOM_WALLET_URL = "https://phantom.app/"

// Pool configuration
export const DEFAULT_POOL_QUERY = {
  page: 1,
  limit: 10,
  sortBy: "tvl" as const,
  sortOrder: "desc" as const,
}

export const POOL_SORT_OPTIONS = [
  { value: "tvl", label: "TVL" },
  { value: "volume24h", label: "Volume 24h" },
  { value: "fees24h", label: "Fees 24h" },
  { value: "apr", label: "APR" },
] as const

export const INVESTMENT_STRATEGIES = [
  {
    value: "conservative",
    label: "Conservador",
    description: "Baixo risco, retorno estável",
    riskLevel: 1,
  },
  {
    value: "balanced",
    label: "Equilibrado",
    description: "Risco moderado, retorno balanceado",
    riskLevel: 2,
  },
  {
    value: "aggressive",
    label: "Agressivo",
    description: "Alto risco, potencial de alto retorno",
    riskLevel: 3,
  },
] as const

// UI configuration
export const THEME_COLORS = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    900: "#1e3a8a",
  },
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    900: "#14532d",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    900: "#78350f",
  },
  danger: {
    50: "#fef2f2",
    100: "#fecaca",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    900: "#7f1d1d",
  },
} as const

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const

export const ANIMATION_DURATIONS = {
  fast: "150ms",
  normal: "300ms",
  slow: "500ms",
} as const

// Form configuration
export const FORM_VALIDATION_MESSAGES = {
  required: "Este campo é obrigatório",
  email: "Email inválido",
  minLength: (length: number) => `Deve ter pelo menos ${length} caracteres`,
  maxLength: (length: number) => `Deve ter no máximo ${length} caracteres`,
  pattern: "Formato inválido",
  min: (value: number) => `Valor mínimo é ${value}`,
  max: (value: number) => `Valor máximo é ${value}`,
} as const

// Cache configuration
export const CACHE_KEYS = {
  pools: "pools",
  wallet: "wallet",
  portfolio: "portfolio",
  user: "user",
  transactions: "transactions",
} as const

export const CACHE_DURATIONS = {
  short: 1 * 60 * 1000, // 1 minute
  medium: 5 * 60 * 1000, // 5 minutes
  long: 15 * 60 * 1000, // 15 minutes
  extraLong: 60 * 60 * 1000, // 1 hour
} as const

// Local storage keys
export const STORAGE_KEYS = {
  theme: "pollsia-theme",
  wallet: "pollsia-wallet",
  preferences: "pollsia-preferences",
  lastLogin: "pollsia-last-login",
} as const

// Navigation
export const NAVIGATION_LINKS = {
  public: [
    { href: "/", label: "Início" },
    { href: "/about", label: "Sobre" },
    { href: "/contact", label: "Contato" },
  ],
  authenticated: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/pools", label: "Pools" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/profile", label: "Perfil" },
  ],
} as const

// Error messages
export const ERROR_MESSAGES = {
  network: "Erro de conexão. Verifique sua internet.",
  unauthorized: "Acesso negado. Faça login novamente.",
  forbidden: "Você não tem permissão para esta ação.",
  notFound: "Recurso não encontrado.",
  validation: "Dados inválidos. Verifique os campos.",
  server: "Erro interno do servidor. Tente novamente.",
  wallet: {
    notFound: "Carteira não encontrada. Instale a Phantom Wallet.",
    connectionFailed: "Falha ao conectar carteira. Tente novamente.",
    transactionFailed: "Falha na transação. Tente novamente.",
    insufficientFunds: "Saldo insuficiente para esta transação.",
  },
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  wallet: {
    connected: "Carteira conectada com sucesso!",
    disconnected: "Carteira desconectada.",
    transactionSuccess: "Transação realizada com sucesso!",
  },
  pool: {
    invested: "Investimento realizado com sucesso!",
    withdrawn: "Saque realizado com sucesso!",
  },
  profile: {
    updated: "Perfil atualizado com sucesso!",
  },
  auth: {
    login: "Login realizado com sucesso!",
    logout: "Logout realizado com sucesso!",
    register: "Conta criada com sucesso!",
  },
} as const

// Regex patterns
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  solanaAddress: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  phoneNumber: /^\+?[1-9]\d{1,14}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const

// Feature flags
export const FEATURE_FLAGS = {
  maintenance: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true",
  betaFeatures: process.env.NEXT_PUBLIC_BETA_FEATURES === "true",
  analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
  debug: process.env.NODE_ENV === "development",
} as const

// Pagination
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
  maxLimit: 100,
} as const

// File upload
export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  maxFiles: 5,
} as const

// Chart configuration
export const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
] as const

// Time periods
export const TIME_PERIODS = [
  { value: "1h", label: "1 Hora" },
  { value: "4h", label: "4 Horas" },
  { value: "1d", label: "1 Dia" },
  { value: "7d", label: "7 Dias" },
  { value: "30d", label: "30 Dias" },
  { value: "90d", label: "90 Dias" },
  { value: "1y", label: "1 Ano" },
] as const

// External links
export const EXTERNAL_LINKS = {
  solana: "https://solana.com",
  phantom: "https://phantom.app",
  raydium: "https://raydium.io",
  twitter: "https://twitter.com/pollsia",
  github: "https://github.com/pollsia",
  docs: "https://docs.pollsia.com",
  support: "https://support.pollsia.com",
  blog: "https://blog.pollsia.com",
} as const

// Type exports
export type SupportedWallet = typeof SUPPORTED_WALLETS[number]
export type InvestmentStrategy = typeof INVESTMENT_STRATEGIES[number]["value"]
export type PoolSortOption = typeof POOL_SORT_OPTIONS[number]["value"]
export type TimePeriod = typeof TIME_PERIODS[number]["value"]