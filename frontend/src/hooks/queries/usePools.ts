import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../services/service-provider';
import { 
  GetPoolsQuery, 
  CreatePoolRequest, 
  AddLiquidityRequest, 
  RemoveLiquidityRequest 
} from '../../services/types/pool.types';
import { ApiError, getErrorMessage } from '../../utils/errors';

export const usePools = (query?: GetPoolsQuery) => {
  const { poolService } = useServices();

  return useQuery({
    queryKey: ['pools', query],
    queryFn: () => poolService.getPools(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const usePool = (id: string, enabled: boolean = true) => {
  const { poolService } = useServices();

  return useQuery({
    queryKey: ['pool', id],
    queryFn: () => poolService.getPoolById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.statusCode === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useUserPositions = (userPublicKey: string, enabled: boolean = true) => {
  const { poolService } = useServices();

  return useQuery({
    queryKey: ['userPositions', userPublicKey],
    queryFn: () => poolService.getUserPositions(userPublicKey),
    enabled: enabled && !!userPublicKey,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.statusCode === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useCreatePool = () => {
  const { poolService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePoolRequest) => poolService.createPool(data),
    onSuccess: (newPool) => {
      // Invalidate and refetch pools
      queryClient.invalidateQueries({ queryKey: ['pools'] });
      
      // Optimistically update pool cache
      queryClient.setQueryData(['pool', newPool.id], newPool);
    },
    onError: (error) => {
      console.error('Failed to create pool:', getErrorMessage(error));
    },
  });
};

export const useAddLiquidity = () => {
  const { poolService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddLiquidityRequest) => poolService.addLiquidity(data),
    onSuccess: (position) => {
      // Invalidate pools and user positions
      queryClient.invalidateQueries({ queryKey: ['pools'] });
      queryClient.invalidateQueries({ 
        queryKey: ['userPositions', position.userPublicKey] 
      });
      
      // Update specific pool cache
      queryClient.invalidateQueries({ 
        queryKey: ['pool', position.poolId] 
      });
    },
    onError: (error) => {
      console.error('Failed to add liquidity:', getErrorMessage(error));
    },
  });
};

export const useRemoveLiquidity = () => {
  const { poolService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveLiquidityRequest) => poolService.removeLiquidity(data),
    onSuccess: (_, variables) => {
      // Invalidate pools and user positions
      queryClient.invalidateQueries({ queryKey: ['pools'] });
      queryClient.invalidateQueries({ queryKey: ['userPositions'] });
      
      // Update specific pool cache
      queryClient.invalidateQueries({ 
        queryKey: ['pool', variables.poolAddress] 
      });
    },
    onError: (error) => {
      console.error('Failed to remove liquidity:', getErrorMessage(error));
    },
  });
};