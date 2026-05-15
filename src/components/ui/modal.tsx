import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ZAKEVENTS Modal — Unified Design System
 * Radius: 16px
 * Backdrop: blur + dark overlay
 * Actions: center-aligned
 * Animation: scale + fade with zakevents curve
 */

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

function Modal({ open, onClose, children, className }: ModalProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
      document.addEventListener('keydown', handler)
      return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', handler) }
    }
    document.body.style.overflow = ''
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-[var(--color-secondary)]/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-[var(--radius-xl)] bg-white p-6 shadow-[var(--shadow-lg)] animate-in fade-in zoom-in-95",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-4", className)} {...props} />
}

function ModalTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("font-serif text-xl font-bold text-[var(--color-foreground)]", className)} {...props} />
}

function ModalDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("mt-1 text-sm text-[var(--color-muted)]", className)} {...props} />
}

function ModalContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("", className)} {...props} />
}

function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-6 flex items-center justify-center gap-3", className)} {...props} />
}

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter }
