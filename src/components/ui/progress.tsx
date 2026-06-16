import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: "primary" | "accent" | "success" | "error";
}

function Progress({ value, max = 100, color = "primary", className, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    primary: "bg-primary",
    accent: "bg-accent",
    success: "bg-success",
    error: "bg-error",
  };

  return (
    <div
      className={cn("w-full h-2 rounded-full bg-surface-2 overflow-hidden", className)}
      {...props}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", colors[color])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export { Progress };
