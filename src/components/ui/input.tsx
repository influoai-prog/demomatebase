import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'h-11 w-full rounded-full border border-white/20 bg-white/5 px-5 text-sm text-white/90 placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/40',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
