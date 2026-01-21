import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/90 text-primary-foreground hover:bg-primary/80",
        secondary: "border-white/[0.08] bg-white/[0.06] text-white/80 hover:bg-white/[0.1]",
        destructive: "border-transparent bg-destructive/90 text-destructive-foreground hover:bg-destructive/80",
        outline: "border-white/[0.1] text-foreground bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
