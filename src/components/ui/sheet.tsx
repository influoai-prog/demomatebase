'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = SheetPrimitive.Overlay;
const SheetContentPrimitive = SheetPrimitive.Content;

function SheetOverlayComponent({ className, ...props }: React.ComponentProps<typeof SheetOverlay>) {
  return <SheetOverlay className={cn('fixed inset-0 bg-black/60 backdrop-blur-md', className)} {...props} />;
}

function SheetContent({ className, children, ...props }: React.ComponentProps<typeof SheetContentPrimitive>) {
  return (
    <SheetPortal>
      <SheetOverlayComponent />
      <SheetContentPrimitive
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-white/20 bg-slate-900/70 p-6 backdrop-blur-xl',
          className,
        )}
        {...props}
      >
        <SheetClose className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-1 text-white/70 hover:text-white">
          <X className="h-4 w-4" />
        </SheetClose>
        {children}
      </SheetContentPrimitive>
    </SheetPortal>
  );
}

export { Sheet, SheetTrigger, SheetContent, SheetClose };
