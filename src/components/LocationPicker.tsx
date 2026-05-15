import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, ChevronDown } from "lucide-react";
import { CITIES } from "@/lib/constants";

interface Props { value: string; onChange: (city: string) => void; }

export function LocationPicker({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = CITIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-full h-12 border border-[var(--color-border)] px-3 flex items-center justify-between bg-white text-sm">
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[var(--color-muted)]" />
          {value || t("components.locationPicker.placeholder")}
        </span>
        <ChevronDown className={`w-4 h-4 text-[var(--color-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full start-0 end-0 mt-1 border border-[var(--color-border)] bg-white shadow-[var(--shadow-md)] max-h-60 overflow-y-auto">
          <input className="w-full p-3 border-b border-[var(--color-border)] text-sm" placeholder={t("components.locationPicker.search")} value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          {filtered.map(city => (
            <button key={city} onClick={() => { onChange(city); setOpen(false); setSearch(""); }}
              className={`w-full px-3 py-2 text-start text-sm hover:bg-[var(--color-background-alt)] ${city === value ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : ""}`}>
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
