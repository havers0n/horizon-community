import React, { ReactNode } from 'react';

interface PageThemeWrapperProps {
  children: ReactNode;
  className?: string;
}

export const PageThemeWrapper: React.FC<PageThemeWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`page-theme-wrapper relative z-10 ${className}`}>
      {children}
    </div>
  );
};
