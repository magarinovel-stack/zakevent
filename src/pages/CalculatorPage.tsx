import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { CITIES } from "@/lib/constants";
import { Calculator } from "lucide-react";

const SERVICES = [
  { id: "salle", base: 300000 }, { id: "traiteur", base: 2500 }, // per guest
  { id: "photographe", base: 80000 }, { id: "decoration", base: 60000 },
  { id: "musique", base: 50000 }, { id: "beaute", base: 30000 },
];
const CITY_MULT: Record<string, number> = { Alger: 1.3, Oran: 1.1, Constantine: 1.0, Annaba: 0.95, Tlemcen: 0.9 };

export default function CalculatorPage() {
  const { t } = useTranslation();
  const [guests, setGuests] = useState(150);
  const [city, setCity] = useState("Alger");
  const [selected, setSelected] = useState<string[]>(["salle", "traiteur", "photographe"]);

  const total = useMemo(() => {
    const mult = CITY_MULT[city] || 1;
    return Math.round(selected.reduce((sum, id) => {
      const svc = SERVICES.find(s => s.id === id);
      if (!svc) return sum;
      return sum + (id === "traiteur" ? svc.base * guests : svc.base) * mult;
    }, 0));
  }, [guests, city, selected]);

  return (
    <div className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
      <Helmet><title>{t("pages.calculator.title")} | ZAKEVENTS</title></Helmet>
      <h1 className="text-3xl font-light mb-2">{t("pages.calculator.title")}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-12">{t("pages.calculator.subtitle")}</p>

      <div className="space-y-8">
        <div>
          <label className="text-xs uppercase tracking-widest font-bold text-[var(--color-muted)] mb-3 block">{t("pages.calculator.guests")}: {guests}</label>
          <Slider value={[guests]} onValueChange={v => setGuests(Array.isArray(v) ? v[0] : v)} min={20} max={1000} step={10} />
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest font-bold text-[var(--color-muted)] mb-3 block">{t("pages.calculator.city")}</label>
          <select className="w-full h-12 border border-[var(--color-border)] px-3 bg-white" value={city} onChange={e => setCity(e.target.value)}>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest font-bold text-[var(--color-muted)] mb-3 block">{t("pages.calculator.services")}</label>
          <div className="grid grid-cols-2 gap-3">
            {SERVICES.map(s => (
              <button key={s.id} onClick={() => setSelected(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                className={`p-3 border text-sm text-start ${selected.includes(s.id) ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : "border-[var(--color-border)]"}`}>
                {t(`calculator.services.${s.id}`)}
              </button>
            ))}
          </div>
        </div>

        <Card className="border-[var(--color-primary)] bg-[var(--color-primary)]/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-[var(--color-primary)]" />
              <span className="font-medium">{t("pages.calculator.estimate")}</span>
            </div>
            <span className="text-2xl font-light text-[var(--color-primary)]">{total.toLocaleString()} DA</span>
          </CardContent>
        </Card>
        <p className="text-xs text-[var(--color-muted)] text-center">{t("pages.calculator.disclaimer")}</p>
      </div>
    </div>
  );
}
