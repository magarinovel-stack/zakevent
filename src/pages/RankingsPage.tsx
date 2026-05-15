import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { Crown, Medal, Star } from "lucide-react";
import type { ProviderProfile } from "@/lib/types";

export default function RankingsPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState(CATEGORIES[0]?.id || "");
  const [city, setCity] = useState(CITIES[0] || "");
  const [providers, setProviders] = useState<ProviderProfile[]>([]);

  useEffect(() => {
    import('@/lib/api').then(({ api }) =>
      api(`/api/search?category=${category}&city=${city}`)
        .then(r => r.json())
        .then(d => setProviders((d.results || []).slice(0, 10)))
        .catch(() => {})
    );
  }, [category, city]);

  const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 0) return <Crown className="w-5 h-5 text-[var(--color-primary)]" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-[var(--color-muted)]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-[var(--color-accent)]" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-[var(--color-muted)]">{rank + 1}</span>;
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-3xl mx-auto">
      <Helmet><title>{t("pages.rankings.title")} | ZAKEVENTS</title></Helmet>
      <h1 className="text-3xl font-light mb-2">{t("pages.rankings.title")}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-8">{t("pages.rankings.subtitle")}</p>

      <div className="flex gap-4 mb-8">
        <select className="h-10 border border-[var(--color-border)] px-3 text-sm bg-white flex-1" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select className="h-10 border border-[var(--color-border)] px-3 text-sm bg-white flex-1" value={city} onChange={e => setCity(e.target.value)}>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {providers.map((p, i) => (
          <Card key={p.id} className={`border-[var(--color-border)] ${i === 0 ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5" : ""}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <RankIcon rank={i} />
              <div className="flex-1">
                <Link to={`/prestataires/${p.id}`} className="font-medium hover:text-[var(--color-primary)]">{p.business_name}</Link>
                <p className="text-xs text-[var(--color-muted)]">{p.cities.join(", ")}</p>
              </div>
              <Badge variant="outline" className="flex items-center gap-1"><Star className="w-3 h-3 fill-[var(--color-primary)] text-[var(--color-primary)]" />{p.rating_average.toFixed(1)}</Badge>
            </CardContent>
          </Card>
        ))}
        {providers.length === 0 && <p className="text-center text-[var(--color-muted)] py-12">{t("common.noData")}</p>}
      </div>
    </div>
  );
}
