import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
          {
            "border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80": variant === "default",
            "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80": variant === "secondary",
            "border-transparent bg-red-500 text-zinc-50 hover:bg-red-500/80": variant === "destructive",
            "text-zinc-950": variant === "outline",
            "border-transparent bg-green-500 text-zinc-50 hover:bg-green-500/80": variant === "success",
            "border-transparent bg-yellow-500 text-zinc-50 hover:bg-yellow-500/80": variant === "warning",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
