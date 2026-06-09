import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <button
      className={cn(
        "glass-button",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"
