import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

/**
 * ZAKEVENTS Timeline — Unified Design System
 * Left border accent: gold
 * Row height: 32px minimum
 * Status badges: consistent across all views
 */

function Timeline({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline"
      className={cn("relative border-l-2 border-[var(--color-primary)] pl-6 space-y-4", className)}
      {...props}
    />
  )
}

function TimelineItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-item"
      className={cn("relative min-h-8 flex items-start gap-3", className)}
      {...props}
    >
      <div className="absolute -left-[31px] top-1 size-3 rounded-full bg-[var(--color-primary)] border-2 border-white" />
      {props.children}
    </div>
  )
}

function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="timeline-content" className={cn("flex-1 pb-2", className)} {...props} />
  )
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="timeline-title" className={cn("text-sm font-medium text-[var(--color-foreground)]", className)} {...props} />
  )
}

function TimelineDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="timeline-description" className={cn("text-xs text-[var(--color-muted)] mt-0.5", className)} {...props} />
  )
}

function TimelineTime({ className, ...props }: React.ComponentProps<"time">) {
  return (
    <time data-slot="timeline-time" className={cn("text-xs text-[var(--color-muted)] whitespace-nowrap", className)} {...props} />
  )
}

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        pending: "bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]",
        active: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
        completed: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
        cancelled: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
        overdue: "bg-[var(--color-accent)]/10 text-[var(--color-accent)]",
      },
    },
    defaultVariants: { status: "pending" },
  }
)

function StatusBadge({
  className,
  status,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof statusBadgeVariants>) {
  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ status, className }))}
      {...props}
    />
  )
}

export { Timeline, TimelineItem, TimelineContent, TimelineTitle, TimelineDescription, TimelineTime, StatusBadge, statusBadgeVariants }
