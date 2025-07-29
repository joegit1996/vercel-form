import React from 'react';
import { cn } from '../../../../../application/utils/cn';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  skipDelayDuration?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  arrowClassName?: string;
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({
    children,
    content,
    side = 'top',
    align = 'center',
    delayDuration = 700,
    skipDelayDuration = 300,
    disabled = false,
    className,
    contentClassName,
    arrowClassName,
    ...props
  }) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    const [isVisible, setIsVisible] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const timeoutRef = React.useRef<number>();
    const skipTimeoutRef = React.useRef<number>();
    const lastHideTime = React.useRef<number>(0);

    const calculatePosition = React.useCallback(() => {
      if (!triggerRef.current || !contentRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let x = 0;
      let y = 0;
      const offset = 8; // Distance from trigger

      // Calculate base position
      switch (side) {
        case 'top':
          x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
          y = triggerRect.top - contentRect.height - offset;
          break;
        case 'bottom':
          x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
          y = triggerRect.bottom + offset;
          break;
        case 'left':
          x = triggerRect.left - contentRect.width - offset;
          y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          break;
        case 'right':
          x = triggerRect.right + offset;
          y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          break;
      }

      // Apply alignment
      if (side === 'top' || side === 'bottom') {
        switch (align) {
          case 'start':
            x = triggerRect.left;
            break;
          case 'end':
            x = triggerRect.right - contentRect.width;
            break;
        }
      } else {
        switch (align) {
          case 'start':
            y = triggerRect.top;
            break;
          case 'end':
            y = triggerRect.bottom - contentRect.height;
            break;
        }
      }

      // Keep within viewport
      x = Math.max(8, Math.min(x, viewport.width - contentRect.width - 8));
      y = Math.max(8, Math.min(y, viewport.height - contentRect.height - 8));

      setPosition({ x, y });
    }, [side, align]);

    const showTooltip = React.useCallback(() => {
      if (disabled) return;

      const now = Date.now();
      const timeSinceHide = now - lastHideTime.current;
      const delay = timeSinceHide < skipDelayDuration ? 0 : delayDuration;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, delay);
    }, [disabled, delayDuration, skipDelayDuration]);

    const hideTooltip = React.useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        lastHideTime.current = Date.now();
      }, 150);
    }, []);

    React.useEffect(() => {
      if (isVisible) {
        calculatePosition();
        window.addEventListener('scroll', calculatePosition);
        window.addEventListener('resize', calculatePosition);

        return () => {
          window.removeEventListener('scroll', calculatePosition);
          window.removeEventListener('resize', calculatePosition);
        };
      }
      
      return undefined;
    }, [isVisible, calculatePosition]);

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (skipTimeoutRef.current) {
          clearTimeout(skipTimeoutRef.current);
        }
      };
    }, []);

    const getArrowClasses = () => {
      const base = 'absolute w-2 h-2 bg-popover border rotate-45';
      
      switch (side) {
        case 'top':
          return cn(base, 'bottom-[-4px] left-1/2 transform -translate-x-1/2 border-t-0 border-l-0');
        case 'bottom':
          return cn(base, 'top-[-4px] left-1/2 transform -translate-x-1/2 border-b-0 border-r-0');
        case 'left':
          return cn(base, 'right-[-4px] top-1/2 transform -translate-y-1/2 border-l-0 border-b-0');
        case 'right':
          return cn(base, 'left-[-4px] top-1/2 transform -translate-y-1/2 border-r-0 border-t-0');
        default:
          return base;
      }
    };

    return (
      <>
        <div
          ref={triggerRef}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          onFocus={showTooltip}
          onBlur={hideTooltip}
          className={cn('inline-block', className)}
          {...props}
        >
          {children}
        </div>

        {isVisible && (
          <div
            ref={contentRef}
            role="tooltip"
            className={cn(
              'fixed z-50 px-3 py-1.5 text-sm bg-popover text-popover-foreground border rounded-md shadow-md transition-all duration-150',
              'pointer-events-none select-none',
              isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
              contentClassName
            )}
            style={{
              left: position.x,
              top: position.y
            }}
          >
            {content}
            <div className={cn(getArrowClasses(), arrowClassName)} />
          </div>
        )}
      </>
    );
  }
);

Tooltip.displayName = 'Tooltip';

// Tooltip Provider for managing global state
interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
}

const TooltipContext = React.createContext<{
  delayDuration: number;
  skipDelayDuration: number;
}>({
  delayDuration: 700,
  skipDelayDuration: 300
});

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  delayDuration = 700,
  skipDelayDuration = 300
}) => {
  return (
    <TooltipContext.Provider value={{ delayDuration, skipDelayDuration }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const useTooltip = () => {
  return React.useContext(TooltipContext);
};

export { Tooltip }; 