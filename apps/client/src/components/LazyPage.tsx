import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyPageProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
}

const defaultFallback = (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export function LazyPage({ component, fallback = defaultFallback }: LazyPageProps) {
  const LazyComponent = lazy(component);
  
  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
} 