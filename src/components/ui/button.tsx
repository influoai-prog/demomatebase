'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-60 backdrop-blur-xl border border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white',
  {
    variants: {
      variant: {
        default: '',
        outline: 'bg-transparent text-white hover:bg-white/10',
        ghost: 'bg-transparent border-transparent hover:bg-white/10 text-white/70',
        destructive: 'border-red-300/30 bg-red-500/20 text-red-100 hover:bg-red-500/30'
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 rounded-full'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref as any} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
