// Tipos para Phantom Wallet conforme padrões modernos
declare global {
  interface Window { // eslint-disable-line no-unused-vars
    solana?: {
      isPhantom?: boolean;
      isConnected: boolean;
      publicKey: any;
      connect(): Promise<{ publicKey: any }>;
      disconnect(): Promise<void>;
      signTransaction(_transaction: any): Promise<any>;
      signAllTransactions(_transactions: any[]): Promise<any[]>;
      on(_event: string, _callback: Function): void;
      off(_event: string, _callback: Function): void;
    };
  }
}

export { };