"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "accent" | "destructive" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const variants = {
      default: "bg-primary text-white hover:bg-primary-hover shadow-glow-primary/50",
      outline: "border border-border-light text-text hover:border-primary hover:text-primary bg-transparent",
      ghost: "text-text-muted hover:text-text hover:bg-surface-2 bg-transparent",
      accent: "bg-accent text-background hover:bg-accent-hover font-semibold shadow-glow-accent/50",
      destructive: "bg-error/10 text-error hover:bg-error/20 border border-error/30",
      link: "text-primary underline-offset-4 hover:underline bg-transparent p-0 h-auto",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-lg",
      md: "h-10 px-4 text-sm rounded-xl",
      lg: "h-12 px-6 text-base rounded-xl",
      icon: "h-10 w-10 rounded-xl",
    };

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            {children}
          </>
        ) : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
