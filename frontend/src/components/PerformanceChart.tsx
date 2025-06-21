'use client'

import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { api } from '../utils/api'
import { useWallet } from '@solana/wallet-adapter-react'

export function PerformanceChart() {
  const { publicKey, connected } = useWallet()
  const walletAddress = connected && publicKey ? publicKey.toBase58() : null

  const { data: performance, isLoading } = useQuery({
    queryKey: ['performance', walletAddress],
    queryFn: () => api.getPerformance(walletAddress!),
    enabled: !!walletAddress,
  })

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Performance Chart</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading chart...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Performance Chart</h3>
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Total Return</p>
            <p className="font-semibold text-green-600">{(performance as any)?.totalReturn}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Alpha</p>
            <p className="font-semibold text-primary-600">{(performance as any)?.alpha}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Max Drawdown</p>
            <p className="font-semibold text-red-600">{(performance as any)?.maxDrawdown}%</p>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={(performance as any)?.history || []}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
              className="text-xs"
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              className="text-xs"
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Sharpe Ratio</p>
            <p className="font-semibold">{(performance as any)?.sharpeRatio}</p>
          </div>
          <div>
            <p className="text-gray-500">Timeframe</p>
            <p className="font-semibold">{(performance as any)?.timeframe}</p>
          </div>
          <div>
            <p className="text-gray-500">Best Day</p>
            <p className="font-semibold text-green-600">+5.2%</p>
          </div>
          <div>
            <p className="text-gray-500">Worst Day</p>
            <p className="font-semibold text-red-600">-3.8%</p>
          </div>
        </div>
      </div>
    </div>
  )
}