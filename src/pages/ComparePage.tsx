import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Package } from "lucide-react";
import type { ProviderProfile } from "@/lib/types";

export default function ComparePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];

  useEffect(() => {
    if (ids.length === 0) return;
    import('@/lib/api').then(({ api }) =>
      api(`/api/search?ids=${ids.join(",")}`)
        .then(r => r.json())
        .then(d => setProviders(d.results?.slice(0, 3) || []))
        .catch(() => {})
    );
  }, [searchParams]);

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
      <Helmet><title>{t("pages.compare.title")} | ZAKEVENTS</title></Helmet>
      <h1 className="text-3xl font-light mb-2">{t("pages.compare.title")}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-12">{t("pages.compare.subtitle")}</p>

      {providers.length === 0 ? (
        <p className="text-center text-[var(--color-muted)] py-20">{t("pages.compare.noSelection")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map(p => (
            <Card key={p.id} className="border-[var(--color-border)]">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-medium text-lg">{p.business_name}</h3>
                <Badge variant="outline">{p.category}</Badge>
                <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted)] flex items-center gap-1"><Star className="w-3 h-3" />{t("pages.compare.rating")}</span>
                    <span className="font-medium">{p.rating_average.toFixed(1)}/5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted)]">{t("pages.compare.price")}</span>
                    <span className="font-medium">{p.min_price.toLocaleString()} DA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted)] flex items-center gap-1"><Clock className="w-3 h-3" />{t("pages.compare.responseTime")}</span>
                    <span className="font-medium">{p.response_time_hours}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted)] flex items-center gap-1"><Package className="w-3 h-3" />{t("pages.compare.packages")}</span>
                    <span className="font-medium">{p.cities.length} {t("search.city")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
