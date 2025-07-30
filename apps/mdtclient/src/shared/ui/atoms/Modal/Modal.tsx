import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        className={cn(
          'relative w-full bg-secondary-900 border border-secondary-700 rounded-lg shadow-xl',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-secondary-700">
            {title && (
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-secondary-700 rounded transition-colors"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5 text-secondary-400" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );

  // Используем Portal для рендера модального окна в body
  return createPortal(modalContent, document.body);
};

// Компоненты для структурирования модального окна
export const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={cn('flex items-center justify-between p-4 border-b border-secondary-700', className)}>
    {children}
  </div>
);

export const ModalTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <h2 className={cn('text-lg font-semibold text-white', className)}>
    {children}
  </h2>
);

export const ModalContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={cn('p-4', className)}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={cn('flex items-center justify-end gap-2 p-4 border-t border-secondary-700', className)}>
    {children}
  </div>
); 
