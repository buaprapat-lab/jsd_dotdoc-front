import React from 'react';
import { cn } from './Button';

export const Badge = ({ className, children, ...props }) => {
  return (
    <div className={cn("inline-flex items-center border border-neutral-200 bg-white/60 text-neutral-700 rounded-full px-2.5 py-0.5 text-xs font-mono font-medium transition-colors", className)} {...props}>
      {children}
    </div>
  )
}
