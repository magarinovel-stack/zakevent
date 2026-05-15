import * as React from "react"
import { cn } from "@/lib/utils"
import { colors, chartColors } from "@/lib/design-tokens"

/**
 * ZAKEVENTS Chart Wrapper — Unified Design System
 * Positive: Sage Green #6A9E7F
 * Negative: Terracotta #D4816A
 * Neutral: Gold #C49A3C
 *
 * Use CHART_COLORS in all Recharts components for consistency.
 */

export const CHART_COLORS = {
  positive: chartColors.positive,
  negative: chartColors.negative,
  neutral: chartColors.neutral,
  primary: colors.primary,
  secondary: colors.secondary,
  muted: colors.muted,
  series: [
    colors.primary,
    colors.success,
    colors.accent,
    colors.secondary,
    colors.error,
  ],
} as const

interface ChartWrapperProps extends React.ComponentProps<"div"> {
  title?: string
  description?: string
}

function ChartWrapper({ title, description, className, children, ...props }: ChartWrapperProps) {
  return (
    <div
      data-slot="chart-wrapper"
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-6",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-sm font-medium text-[var(--color-foreground)]">{title}</h3>}
          {description && <p className="text-xs text-[var(--color-muted)] mt-0.5">{description}</p>}
        </div>
      )}
      <div className="w-full">{children}</div>
    </div>
  )
}

export { ChartWrapper }
