import { z } from "zod"

// Common validations
export const emailSchema = z
  .string()
  .email("Email inválido")
  .min(1, "Email é obrigatório")

export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número"
  )

export const solanaAddressSchema = z
  .string()
  .regex(
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    "Endereço Solana inválido"
  )

export const positiveNumberSchema = z
  .number()
  .positive("Valor deve ser positivo")

export const nonNegativeNumberSchema = z
  .number()
  .nonnegative("Valor não pode ser negativo")

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória"),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

// Wallet schemas
export const walletConnectionSchema = z.object({
  publicKey: solanaAddressSchema,
  signMessage: z.function(),
  signTransaction: z.function(),
})

export const transactionSchema = z.object({
  signature: z.string().min(1, "Assinatura da transação é obrigatória"),
  amount: positiveNumberSchema,
  fromAddress: solanaAddressSchema,
  toAddress: solanaAddressSchema,
  timestamp: z.date(),
})

// Pool schemas
export const poolSchema = z.object({
  id: z.string().min(1, "ID do pool é obrigatório"),
  name: z.string().min(1, "Nome do pool é obrigatório"),
  tokenA: z.string().min(1, "Token A é obrigatório"),
  tokenB: z.string().min(1, "Token B é obrigatório"),
  tvl: nonNegativeNumberSchema,
  volume24h: nonNegativeNumberSchema,
  fees24h: nonNegativeNumberSchema,
  apr: nonNegativeNumberSchema,
})

export const poolListSchema = z.array(poolSchema)

export const poolQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["tvl", "volume24h", "fees24h", "apr"]).default("tvl"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  tokenA: z.string().optional(),
  tokenB: z.string().optional(),
})

// Investment schemas
export const investmentSchema = z.object({
  poolId: z.string().min(1, "ID do pool é obrigatório"),
  amount: positiveNumberSchema,
  strategy: z.enum(["conservative", "balanced", "aggressive"]),
  autoRebalance: z.boolean().default(false),
  slippageTolerance: z.number().min(0).max(100).default(0.5),
})

export const portfolioSchema = z.object({
  totalValue: nonNegativeNumberSchema,
  totalPnl: z.number(),
  totalPnlPercentage: z.number(),
  positions: z.array(z.object({
    poolId: z.string(),
    amount: nonNegativeNumberSchema,
    value: nonNegativeNumberSchema,
    pnl: z.number(),
    pnlPercentage: z.number(),
  })),
})

// Form schemas
export const contactFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: emailSchema,
  subject: z.string().min(5, "Assunto deve ter pelo menos 5 caracteres"),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
})

export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comentário deve ter pelo menos 10 caracteres"),
  category: z.enum(["bug", "feature", "general", "performance"]),
})

// API Response schemas
export const apiResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
})

export const paginatedResponseSchema = <T>(itemSchema: z.ZodType<T>) => z.object({
  items: z.array(itemSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// Type exports
export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type WalletConnection = z.infer<typeof walletConnectionSchema>
export type Transaction = z.infer<typeof transactionSchema>
export type Pool = z.infer<typeof poolSchema>
export type PoolList = z.infer<typeof poolListSchema>
export type PoolQuery = z.infer<typeof poolQuerySchema>
export type Investment = z.infer<typeof investmentSchema>
export type Portfolio = z.infer<typeof portfolioSchema>
export type ContactForm = z.infer<typeof contactFormSchema>
export type Feedback = z.infer<typeof feedbackSchema>