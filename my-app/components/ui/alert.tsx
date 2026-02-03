import * as React from "react"
import { VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-11",
  {
    variants: {
      variant: {
        default:
          "bg-background text-foreground border-border",
        info:
          "border-blue-200 text-blue-900 bg-blue-50 dark:border-blue-800 dark:text-blue-200 dark:bg-blue-950 [&>svg]:text-blue-500",
        success:
          "border-green-200 text-green-900 bg-green-50 dark:border-green-800 dark:text-green-200 dark:bg-green-950 [&>svg]:text-green-500",
        warning:
          "border-yellow-200 text-yellow-900 bg-yellow-50 dark:border-yellow-700 dark:text-yellow-100 dark:bg-yellow-950 [&>svg]:text-yellow-500",
        destructive:
          "border-destructive/50 text-destructive bg-destructive/10 dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
