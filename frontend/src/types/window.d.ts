// Tipos para Phantom Wallet conforme padrões modernos
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      isConnected: boolean;
      publicKey: any;
      connect(): Promise<{ publicKey: any }>;
      disconnect(): Promise<void>;
      signTransaction(transaction: any): Promise<any>;
      signAllTransactions(transactions: any[]): Promise<any[]>;
      on(event: string, callback: Function): void;
      off(event: string, callback: Function): void;
    };
  }
}

export { };