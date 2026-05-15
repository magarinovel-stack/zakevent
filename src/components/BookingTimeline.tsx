import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle } from "lucide-react";
import type { BookingStatus } from "@/lib/types";

interface Props { status: BookingStatus; createdAt: string; confirmedAt?: string; completedAt?: string; }

const STEPS: { key: string; statuses: BookingStatus[] }[] = [
  { key: "pending", statuses: ["PENDING", "CONFIRMED", "COMPLETED"] },
  { key: "confirmed", statuses: ["CONFIRMED", "COMPLETED"] },
  { key: "completed", statuses: ["COMPLETED"] },
];

export function BookingTimeline({ status, createdAt, confirmedAt, completedAt }: Props) {
  const { t } = useTranslation();
  const dates = [createdAt, confirmedAt, completedAt];

  return (
    <div className="relative ps-8">
      <div className="absolute start-3 top-0 bottom-0 w-px bg-[var(--color-border)]" />
      {STEPS.map((step, i) => {
        const active = step.statuses.includes(status);
        return (
          <div key={step.key} className="relative pb-8 last:pb-0">
            <div className="absolute start-[-20px] top-0.5">
              {active ? <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" /> : <Circle className="w-5 h-5 text-[var(--color-border)]" />}
            </div>
            <p className={`text-sm ${active ? "text-[var(--color-foreground)] font-medium" : "text-[var(--color-muted)]"}`}>
              {t(`components.bookingTimeline.${step.key}`)}
            </p>
            {dates[i] && <p className="text-xs text-[var(--color-muted)] mt-0.5">{new Date(dates[i]!).toLocaleString()}</p>}
          </div>
        );
      })}
    </div>
  );
}
