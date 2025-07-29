import React from 'react';
import { cn } from '../../../../../application/utils/cn';
import { Button } from '../../core/Button';
import { Badge } from '../../core/Badge';
import { Menu, X, ChevronDown } from 'lucide-react';

export interface NavigationItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface NavigationProps {
  logo?: React.ReactNode;
  items?: NavigationItem[];
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'transparent' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  sticky?: boolean;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
}

const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  ({ 
    logo,
    items = [],
    actions,
    className,
    variant = 'default',
    size = 'md',
    sticky = false,
    mobileMenuOpen = false,
    onMobileMenuToggle,
    ...props 
  }, ref) => {
    const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

    const sizeClasses = {
      sm: 'h-12 px-4',
      md: 'h-16 px-6',
      lg: 'h-20 px-8'
    };

    const variantClasses = {
      default: 'bg-background border-b border-border',
      transparent: 'bg-transparent',
      bordered: 'bg-background border border-border rounded-lg shadow-sm'
    };

    const handleDropdownToggle = (itemLabel: string) => {
      setOpenDropdown(openDropdown === itemLabel ? null : itemLabel);
    };

    const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openDropdown === item.label;

      if (hasChildren) {
        return (
          <div key={item.label} className="relative">
            <button
              onClick={() => handleDropdownToggle(item.label)}
              className={cn(
                'flex items-center space-x-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                item.active 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                isMobile && 'w-full justify-between'
              )}
            >
              <span>{item.label}</span>
              {item.badge && (
                <Badge size="sm" variant="destructive" className="ml-1">
                  {item.badge}
                </Badge>
              )}
              <ChevronDown className={cn(
                'h-4 w-4 transition-transform',
                isOpen && 'rotate-180'
              )} />
            </button>
            
            {isOpen && item.children && (
              <div className={cn(
                'absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-50',
                isMobile && 'relative top-0 mt-2 w-full shadow-none border-0 bg-transparent'
              )}>
                {item.children.map((child) => (
                  <button
                    key={child.label}
                    onClick={child.onClick}
                    className={cn(
                      'block w-full text-left px-4 py-2 text-sm transition-colors',
                      child.active 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                      isMobile ? 'pl-6' : 'first:rounded-t-md last:rounded-b-md'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{child.label}</span>
                      {child.badge && (
                        <Badge size="sm" variant="destructive">
                          {child.badge}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }

      return (
        <button
          key={item.label}
          onClick={item.onClick}
          className={cn(
            'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
            item.active 
              ? 'text-primary bg-primary/10' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent',
            isMobile && 'w-full justify-between'
          )}
        >
          <span>{item.label}</span>
          {item.badge && (
            <Badge size="sm" variant="destructive">
              {item.badge}
            </Badge>
          )}
        </button>
      );
    };

    return (
      <nav
        ref={ref}
        className={cn(
          'w-full flex items-center justify-between',
          sizeClasses[size],
          variantClasses[variant],
          sticky && 'sticky top-0 z-40',
          className
        )}
        {...props}
      >
        {/* Logo */}
        <div className="flex items-center">
          {logo}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {items.map((item) => renderNavigationItem(item))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {actions}
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onMobileMenuToggle}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border md:hidden">
            <div className="px-4 py-4 space-y-2">
              {items.map((item) => renderNavigationItem(item, true))}
            </div>
          </div>
        )}
      </nav>
    );
  }
);

Navigation.displayName = 'Navigation';

export { Navigation }; 