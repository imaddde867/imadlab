import { cva } from "class-variance-authority";

export const navigationMenuTriggerStyle = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {},
    defaultVariants: {},
  }
);
