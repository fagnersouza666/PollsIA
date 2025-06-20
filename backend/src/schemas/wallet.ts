import { z } from 'zod';

export const walletConnectSchema = z.object({
  publicKey: z.string().min(32, 'Invalid public key').max(50, 'Public key too long'),
  signature: z.string().min(1, 'Signature is required'),
});

export const publicKeyParamSchema = z.object({
  publicKey: z.string().min(32, 'Invalid public key').max(50, 'Public key too long'),
});

export type WalletConnectRequest = z.infer<typeof walletConnectSchema>;
export type PublicKeyParam = z.infer<typeof publicKeyParamSchema>;