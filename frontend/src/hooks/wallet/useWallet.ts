import { useCallback, useEffect, useState } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';

interface WalletState {
    isConnected: boolean;
    publicKey: PublicKey | null;
    balance: number;
    isLoading: boolean;
    error: string | null;
}

interface WalletActions {
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    refreshBalance: () => Promise<void>;
}

export function useWallet(): WalletState & WalletActions {
    const { wallet, connect: solanaConnect, disconnect: solanaDisconnect, publicKey } = useSolanaWallet();
    const [balance, setBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
    );

    const connect = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            await solanaConnect();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect wallet');
        } finally {
            setIsLoading(false);
        }
    }, [solanaConnect]);

    const disconnect = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            await solanaDisconnect();
            setBalance(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
        } finally {
            setIsLoading(false);
        }
    }, [solanaDisconnect]);

    const refreshBalance = useCallback(async () => {
        if (!publicKey) {
            setBalance(0);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const balance = await connection.getBalance(publicKey);
            setBalance(balance / 1e9); // Convert lamports to SOL
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch balance');
        } finally {
            setIsLoading(false);
        }
    }, [connection, publicKey]);

    useEffect(() => {
        if (publicKey) {
            refreshBalance();
        }
    }, [publicKey, refreshBalance]);

    return {
        isConnected: !!publicKey,
        publicKey,
        balance,
        isLoading,
        error,
        connect,
        disconnect,
        refreshBalance,
    };
} 