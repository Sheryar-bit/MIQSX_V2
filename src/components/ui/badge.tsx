import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-primary/10 text-primary-light border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-accent/10 text-accent border-accent/20",
    error: "bg-error/10 text-error border-error/20",
    outline: "bg-transparent text-text-muted border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
