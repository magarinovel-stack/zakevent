import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props { icon: LucideIcon; title: string; description: string; actionLabel?: string; onAction?: () => void; }

export function EmptyStateWithCTA({ icon: Icon, title, description, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--color-border)]/50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[var(--color-muted)]" />
      </div>
      <h3 className="font-medium text-lg mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-muted)] max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]">{actionLabel}</Button>
      )}
    </div>
  );
}
