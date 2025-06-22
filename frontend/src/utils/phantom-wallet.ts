import { Address } from '@solana/addresses';

// Service para gerenciar conexão com Phantom usando padrões modernos
export class PhantomWalletService {
    async isPhantomInstalled(): Promise<boolean> {
        return !!(window.solana?.isPhantom);
    }

    async connect(): Promise<Address> {
        if (!window.solana?.isPhantom) {
            throw new Error('Phantom wallet não detectado');
        }

        const response = await window.solana.connect();
        return response.publicKey.toString() as Address;
    }

    async disconnect(): Promise<void> {
        if (window.solana?.disconnect) {
            await window.solana.disconnect();
        }
    }

    async signTransaction(transaction: any): Promise<any> {
        if (!window.solana?.signTransaction) {
            throw new Error('Carteira não suporta assinatura de transações');
        }

        return await window.solana.signTransaction(transaction);
    }

    onAccountChanged(callback: (_publicKey: Address | null) => void): void {
        window.solana?.on?.('accountChanged', (_publicKey: any) => {
            callback(_publicKey ? _publicKey.toString() as Address : null);
        });
    }

    onConnect(callback: (_publicKey: Address) => void): void {
        window.solana?.on?.('connect', (_publicKey: any) => {
            callback(_publicKey.toString() as Address);
        });
    }

    onDisconnect(callback: () => void): void {
        window.solana?.on?.('disconnect', callback);
    }

    isConnected(): boolean {
        return window.solana?.isConnected || false;
    }

    getPublicKey(): Address | null {
        return window.solana?.publicKey?.toString() as Address || null;
    }
}

// Instância singleton
export const phantomWallet = new PhantomWalletService(); 