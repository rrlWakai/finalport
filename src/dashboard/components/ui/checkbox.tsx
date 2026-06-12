import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-outline/60 text-primary focus:ring-1 focus:ring-primary/30 focus:outline-none cursor-pointer accent-primary',
        className,
      )}
      {...props}
    />
  ),
);
Checkbox.displayName = 'Checkbox';
