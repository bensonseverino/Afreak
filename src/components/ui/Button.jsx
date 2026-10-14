import { forwardRef } from 'react';
import Icon from './Icon';

const Button = forwardRef(function Button({ 
  variant = 'solid', 
  size = 'md', 
  className = '', 
  children, 
  rightIcon,
  leftIcon,
  href,
  disabled,
  ...props 
}, ref) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-sans font-semibold uppercase tracking-label rounded-none transition-all duration-200';
  
  const variants = {
    solid: 'bg-ink text-paper hover:bg-paper hover:text-ink hover:border hover:border-ink',
    outline: 'border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper',
    link: 'bg-transparent text-ink hover:text-ink/70 px-0',
  };
  
  const sizes = {
    sm: 'text-[11px] px-4 py-2',
    md: 'text-xs px-8 py-4',
    lg: 'text-[13px] px-10 py-5',
    full: 'w-full',
  };

  const Component = href ? 'a' : 'button';
  const isLink = variant === 'link';

  return (
    <Component
      ref={ref}
      href={href}
      disabled={disabled && !href}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`.trim()}
      aria-disabled={disabled}
      {...props}
    >
      {leftIcon && <Icon name={leftIcon} size={16} />}
      {children}
      {rightIcon && <Icon name={rightIcon} size={16} />}
      {isLink && rightIcon === undefined && <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />}
    </Component>
  );
});

Button.displayName = 'Button';

export default Button;