import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ZAKEVENTS SectionHeading — Unified Design System
 * Consistent heading pattern: eyebrow + title + description
 * Uses Playfair Display for titles, DM Sans for body.
 */
interface SectionHeadingProps extends React.ComponentProps<"div"> {
  eyebrow?: string
  title: string
  description?: string
  align?: "left" | "center"
}

function SectionHeading({ eyebrow, title, description, align = "left", className, ...props }: SectionHeadingProps) {
  return (
    <div
      data-slot="section-heading"
      className={cn("mb-8", align === "center" && "text-center", className)}
      {...props}
    >
      {eyebrow && (
        <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-[var(--color-muted)] block mb-2">
          {eyebrow}
        </span>
      )}
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-foreground)] tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-[var(--color-muted)] max-w-2xl">
          {description}
        </p>
      )}
    </div>
  )
}

export { SectionHeading }
