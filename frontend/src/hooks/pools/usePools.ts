import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface Pool {
    id: string;
    name: string;
    tokenA: string;
    tokenB: string;
    tvl: number;
    apr: number;
    volume24h: number;
    fees24h: number;
    isActive: boolean;
}

interface PoolFilters {
    search?: string;
    minTvl?: number;
    maxTvl?: number;
    minApr?: number;
    maxApr?: number;
    isActive?: boolean;
}

interface CreatePoolData {
    tokenA: string;
    tokenB: string;
    fee: number;
    initialPrice: number;
    name?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API functions
async function fetchPools(filters?: PoolFilters): Promise<Pool[]> {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.minTvl) params.append('minTvl', filters.minTvl.toString());
    if (filters?.maxTvl) params.append('maxTvl', filters.maxTvl.toString());
    if (filters?.minApr) params.append('minApr', filters.minApr.toString());
    if (filters?.maxApr) params.append('maxApr', filters.maxApr.toString());
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const url = `${API_BASE_URL}/api/pools/discover?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch pools: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
}

async function fetchPoolById(id: string): Promise<Pool> {
    const url = `${API_BASE_URL}/api/pools/${id}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch pool: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
}

async function createPool(poolData: CreatePoolData): Promise<Pool> {
    const url = `${API_BASE_URL}/api/pools`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(poolData),
    });

    if (!response.ok) {
        throw new Error(`Failed to create pool: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
}

// Hook for fetching pools with filters
export function usePools(filters?: PoolFilters) {
    return useQuery({
        queryKey: ['pools', filters],
        queryFn: () => fetchPools(filters),
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Hook for fetching a single pool
export function usePool(id: string) {
    return useQuery({
        queryKey: ['pool', id],
        queryFn: () => fetchPoolById(id),
        enabled: !!id,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
    });
}

// Hook for creating a new pool
export function useCreatePool() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPool,
        onSuccess: (newPool) => {
            // Invalidate and refetch pools list
            queryClient.invalidateQueries({ queryKey: ['pools'] });

            // Add the new pool to the cache
            queryClient.setQueryData(['pool', newPool.id], newPool);
        },
    });
}

// Hook for pool rankings
export function usePoolRankings() {
    return useQuery({
        queryKey: ['pool-rankings'],
        queryFn: async () => {
            const url = `${API_BASE_URL}/api/pools/rankings`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch rankings: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data || [];
        },
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Hook for pool analytics
export function usePoolAnalytics(poolId: string) {
    return useQuery({
        queryKey: ['pool-analytics', poolId],
        queryFn: async () => {
            const url = `${API_BASE_URL}/api/pools/${poolId}/analytics`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch analytics: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data;
        },
        enabled: !!poolId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}

// Combined hook for pool management
export function usePoolManager() {
    const queryClient = useQueryClient();

    const refreshPools = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['pools'] });
    }, [queryClient]);

    const refreshPool = useCallback((id: string) => {
        queryClient.invalidateQueries({ queryKey: ['pool', id] });
    }, [queryClient]);

    const prefetchPool = useCallback((id: string) => {
        queryClient.prefetchQuery({
            queryKey: ['pool', id],
            queryFn: () => fetchPoolById(id),
            staleTime: 30 * 1000,
        });
    }, [queryClient]);

    return {
        refreshPools,
        refreshPool,
        prefetchPool,
    };
} 