'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function PoolsError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Pools page error:', error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto text-center space-y-6">
                <div className="flex justify-center">
                    <AlertCircle className="h-16 w-16 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">
                        Erro ao carregar pools
                    </h1>
                    <p className="text-muted-foreground">
                        Não foi possível carregar a lista de pools. Verifique sua conexão e tente novamente.
                    </p>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-muted p-4 rounded-md text-left">
                        <p className="text-sm font-mono text-muted-foreground">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex gap-4 justify-center">
                    <Button onClick={reset} variant="default">
                        Tentar novamente
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/dashboard'}
                        variant="outline"
                    >
                        Voltar ao dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
} 