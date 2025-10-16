'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = DialogPrimitive.Overlay;
const DialogContent = DialogPrimitive.Content;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

function Overlay({ className, ...props }: React.ComponentProps<typeof DialogOverlay>) {
  return <DialogOverlay className={cn('fixed inset-0 bg-slate-950/70 backdrop-blur-md', className)} {...props} />;
}

function Content({ className, children, ...props }: React.ComponentProps<typeof DialogContent>) {
  return (
    <DialogPortal>
      <Overlay />
      <DialogContent
        className={cn(
          'glass-card fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 border border-white/20 bg-slate-900/70 p-8 shadow-glass',
          className,
        )}
        {...props}
      >
        {children}
        <DialogClose className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-1 text-white/70 hover:text-white">
          <X className="h-4 w-4" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  );
}

const Title = ({ className, ...props }: React.ComponentProps<typeof DialogTitle>) => (
  <DialogTitle className={cn('text-lg font-semibold text-white', className)} {...props} />
);

const Description = ({ className, ...props }: React.ComponentProps<typeof DialogDescription>) => (
  <DialogDescription className={cn('mt-2 text-sm text-white/70', className)} {...props} />
);

export { Dialog, DialogTrigger, DialogClose, Content as DialogContent, Title as DialogTitle, Description as DialogDescription };
