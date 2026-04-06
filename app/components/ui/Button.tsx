"use client";

import { cn } from "@/app/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors duration-200 rounded-[12px] focus-visible:outline-2 focus-visible:outline-soft-blue disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-soft-blue text-white hover:bg-soft-blue/80 active:bg-soft-blue/70",
    secondary: "bg-amber text-deep-black hover:bg-amber/80 active:bg-amber/70",
    outline:
      "bg-transparent border border-muted text-off-white hover:bg-dark-navy active:bg-navy",
    ghost: "bg-transparent text-gray hover:text-off-white hover:bg-dark-navy",
  };

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  };

  return (
    <button
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}
