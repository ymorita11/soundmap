"use client";

import { cn } from "@/app/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm text-gray">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            "h-12 w-full rounded-lg bg-dark-navy px-4 text-off-white placeholder:text-muted",
            "border border-transparent transition-colors duration-200",
            "focus:border-soft-blue focus:outline-none",
            error && "border-soft-red",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-soft-red">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
