import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/types";

interface Props { notifications: Notification[]; onMarkRead?: (id: string) => void; }

export function NotificationDropdown({ notifications, onMarkRead }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2">
        <Bell className="w-5 h-5" />
        {unread > 0 && <span className="absolute -top-0.5 -end-0.5 w-4 h-4 bg-[var(--color-primary)] text-white text-[9px] rounded-full flex items-center justify-center">{unread}</span>}
      </button>
      {open && (
        <div className="absolute end-0 top-full mt-2 w-80 border border-[var(--color-border)] bg-white shadow-[var(--shadow-lg)] z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-[var(--color-border)] flex justify-between items-center">
            <span className="text-sm font-medium">{t("components.notifications.title")}</span>
            <Button variant="ghost" size="sm" className="text-xs text-[var(--color-primary)]">{t("components.notifications.markAllRead")}</Button>
          </div>
          {notifications.length === 0 ? (
            <p className="p-6 text-center text-sm text-[var(--color-muted)]">{t("components.notifications.empty")}</p>
          ) : (
            notifications.slice(0, 10).map(n => (
              <button key={n.id} onClick={() => onMarkRead?.(n.id)} className={`w-full p-3 text-start border-b border-[var(--color-border)] last:border-0 ${n.is_read ? "" : "bg-[var(--color-primary)]/5"}`}>
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="text-xs text-[var(--color-muted)] mt-0.5">{n.body}</p>}
                <p className="text-[10px] text-[var(--color-muted)] mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
