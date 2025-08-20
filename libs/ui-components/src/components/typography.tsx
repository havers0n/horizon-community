import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"

/*
  Typography components standardized to design tokens
  - No implicit margins to avoid layout drift
  - Colors use Tailwind tokens (bound to CSS variables)
  - Line-heights set for readability
*/

const headingBase = "font-sans font-semibold tracking-tight text-foreground"
const paragraphBase = "font-sans text-foreground"

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>

export const H1 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        headingBase,
        "text-3xl md:text-4xl lg:text-5xl leading-tight",
        className
      )}
      {...props}
    />
  )
)
H1.displayName = "H1"

export const H2 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        headingBase,
        "text-2xl md:text-3xl lg:text-4xl leading-tight",
        className
      )}
      {...props}
    />
  )
)
H2.displayName = "H2"

export const H3 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(headingBase, "text-xl md:text-2xl leading-snug", className)}
      {...props}
    />
  )
)
H3.displayName = "H3"

export const H4 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn(headingBase, "text-lg md:text-xl leading-snug", className)}
      {...props}
    />
  )
)
H4.displayName = "H4"

export const H5 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn(headingBase, "text-base md:text-lg leading-snug", className)}
      {...props}
    />
  )
)
H5.displayName = "H5"

export const H6 = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, ...props }, ref) => (
    <h6
      ref={ref}
      className={cn(headingBase, "text-sm md:text-base leading-snug", className)}
      {...props}
    />
  )
)
H6.displayName = "H6"

export type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>

export const P = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(paragraphBase, "text-base leading-7", className)}
      {...props}
    />
  )
)
P.displayName = "P"

export const Lead = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(paragraphBase, "text-lg leading-8 text-muted-foreground", className)}
      {...props}
    />
  )
)
Lead.displayName = "Lead"

export const Muted = React.forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(paragraphBase, "text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  )
)
Muted.displayName = "Muted"

/*
  Stack – vertical spacing utility to remove manual mt/mb usage
  space: controls consistent inter-block spacing via Tailwind spacing scale
*/
const stackVariants = cva("flex flex-col", {
  variants: {
    space: {
      none: "space-y-0",
      xs: "space-y-1",
      sm: "space-y-2",
      md: "space-y-4",
      lg: "space-y-6",
      xl: "space-y-8",
      "2xl": "space-y-10",
    },
  },
  defaultVariants: {
    space: "md",
  },
})

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, space, ...props }, ref) => (
    <div ref={ref} className={cn(stackVariants({ space }), className)} {...props} />
  )
)
Stack.displayName = "Stack"
