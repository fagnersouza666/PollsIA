import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="lg" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}