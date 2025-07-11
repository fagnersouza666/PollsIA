'use client'

import { useMemo } from 'react'
import { 
  useWalletConnected, 
  useWalletBalance, 
  useWalletTokens, 
  useWalletDeFiPositions,
  useWalletTotalUsdValue,
  useWalletLoadingTokens,
  useWalletLoadingDefi,
  useWalletPublicKey,
  useWallet
} from '@/contexts/wallet-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Wallet, RefreshCw, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function WalletInfo() {
  const { refreshWalletData } = useWallet()
  const connected = useWalletConnected()
  const balance = useWalletBalance()
  const tokens = useWalletTokens()
  const defiPositions = useWalletDeFiPositions()
  const totalUsdValue = useWalletTotalUsdValue()
  const loadingTokens = useWalletLoadingTokens()
  const loadingDefi = useWalletLoadingDefi()
  const publicKey = useWalletPublicKey()
  
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const isLoading = loadingTokens || loadingDefi

  const truncatedAddress = useMemo(() => {
    if (!publicKey) return ''
    const address = publicKey.toString()
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }, [publicKey])

  const handleCopyAddress = async () => {
    if (!publicKey) return
    
    try {
      await navigator.clipboard.writeText(publicKey.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshWalletData()
    } finally {
      setRefreshing(false)
    }
  }

  if (!connected) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Carteira não conectada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Conecte sua carteira para visualizar as informações
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-4xl">
      {/* Wallet Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Carteira Conectada
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Endereço</p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {truncatedAddress}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="h-8 w-8 p-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Valor Total</p>
              <p className="text-2xl font-bold">
                ${totalUsdValue.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SOL Balance */}
      <Card>
        <CardHeader>
          <CardTitle>Saldo SOL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {balance ? balance.toFixed(4) : '0.0000'} SOL
              </p>
            </div>
            <Badge variant="secondary">
              Solana
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Tokens SPL</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTokens ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : tokens.length > 0 ? (
            <div className="space-y-3">
              {tokens.map((token) => (
                <div key={token.mint} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{token.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        {token.mint.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {token.balance.toFixed(4)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${token.usdValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nenhum token encontrado
            </p>
          )}
        </CardContent>
      </Card>

      {/* DeFi Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Posições DeFi</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDefi ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : defiPositions.length > 0 ? (
            <div className="space-y-3">
              {defiPositions.map((position, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        R
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {position.type === 'raydium-clmm' ? 'Raydium CLMM' : 'Raydium AMM'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {position.poolName || 'Pool Position'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {position.balance.toFixed(4)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${position.usdValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Nenhuma posição DeFi encontrada
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}