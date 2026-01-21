"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
>(({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            data-state={checked ? "checked" : "unchecked"}
            onClick={() => onCheckedChange?.(!checked)}
            className={cn(
                "peer h-4 w-4 shrink-0 rounded-sm border border-zinc-200 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-zinc-50 dark:border-zinc-800 dark:focus-visible:ring-zinc-300 dark:data-[state=checked]:bg-zinc-50 dark:data-[state=checked]:text-zinc-900 flex items-center justify-center",
                className
            )}
            ref={ref}
            {...props}
        >
            {checked && <Check className="h-3 w-3" />}
        </button>
    )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
