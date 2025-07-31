// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../../../shared/lib/utils';
import { ChevronDown } from 'lucide-react';

// Основной Select компонент
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onValueChange, 
  disabled = false,
  children,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={cn('relative', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child as React.ReactElement<SelectTriggerProps>, {
              isOpen,
              setIsOpen,
              selectedValue,
              disabled
            });
          }
          if (child.type === SelectContent) {
            return React.cloneElement(child as React.ReactElement<SelectContentProps>, {
              isOpen,
              onSelect: handleSelect,
              selectedValue
            });
          }
        }
        return child;
      })}
    </div>
  );
};

// SelectTrigger компонент
interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  selectedValue?: string;
  disabled?: boolean;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ 
  children, 
  className,
  placeholder,
  isOpen,
  setIsOpen,
  selectedValue,
  disabled = false
}) => {
  return (
    <button
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => !disabled && setIsOpen?.(!isOpen)}
      disabled={disabled}
    >
      <span className="flex-1 text-left">
        {selectedValue ? children : placeholder}
      </span>
      <ChevronDown className={cn(
        'h-4 w-4 opacity-50 transition-transform',
        isOpen && 'rotate-180'
      )} />
    </button>
  );
};

// SelectContent компонент
interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  isOpen?: boolean;
  onSelect?: (value: string) => void;
  selectedValue?: string;
}

export const SelectContent: React.FC<SelectContentProps> = ({ 
  children, 
  className,
  isOpen,
  onSelect,
  selectedValue
}) => {
  if (!isOpen) return null;

  return (
    <div className={cn(
      'absolute top-full z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md',
      className
    )}>
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === SelectItem) {
              return React.cloneElement(child as React.ReactElement<SelectItemProps>, {
                onSelect,
                isSelected: child.props.value === selectedValue
              });
            }
          }
          return child;
        })}
      </div>
    </div>
  );
};

// SelectItem компонент
interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onSelect?: (value: string) => void;
  isSelected?: boolean;
}

export const SelectItem: React.FC<SelectItemProps> = ({ 
  value, 
  children, 
  className,
  onSelect,
  isSelected = false
}) => {
  return (
    <button
      type="button"
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        isSelected && 'bg-accent text-accent-foreground',
        className
      )}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </button>
  );
};

// SelectValue компонент
interface SelectValueProps {
  children: React.ReactNode;
  placeholder?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ 
  children, 
  placeholder 
}) => {
  return (
    <span>
      {children || placeholder}
    </span>
  );
};
