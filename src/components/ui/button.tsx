import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_12px_40px_rgba(32,24,112,0.35)]",
        destructive:
          "bg-rose-500 text-white hover:bg-rose-400 focus-visible:ring-rose-300/80",
        outline:
          "border border-primary/40 bg-background/80 text-white/80 hover:border-primary/60 hover:bg-primary/10 hover:text-white",
        secondary:
          "border border-primary/35 bg-primary/20 text-white hover:border-primary/50 hover:bg-primary/30",
        soft:
          "border border-primary/25 bg-background/70 text-white hover:bg-primary/15 hover:border-primary/40",
        ghost: "text-white/80 hover:text-white hover:bg-white/10",
        inverted:
          "bg-white text-black hover:bg-white/90 shadow-[0_18px_45px_rgba(255,255,255,0.2)]",
        link: "text-white/80 underline-offset-4 hover:text-white hover:underline",
        cta: "relative overflow-hidden border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-primary/15 text-white shadow-[0_22px_60px_rgba(125,121,225,0.28)] transition-all duration-300 hover:from-primary/25 hover:via-primary/10 hover:to-primary/25",
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
