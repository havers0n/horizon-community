import React, { useEffect, useRef, ReactNode } from 'react';
import { useTheme } from '@/shared/contexts/ThemeContext';

interface ThemeWrapperProps {
  children: ReactNode;
  layer?: 'card' | 'button' | 'input';
  className?: string;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ 
  children, 
  layer = 'card',
  className = '' 
}) => {
  const { currentPreset, getThemeConfig, applyThemeToElement } = useTheme();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      // Применяем тему к текущему элементу
      applyThemeToElement(wrapperRef.current, layer);
      
      // Добавляем data-атрибут для автоматического применения темы
      wrapperRef.current.setAttribute('data-theme-layer', layer);
      
      // Применяем тему ко всем дочерним элементам с data-атрибутами
      const childElements = wrapperRef.current.querySelectorAll('[data-theme-layer]');
      childElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          const childLayer = element.getAttribute('data-theme-layer') as 'card' | 'button' | 'input';
          applyThemeToElement(element, childLayer);
        }
      });
    }
  }, [currentPreset, layer, applyThemeToElement]);

  return (
    <div 
      ref={wrapperRef}
      className={className}
      data-theme-layer={layer}
    >
      {children}
    </div>
  );
};

// Специализированные обертки для разных типов компонентов
export const CardThemeWrapper: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <ThemeWrapper layer="card" className={className}>
    {children}
  </ThemeWrapper>
);

export const ButtonThemeWrapper: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <ThemeWrapper layer="button" className={className}>
    {children}
  </ThemeWrapper>
);

export const InputThemeWrapper: React.FC<{ children: ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => (
  <ThemeWrapper layer="input" className={className}>
    {children}
  </ThemeWrapper>
);
