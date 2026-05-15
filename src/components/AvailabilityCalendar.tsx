import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AvailabilityStatus } from "@/lib/types";

interface DateEntry { date: string; status: AvailabilityStatus; }
interface Props { dates: DateEntry[]; onDateSelect?: (date: string) => void; }

const STATUS_COLORS: Record<AvailabilityStatus, string> = { AVAILABLE: "bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20", BLOCKED: "bg-[var(--color-error)]/10 text-[var(--color-error)]", BOOKED: "bg-[var(--color-primary)]/20 text-[var(--color-primary)]" };

export function AvailabilityCalendar({ dates, onDateSelect }: Props) {
  const { t } = useTranslation();
  const [month, setMonth] = useState(new Date());

  const year = month.getFullYear(), m = month.getMonth();
  const firstDay = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getStatus = (day: number): AvailabilityStatus => {
    const dateStr = `${year}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dates.find(d => d.date === dateStr)?.status || "AVAILABLE";
  };

  return (
    <div className="border border-[var(--color-border)] p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setMonth(new Date(year, m - 1))}><ChevronLeft className="w-4 h-4" /></Button>
        <span className="text-sm font-medium">{month.toLocaleDateString("fr", { month: "long", year: "numeric" })}</span>
        <Button variant="ghost" size="icon" onClick={() => setMonth(new Date(year, m + 1))}><ChevronRight className="w-4 h-4" /></Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <span key={i} className="text-[9px] text-[var(--color-muted)] font-bold">{d}</span>)}
        {Array.from({ length: (firstDay + 6) % 7 }).map((_, i) => <span key={`e${i}`} />)}
        {days.map(day => {
          const status = getStatus(day);
          return <button key={day} onClick={() => status === "AVAILABLE" && onDateSelect?.(`${year}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`)}
            className={`w-8 h-8 text-xs rounded ${STATUS_COLORS[status]} ${status === "AVAILABLE" ? "cursor-pointer" : "cursor-default"}`}>{day}</button>;
        })}
      </div>
      <div className="flex gap-4 mt-4 text-[9px] uppercase tracking-widest">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />{t("components.availabilityCalendar.available")}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-error)]" />{t("components.availabilityCalendar.blocked")}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />{t("components.availabilityCalendar.booked")}</span>
      </div>
    </div>
  );
}
