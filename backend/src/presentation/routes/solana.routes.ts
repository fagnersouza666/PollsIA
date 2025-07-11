import { Router } from 'express'
import { solanaController } from '../controllers/solana.controller'
import { getSolanaRpc } from '../../infrastructure/external/solana-proxy'

const router = Router()

// Proxy RPC para Solana
router.post('/rpc', getSolanaRpc)

// Endpoint para obter pares do Raydium
router.get('/raydium-pairs', solanaController.getRaydiumPairs)

export default router