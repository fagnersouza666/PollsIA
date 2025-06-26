'use client';

import { useState } from 'react';
import { phantomWallet } from '../utils/phantom-wallet';

interface Pool {
  id: string;
  tokenA: string;
  tokenB: string;
  tvl: number;
  apy: number;
}

interface InvestmentPhantomProps {
  pool: Pool;
  onSuccess?: (signature: string) => void;
  onError?: (error: string) => void;
}

export function InvestmentPhantom({ pool, onSuccess, onError }: InvestmentPhantomProps) {
  const [solAmount, setSolAmount] = useState<string>('0.1');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleInvest = async () => {
    try {
      setLoading(true);
      setStatus('Verificando conexão Phantom...');

      // Verificar se Phantom está conectado
      if (!phantomWallet.isConnected()) {
        setStatus('Conectando Phantom...');
        await phantomWallet.connect();
      }

      const userPublicKey = phantomWallet.getPublicKey();
      if (!userPublicKey) {
        throw new Error('Phantom não está conectado');
      }

      setStatus('Preparando transação de investimento...');

      // 1. Preparar transação no backend
      const response = await fetch('/api/investment/invest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poolId: pool.id,
          userPublicKey,
          solAmount: parseFloat(solAmount),
          tokenA: pool.tokenA,
          tokenB: pool.tokenB,
          slippage
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Falha ao preparar investimento');
      }

      // Se não requer assinatura, investimento já foi processado
      if (!result.requiresSignature) {
        setStatus('Investimento processado com sucesso!');
        onSuccess?.(result.data.signature);
        return;
      }

      // 2. Solicitar assinatura via Phantom
      setStatus('Aguardando assinatura no Phantom...');
      
      if (!result.data.transactionData) {
        throw new Error('Dados da transação não encontrados');
      }

      // Deserializar transação para assinatura
      const transactionBuffer = Buffer.from(result.data.transactionData, 'base64');
      const transaction = await import('@solana/web3.js').then(m => 
        m.Transaction.from(transactionBuffer)
      );

      // Solicitar assinatura via Phantom
      const signedTransaction = await phantomWallet.signTransaction(transaction);

      setStatus('Enviando transação assinada...');

      // 3. Enviar transação assinada para o backend processar
      const processResponse = await fetch('/api/investment/process-signed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction: signedTransaction.serialize().toString('base64'),
          description: result.data.description || `Investimento na pool ${pool.tokenA}/${pool.tokenB}`
        }),
      });

      const processResult = await processResponse.json();

      if (!processResult.success) {
        throw new Error(processResult.error || 'Falha ao processar transação');
      }

      setStatus('Investimento executado com sucesso!');
      onSuccess?.(processResult.data.signature);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setStatus(`Erro: ${errorMessage}`);
      onError?.(errorMessage);
      console.error('Erro no investimento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">
        Investir na Pool {pool.tokenA}/{pool.tokenB}
      </h3>

      <div className="space-y-4">
        {/* Informações da Pool */}
        <div className="bg-gray-50 p-3 rounded">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">TVL:</span>
              <span className="ml-2 font-medium">${pool.tvl.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">APY:</span>
              <span className="ml-2 font-medium text-green-600">{pool.apy}%</span>
            </div>
          </div>
        </div>

        {/* Valor do Investimento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade SOL
          </label>
          <input
            type="number"
            value={solAmount}
            onChange={(e) => setSolAmount(e.target.value)}
            min="0.001"
            step="0.001"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0.1"
            disabled={loading}
          />
        </div>

        {/* Slippage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slippage (%)
          </label>
          <select
            value={slippage}
            onChange={(e) => setSlippage(parseFloat(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={loading}
          >
            <option value={0.1}>0.1%</option>
            <option value={0.5}>0.5%</option>
            <option value={1.0}>1.0%</option>
            <option value={2.0}>2.0%</option>
            <option value={5.0}>5.0%</option>
          </select>
        </div>

        {/* Status */}
        {status && (
          <div className={`p-3 rounded-lg text-sm ${
            status.includes('Erro') 
              ? 'bg-red-100 text-red-800' 
              : status.includes('sucesso')
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {status}
          </div>
        )}

        {/* Botão de Investimento */}
        <button
          onClick={handleInvest}
          disabled={loading || !solAmount || parseFloat(solAmount) <= 0}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 
                     text-white font-medium py-3 px-4 rounded-lg transition-colors
                     disabled:cursor-not-allowed"
        >
          {loading ? 'Processando...' : `Investir ${solAmount} SOL`}
        </button>

        {/* Informações Adicionais */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Transação será assinada via Phantom Wallet</p>
          <p>• Investimento será dividido 50/50 entre {pool.tokenA} e {pool.tokenB}</p>
          <p>• Taxas da rede Solana aplicáveis</p>
        </div>
      </div>
    </div>
  );
}