import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * ZAKEVENTS Button — Unified Design System
 * 3 sizes: sm (32px) / md (40px) / lg (48px)
 * Radius: 8px always
 * Primary: Gold #C49A3C
 * Secondary: Charcoal #1C1C1E
 * Focus: Gold ring 2px offset 2px
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] active:translate-y-px rounded-[var(--radius-md)] shadow-sm",
        secondary:
          "bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-light)] active:translate-y-px rounded-[var(--radius-md)] shadow-sm",
        outline:
          "border border-[var(--color-border)] bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-background-alt)] active:translate-y-px rounded-[var(--radius-md)]",
        ghost:
          "bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-background-alt)] active:translate-y-px rounded-[var(--radius-md)]",
        destructive:
          "bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90 active:translate-y-px rounded-[var(--radius-md)] shadow-sm",
        link:
          "text-[var(--color-primary)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
