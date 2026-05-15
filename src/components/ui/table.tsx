import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown } from "lucide-react"

/**
 * ZAKEVENTS Table — Unified Design System
 * Row striping: alternating background-alt
 * Touch targets: 48px minimum row height
 * Sortable headers: chevron indicators
 */

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <table data-slot="table" className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead data-slot="table-header" className={cn("bg-[var(--color-background-alt)] border-b border-[var(--color-border)]", className)} {...props} />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody data-slot="table-body" className={cn("[&_tr:nth-child(even)]:bg-[var(--color-background-alt)]/50", className)} {...props} />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot data-slot="table-footer" className={cn("border-t border-[var(--color-border)] bg-[var(--color-background-alt)] font-medium", className)} {...props} />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn("min-h-12 border-b border-[var(--color-border)] last:border-0 transition-colors hover:bg-[var(--color-background-alt)]", className)}
      {...props}
    />
  )
}

function TableHead({
  className,
  sortable,
  sortDirection,
  onSort,
  children,
  ...props
}: React.ComponentProps<"th"> & {
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | null
  onSort?: () => void
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-4 text-left align-middle text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]",
        sortable && "cursor-pointer select-none hover:text-[var(--color-foreground)]",
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && (
          <span className="inline-flex flex-col">
            <ChevronUp className={cn("size-3", sortDirection === 'asc' ? 'text-[var(--color-primary)]' : 'opacity-30')} />
            <ChevronDown className={cn("size-3 -mt-1", sortDirection === 'desc' ? 'text-[var(--color-primary)]' : 'opacity-30')} />
          </span>
        )}
      </span>
    </th>
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td data-slot="table-cell" className={cn("h-12 px-4 align-middle", className)} {...props} />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption data-slot="table-caption" className={cn("mt-4 text-sm text-[var(--color-muted)]", className)} {...props} />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
