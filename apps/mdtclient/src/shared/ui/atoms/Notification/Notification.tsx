import React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '../Button';

export type NotificationVariant = 'info' | 'success' | 'warning' | 'error';

export interface NotificationProps {
  variant?: NotificationVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
  persistent?: boolean;
}

const variantStyles = {
  info: {
    container: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    icon: 'text-blue-400',
    iconComponent: Info,
  },
  success: {
    container: 'bg-green-500/20 border-green-500/50 text-green-300',
    icon: 'text-green-400',
    iconComponent: CheckCircle,
  },
  warning: {
    container: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
    icon: 'text-yellow-400',
    iconComponent: AlertTriangle,
  },
  error: {
    container: 'bg-red-500/20 border-red-500/50 text-red-300',
    icon: 'text-red-400',
    iconComponent: AlertCircle,
  },
};

export const Notification: React.FC<NotificationProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  className,
  autoClose = false,
  autoCloseDelay = 5000,
  persistent = false,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const IconComponent = variantStyles[variant].iconComponent;

  React.useEffect(() => {
    if (autoClose && !persistent && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, persistent, isVisible, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border backdrop-blur-sm transition-all duration-300',
        variantStyles[variant].container,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <IconComponent className={cn('w-5 h-5 mt-0.5 flex-shrink-0', variantStyles[variant].icon)} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium text-sm mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {!persistent && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
