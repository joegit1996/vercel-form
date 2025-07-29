import React from 'react';
import { cn } from '../../../../../application/utils/cn';

export interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  alignOffset?: number;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  modal?: boolean;
  className?: string;
  contentClassName?: string;
  arrowClassName?: string;
  triggerClassName?: string;
}

const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  ({
    children,
    content,
    open,
    defaultOpen = false,
    onOpenChange,
    side = 'bottom',
    align = 'center',
    sideOffset = 8,
    alignOffset = 0,
    closeOnClickOutside = true,
    closeOnEscape = true,
    modal = false,
    className,
    contentClassName,
    arrowClassName,
    triggerClassName,
    ...props
  }) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const isControlled = open !== undefined;
    const currentOpen = isControlled ? open : isOpen;

    const setOpen = React.useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setIsOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    }, [isControlled, onOpenChange]);

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

      // Calculate base position
      switch (side) {
        case 'top':
          x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
          y = triggerRect.top - contentRect.height - sideOffset;
          break;
        case 'bottom':
          x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
          y = triggerRect.bottom + sideOffset;
          break;
        case 'left':
          x = triggerRect.left - contentRect.width - sideOffset;
          y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          break;
        case 'right':
          x = triggerRect.right + sideOffset;
          y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          break;
      }

      // Apply alignment
      if (side === 'top' || side === 'bottom') {
        switch (align) {
          case 'start':
            x = triggerRect.left + alignOffset;
            break;
          case 'end':
            x = triggerRect.right - contentRect.width - alignOffset;
            break;
          case 'center':
            x += alignOffset;
            break;
        }
      } else {
        switch (align) {
          case 'start':
            y = triggerRect.top + alignOffset;
            break;
          case 'end':
            y = triggerRect.bottom - contentRect.height - alignOffset;
            break;
          case 'center':
            y += alignOffset;
            break;
        }
      }

      // Keep within viewport
      x = Math.max(8, Math.min(x, viewport.width - contentRect.width - 8));
      y = Math.max(8, Math.min(y, viewport.height - contentRect.height - 8));

      setPosition({ x, y });
    }, [side, align, sideOffset, alignOffset]);

    React.useEffect(() => {
      if (currentOpen) {
        calculatePosition();
        window.addEventListener('scroll', calculatePosition);
        window.addEventListener('resize', calculatePosition);

        return () => {
          window.removeEventListener('scroll', calculatePosition);
          window.removeEventListener('resize', calculatePosition);
        };
      }
      
      return undefined;
    }, [currentOpen, calculatePosition]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          closeOnClickOutside &&
          currentOpen &&
          contentRef.current &&
          triggerRef.current &&
          !contentRef.current.contains(event.target as Node) &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && closeOnEscape && currentOpen) {
          setOpen(false);
        }
      };

      if (currentOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('keydown', handleEscape);
        };
      }
      
      return undefined;
    }, [currentOpen, closeOnClickOutside, closeOnEscape, setOpen]);

    React.useEffect(() => {
      if (modal && currentOpen) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = '';
        };
      }
      
      return undefined;
    }, [modal, currentOpen]);

    const handleTriggerClick = () => {
      setOpen(!currentOpen);
    };

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
          onClick={handleTriggerClick}
          className={cn('inline-block cursor-pointer', triggerClassName)}
          {...props}
        >
          {children}
        </div>

        {currentOpen && (
          <>
            {modal && (
              <div className="fixed inset-0 z-40 bg-black/20" />
            )}
            <div
              ref={contentRef}
              role="dialog"
              aria-modal={modal}
              className={cn(
                'fixed z-50 bg-popover text-popover-foreground border rounded-md shadow-lg',
                'animate-in fade-in-0 zoom-in-95',
                'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
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
          </>
        )}
      </>
    );
  }
);

Popover.displayName = 'Popover';

// Popover Content Component
export interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

export const PopoverContent: React.FC<PopoverContentProps> = ({ children, className }) => (
  <div className={cn('p-4', className)}>
    {children}
  </div>
);

// Popover Header Component
export interface PopoverHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const PopoverHeader: React.FC<PopoverHeaderProps> = ({ children, className }) => (
  <div className={cn('pb-3 border-b border-border', className)}>
    {children}
  </div>
);

// Popover Title Component
export interface PopoverTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const PopoverTitle: React.FC<PopoverTitleProps> = ({ children, className }) => (
  <h4 className={cn('font-medium leading-none', className)}>
    {children}
  </h4>
);

// Popover Description Component
export interface PopoverDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const PopoverDescription: React.FC<PopoverDescriptionProps> = ({ children, className }) => (
  <p className={cn('text-sm text-muted-foreground mt-1', className)}>
    {children}
  </p>
);

// Popover Footer Component
export interface PopoverFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const PopoverFooter: React.FC<PopoverFooterProps> = ({ children, className }) => (
  <div className={cn('pt-3 border-t border-border flex justify-end space-x-2', className)}>
    {children}
  </div>
);

export { Popover }; 