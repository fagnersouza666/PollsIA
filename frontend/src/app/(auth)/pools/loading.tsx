import { Spinner } from '@/components/ui/spinner';

export default function PoolsLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
                {/* Header skeleton */}
                <div className="space-y-2">
                    <div className="h-8 bg-muted rounded-md w-48 animate-pulse" />
                    <div className="h-4 bg-muted rounded-md w-96 animate-pulse" />
                </div>

                {/* Filters skeleton */}
                <div className="flex gap-4">
                    <div className="h-10 bg-muted rounded-md w-32 animate-pulse" />
                    <div className="h-10 bg-muted rounded-md w-32 animate-pulse" />
                    <div className="h-10 bg-muted rounded-md w-32 animate-pulse" />
                </div>

                {/* Pool cards skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="border rounded-lg p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                                <div className="h-6 bg-muted rounded-md w-24 animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
                                <div className="h-4 bg-muted rounded-md w-3/4 animate-pulse" />
                            </div>
                            <div className="flex justify-between">
                                <div className="h-4 bg-muted rounded-md w-16 animate-pulse" />
                                <div className="h-4 bg-muted rounded-md w-20 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Loading indicator */}
                <div className="flex justify-center py-8">
                    <div className="flex items-center space-x-2">
                        <Spinner />
                        <span className="text-muted-foreground">Carregando pools...</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 