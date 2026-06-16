import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full h-10 rounded-xl border border-border bg-surface px-4 text-sm text-text",
              "placeholder:text-text-dim",
              "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon && "pl-10",
              error && "border-error focus:border-error focus:ring-error/30",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
