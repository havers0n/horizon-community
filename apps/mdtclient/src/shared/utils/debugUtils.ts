/**
 * Утилиты для отладки и мониторинга бесконечных циклов в React
 */

import { useRef, useEffect } from 'react';

// Хук для отслеживания количества рендеров
export const useRenderCounter = (componentName: string, dependencies: any[] = []) => {
  const renderCount = useRef(0);
  const dependencyHash = useRef<string>('');

  useEffect(() => {
    renderCount.current += 1;
    dependencyHash.current = JSON.stringify(dependencies);
    
    console.log(`[${componentName}] Render #${renderCount.current}`, {
      dependencies,
      dependencyHash: dependencyHash.current
    });
  });

  return renderCount.current;
};

// Функция для проверки стабильности зависимостей
export const checkDependenciesStability = (dependencies: any[], componentName: string) => {
  const currentHash = JSON.stringify(dependencies);
  
  // Сохраняем предыдущий хеш в localStorage для сравнения
  const storageKey = `${componentName}_deps_hash`;
  const previousHash = localStorage.getItem(storageKey);
  
  if (previousHash && previousHash !== currentHash) {
    console.log(`[${componentName}] Dependencies changed:`, {
      previous: JSON.parse(previousHash),
      current: dependencies
    });
  }
  
  localStorage.setItem(storageKey, currentHash);
};

// Утилита для логирования состояния компонента
export const logComponentState = (componentName: string, state: any) => {
  console.log(`[${componentName}] State:`, state);
};

// Утилита для отслеживания производительности
export const usePerformanceTracker = (componentName: string) => {
  const startTime = useRef<number>(0);
  
  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime.current;
      
      if (duration > 16) { // Больше одного кадра (60fps)
        console.warn(`[${componentName}] Slow render detected: ${duration.toFixed(2)}ms`);
      }
    };
  });
}; 