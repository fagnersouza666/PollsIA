import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/types';
import { Logger } from '../../shared/interfaces/logger.interface';
import { WalletService } from '../../services/WalletService';
import { BaseError } from '../../shared/errors';

@injectable()
export class WalletController {
    constructor(
        @inject(TYPES.WalletService) private walletService: WalletService,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async connectWallet(request: FastifyRequest<{ Body: { publicKey: string, signature: string } }>, reply: FastifyReply): Promise<void> {
        try {
            const { publicKey, signature } = request.body;
            const result = await this.walletService.connectWallet(publicKey, signature);
            reply.send({ success: true, data: result, timestamp: new Date().toISOString() });
        } catch (error) {
            this.handleError(reply, error as Error);
        }
    }

    async getPortfolio(request: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply): Promise<void> {
        try {
            const { address } = request.params;
            const portfolio = await this.walletService.getPortfolio(address);
            reply.send({ success: true, data: portfolio, timestamp: new Date().toISOString() });
        } catch (error) {
            this.handleError(reply, error as Error);
        }
    }

    async getPositions(request: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply): Promise<void> {
        try {
            const { address } = request.params;
            const positions = await this.walletService.getPositions(address);
            reply.send({ success: true, data: positions, timestamp: new Date().toISOString() });
        } catch (error) {
            this.handleError(reply, error as Error);
        }
    }

    async getWalletPools(request: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply): Promise<void> {
        try {
            const { address } = request.params;
            const pools = await this.walletService.getWalletPools(address);
            reply.send({ success: true, data: pools, timestamp: new Date().toISOString() });
        } catch (error) {
            this.handleError(reply, error as Error);
        }
    }

    async getAllTokensDetailed(request: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply): Promise<void> {
        try {
            const { address } = request.params;
            const tokens = await this.walletService.getAllTokensDetailed(address);
            reply.send({ success: true, data: tokens, timestamp: new Date().toISOString() });
        } catch (error) {
            this.handleError(reply, error as Error);
        }
    }

    async disconnectWallet(request: FastifyRequest<{ Params: { address: string } }>, reply: FastifyReply): Promise<void> {
        try {
            const { address } = request.params;
            const result = await this.walletService.disconnectWallet(address);
            reply.send({ success: true, data: { disconnected: result }, timestamp: new Date().toISOString() });
        } catch (error) {
            this.handleError(reply, error as Error);
        }
    }

    private handleError(reply: FastifyReply, error: Error): void {
        if (error instanceof BaseError) {
            reply.status(error.statusCode).send({
                success: false,
                error: { code: error.code, message: error.message, context: error.context },
                timestamp: new Date().toISOString(),
            });
        } else {
            this.logger.error('Unexpected error in WalletController', error);
            reply.status(500).send({
                success: false,
                error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
                timestamp: new Date().toISOString(),
            });
        }
    }
} 