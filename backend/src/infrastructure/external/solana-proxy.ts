import { Request, Response } from 'express'
import { container } from '../../shared/container'
import { TYPES } from '../../shared/types'
import { Logger } from '../../shared/interfaces/logger.interface'

const logger = container.get<Logger>(TYPES.Logger)

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
    logger.error('Error fetching Raydium pairs', error as Error)

    res.status(500).json({
      error: 'Failed to fetch Raydium pairs',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export async function getSolanaRpc(req: Request, res: Response) {
  try {
    logger.info('Proxying Solana RPC request', {
      method: req.method,
      body: req.body
    })

    const response = await fetch('https://solana-rpc.publicnode.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'PollsIA-Backend-Proxy'
      },
      body: JSON.stringify(req.body)
    })

    if (!response.ok) {
      throw new Error(`RPC error! status: ${response.status}`)
    }

    const data = await response.json()

    logger.info('Solana RPC request completed', {
      statusCode: response.status
    })

    res.json(data)
  } catch (error) {
    logger.error('Solana RPC proxy error', error as Error)

    res.status(500).json({
      error: 'RPC proxy error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}