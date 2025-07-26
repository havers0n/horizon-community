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
  console.log('LazyPage: render', component);
  const LazyComponent = lazy(component);
  // Обёртка для логирования монтирования ленивого компонента
  const WrappedLazyComponent = (props: any) => {
    console.log('LazyPage: LazyComponent mounted', component);
    return <LazyComponent {...props} />;
  };
  return (
    <Suspense fallback={fallback}>
      <WrappedLazyComponent />
    </Suspense>
  );
} 