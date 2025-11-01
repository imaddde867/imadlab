import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_12px_40px_rgba(15,23,42,0.35)]",
        destructive:
          "bg-rose-500 text-white hover:bg-rose-400 focus-visible:ring-rose-300/80",
        outline:
          "border border-white/20 bg-black/60 text-white/80 hover:bg-white/10 hover:text-white",
        secondary:
          "border border-white/20 bg-white/10 text-white hover:bg-white/20",
        soft:
          "border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30",
        ghost: "text-white/70 hover:text-white hover:bg-white/10",
        inverted:
          "bg-white text-black hover:bg-white/90 shadow-[0_18px_45px_rgba(255,255,255,0.2)]",
        link: "text-white/70 underline-offset-4 hover:text-white hover:underline",
        cta: "relative overflow-hidden border border-white/20 bg-gradient-to-r from-white/10 via-white/5 to-white/10 text-white shadow-[0_22px_60px_rgba(59,130,246,0.2)] transition-all duration-300 hover:from-white/20 hover:via-white/10 hover:to-white/20",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4",
        lg: "h-12 px-8",
        pill: "h-12 px-8 rounded-full",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
