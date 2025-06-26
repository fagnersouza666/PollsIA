import { Address } from '@solana/addresses';

// Service para gerenciar conexão com Phantom usando padrões modernos
export class PhantomWalletService {
    async isPhantomInstalled(): Promise<boolean> {
        return !!(window.solana?.isPhantom);
    }

    async connect(): Promise<Address> {
        console.log('🔄 Iniciando conexão com Phantom...');
        
        if (!window.solana) {
            console.error('❌ window.solana não encontrado');
            throw new Error('Phantom wallet não detectado. Instale em https://phantom.app');
        }

        if (!window.solana.isPhantom) {
            console.error('❌ window.solana.isPhantom é false');
            throw new Error('Phantom wallet não é válido');
        }

        console.log('✅ Phantom detectado, solicitando conexão...');
        
        try {
            const response = await window.solana.connect();
            console.log('✅ Phantom conectado:', response.publicKey.toString());
            return response.publicKey.toString() as Address;
        } catch (error) {
            console.error('❌ Erro na conexão:', error);
            if (error.code === 4001) {
                throw new Error('Conexão rejeitada pelo usuário');
            }
            throw new Error('Falha ao conectar: ' + error.message);
        }
    }

    async disconnect(): Promise<void> {
        if (window.solana?.disconnect) {
            await window.solana.disconnect();
        }
    }

    async signTransaction(transaction: any): Promise<any> {
        console.log('🔄 Iniciando assinatura de transação...');
        
        if (!window.solana) {
            console.error('❌ window.solana não disponível');
            throw new Error('Phantom wallet não está disponível');
        }

        if (!window.solana.signTransaction) {
            console.error('❌ signTransaction não disponível');
            throw new Error('Carteira não suporta assinatura de transações');
        }

        if (!window.solana.isConnected) {
            console.error('❌ Phantom não está conectado');
            throw new Error('Phantom não está conectado. Conecte primeiro.');
        }

        console.log('📝 Solicitando assinatura ao Phantom...');
        
        try {
            const signedTx = await window.solana.signTransaction(transaction);
            console.log('✅ Transação assinada com sucesso');
            return signedTx;
        } catch (error) {
            console.error('❌ Erro na assinatura:', error);
            if (error.code === 4001) {
                throw new Error('Assinatura rejeitada pelo usuário');
            }
            throw new Error('Falha na assinatura: ' + error.message);
        }
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