import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Check, X } from "lucide-react";

interface Props {
  clientName: string; eventDate: string; createdAt: string;
  onAccept: () => void; onDecline: () => void;
}

export function BookingRequestCard({ clientName, eventDate, createdAt, onAccept, onDecline }: Props) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const deadline = new Date(createdAt).getTime() + 24 * 3600_000;
    const tick = () => {
      const diff = Math.max(0, deadline - Date.now());
      const h = Math.floor(diff / 3600_000); const m = Math.floor((diff % 3600_000) / 60_000);
      setTimeLeft(`${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [createdAt]);

  return (
    <Card className="border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-medium">{clientName}</p>
            <p className="text-xs text-[var(--color-muted)] flex items-center gap-1 mt-1"><Calendar className="w-3 h-3" />{eventDate}</p>
          </div>
          <span className="text-xs text-[var(--color-primary)] flex items-center gap-1"><Clock className="w-3 h-3" />{timeLeft}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onAccept} className="flex-1 bg-[var(--color-success)] hover:bg-[var(--color-success)]/80"><Check className="w-3 h-3 me-1" />{t("admin.approve")}</Button>
          <Button size="sm" variant="outline" onClick={onDecline} className="flex-1 border-[var(--color-error)]/20 text-[var(--color-error)] hover:bg-[var(--color-error)]/10"><X className="w-3 h-3 me-1" />{t("admin.reject")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
