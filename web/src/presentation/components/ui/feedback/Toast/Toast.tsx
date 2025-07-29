import React from 'react';
import { cn } from '../../../../../application/utils/cn';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '../../core/Button';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
}

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  duration?: number | null;
  onClose?: () => void;
  action?: ToastAction;
  showIcon?: boolean;
  className?: string;
  id?: string;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({
    title,
    description,
    variant = 'default',
    duration = 5000,
    onClose,
    action,
    showIcon = true,
    className,
    id,
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const [isExiting, setIsExiting] = React.useState(false);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

    React.useEffect(() => {
      if (duration && duration > 0) {
        timeoutRef.current = setTimeout(() => {
          handleClose();
        }, duration);
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [duration]);

    const handleClose = () => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 150); // Animation duration
    };

    const variantStyles = {
      default: {
        container: 'bg-background border-border',
        icon: 'text-foreground',
        IconComponent: Info
      },
      success: {
        container: 'bg-success/10 border-success/20',
        icon: 'text-success',
        IconComponent: CheckCircle
      },
      warning: {
        container: 'bg-warning/10 border-warning/20',
        icon: 'text-warning',
        IconComponent: AlertTriangle
      },
      destructive: {
        container: 'bg-destructive/10 border-destructive/20',
        icon: 'text-destructive',
        IconComponent: AlertCircle
      },
      info: {
        container: 'bg-primary/10 border-primary/20',
        icon: 'text-primary',
        IconComponent: Info
      }
    };

    const currentVariant = variantStyles[variant];
    const IconComponent = currentVariant.IconComponent;

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        id={id}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'relative flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-150',
          'animate-in slide-in-from-right-full',
          isExiting && 'animate-out slide-out-to-right-full',
          currentVariant.container,
          className
        )}
        {...props}
      >
        {showIcon && (
          <div className="flex-shrink-0 mt-0.5">
            <IconComponent className={cn('h-5 w-5', currentVariant.icon)} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-semibold text-foreground mb-1">
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm text-muted-foreground">
              {description}
            </div>
          )}
          {action && (
            <div className="mt-3">
              <Button
                size="sm"
                variant={action.variant || 'outline'}
                onClick={action.onClick}
                className="h-8"
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// Toast Provider Context
interface ToastContextType {
  toasts: (ToastProps & { id: string })[];
  addToast: (toast: Omit<ToastProps, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  position = 'top-right'
}) => {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    return id;
  }, [maxToasts]);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <div
        className={cn(
          'fixed z-50 flex flex-col gap-2 pointer-events-none',
          positionClasses[position]
        )}
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              {...toast}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export { Toast }; 