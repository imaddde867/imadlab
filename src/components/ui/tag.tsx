import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tagVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-3 py-1 text-xs font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-white/10 border-white/20 text-white",
        subtle: "bg-white/5 border-white/10 text-white/80",
        outline: "bg-transparent border-white/25 text-white/80 hover:bg-white/5",
        neutral: "bg-white/10 border-white/20 text-white/90",
        accent: "bg-sky-500/20 border-sky-400/40 text-sky-100",
        success: "bg-emerald-500/20 border-emerald-400/40 text-emerald-100",
        warning: "bg-amber-500/20 border-amber-400/40 text-amber-100",
        danger: "bg-rose-500/20 border-rose-400/40 text-rose-100",
        info: "bg-indigo-500/20 border-indigo-400/40 text-indigo-100",
      },
      size: {
        xs: "px-2.5 py-0.5 text-[11px]",
        sm: "px-3 py-1 text-xs",
        md: "px-3.5 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  asChild?: boolean
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span"
    return (
      <Comp
        ref={ref}
        className={cn(tagVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

Tag.displayName = "Tag"
