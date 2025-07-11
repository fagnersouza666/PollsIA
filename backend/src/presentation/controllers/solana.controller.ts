import { Request, Response } from 'express'
import { getRaydiumPairs } from '../../infrastructure/external/solana-proxy'

export class SolanaController {
  async getRaydiumPairs(req: Request, res: Response) {
    return getRaydiumPairs(req, res)
  }
}

export const solanaController = new SolanaController()