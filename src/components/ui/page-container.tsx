import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ZAKEVENTS PageContainer — Unified Design System
 * Consistent page wrapper: max-width, padding, background
 * Ensures every page has the same rhythm.
 */
function PageContainer({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="page-container"
      className={cn("min-h-screen bg-[var(--color-background)] pt-32 pb-24 px-6 md:px-12", className)}
      {...props}
    />
  )
}

function PageSection({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="page-section"
      className={cn("max-w-[1400px] mx-auto", className)}
      {...props}
    />
  )
}

export { PageContainer, PageSection }
