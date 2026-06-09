import React from 'react';
import { cn } from './Button';

export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "glass-input",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"
