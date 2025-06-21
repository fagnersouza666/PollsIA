// Service para gerenciar conexão com Phantom usando padrões modernos
export class PhantomWalletService {
    async isPhantomInstalled(): Promise<boolean> {
        return !!(window.solana?.isPhantom);
    }

    async connect(): Promise<string> {
        if (!window.solana?.isPhantom) {
            throw new Error('Phantom wallet não detectado');
        }

        const response = await window.solana.connect();
        return response.publicKey.toString();
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

    onAccountChanged(callback: (publicKey: string | null) => void): void {
        window.solana?.on?.('accountChanged', callback);
    }

    onConnect(callback: (publicKey: string) => void): void {
        window.solana?.on?.('connect', (publicKey: any) => {
            callback(publicKey.toString());
        });
    }

    onDisconnect(callback: () => void): void {
        window.solana?.on?.('disconnect', callback);
    }

    isConnected(): boolean {
        return window.solana?.isConnected || false;
    }

    getPublicKey(): string | null {
        return window.solana?.publicKey?.toString() || null;
    }
}

// Instância singleton
export const phantomWallet = new PhantomWalletService(); 