import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Tag } from "lucide-react";

export default function CampaignsPage() {
  const { t } = useTranslation();
  const { slug } = useParams();

  const campaign = {
    title: slug === "ramadan-2025" ? "Offres Ramadan 2025" : "Promotions Saisonnières",
    description: "Profitez de réductions exceptionnelles sur nos meilleurs prestataires.",
    discount: 20, endDate: "2025-04-15",
    packages: [
      { id: "1", name: "Pack Mariage Premium", original: 500000, promo: 400000 },
      { id: "2", name: "Photographe + Vidéo", original: 150000, promo: 120000 },
      { id: "3", name: "Décoration Complète", original: 200000, promo: 160000 },
    ],
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
      <Helmet><title>{campaign.title} | ZAKEVENTS</title></Helmet>

      <div className="text-center mb-12">
        <Badge className="bg-[var(--color-primary)] text-white mb-4"><Sparkles className="w-3 h-3 me-1" />{t("pages.campaigns.discount", { percent: campaign.discount })}</Badge>
        <h1 className="text-3xl font-light mb-2">{campaign.title}</h1>
        <p className="text-sm text-[var(--color-muted)]">{campaign.description}</p>
        <p className="text-xs text-[var(--color-muted)] mt-2">{t("pages.campaigns.validUntil", { date: campaign.endDate })}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {campaign.packages.map(pkg => (
          <Card key={pkg.id} className="border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
            <CardContent className="p-6 space-y-4">
              <Tag className="w-5 h-5 text-[var(--color-primary)]" />
              <h3 className="font-medium">{pkg.name}</h3>
              <div>
                <p className="text-sm text-[var(--color-muted)] line-through">{pkg.original.toLocaleString()} DA</p>
                <p className="text-xl text-[var(--color-primary)] font-light">{pkg.promo.toLocaleString()} DA</p>
              </div>
              <Button className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]">{t("pages.campaigns.bookNow")}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
