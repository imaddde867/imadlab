import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { tagVariants, type TagVariantProps } from "./tag.utils"

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    TagVariantProps {
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
