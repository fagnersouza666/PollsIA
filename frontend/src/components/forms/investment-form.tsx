'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface InvestmentFormProps {
  poolId?: string
  onSuccess?: (data: any) => void
  onCancel?: () => void
}

export function InvestmentForm({ poolId, onSuccess, onCancel }: InvestmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    strategy: 'balanced',
    slippage: '0.5',
    autoRebalance: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount) {
      newErrors.amount = 'Valor é obrigatório'
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser um número positivo'
    }

    if (!formData.slippage) {
      newErrors.slippage = 'Slippage é obrigatório'
    } else if (isNaN(Number(formData.slippage)) || Number(formData.slippage) < 0 || Number(formData.slippage) > 100) {
      newErrors.slippage = 'Slippage deve ser entre 0 e 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setIsLoading(true)
      
      const investmentData = {
        poolId,
        amount: Number(formData.amount),
        strategy: formData.strategy,
        slippage: Number(formData.slippage) / 100,
        autoRebalance: formData.autoRebalance,
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      onSuccess?.(investmentData)
    } catch (error) {
      setErrors({ submit: 'Erro ao processar investimento. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Investir no Pool</CardTitle>
        <CardDescription>
          Configure seus parâmetros de investimento
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (SOL)</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              placeholder="0.0"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              disabled={isLoading}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="strategy">Estratégia</Label>
            <select
              id="strategy"
              value={formData.strategy}
              onChange={(e) => handleChange('strategy', e.target.value)}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="conservative">Conservador</option>
              <option value="balanced">Equilibrado</option>
              <option value="aggressive">Agressivo</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slippage">Slippage (%)</Label>
            <Input
              id="slippage"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="0.5"
              value={formData.slippage}
              onChange={(e) => handleChange('slippage', e.target.value)}
              disabled={isLoading}
            />
            {errors.slippage && (
              <p className="text-sm text-red-600">{errors.slippage}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRebalance"
              checked={formData.autoRebalance}
              onChange={(e) => handleChange('autoRebalance', e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
            />
            <Label htmlFor="autoRebalance" className="text-sm">
              Rebalanceamento automático
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex space-x-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Processando...' : 'Investir'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}