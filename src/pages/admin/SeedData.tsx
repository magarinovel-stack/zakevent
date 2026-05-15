import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function SeedData() {
  const { t } = useTranslation();

  const seed = async () => {
    toast.info(t("common.loading"));
    try {
      const providers = [
        { business_name: "Maison Royale Algérie", category: "venue", cities: ["Alger"], min_price: 150000, status: "APPROVED", is_premium: true, rating_average: 4.8, review_count: 42, response_time_hours: 2, portfolio_urls: ["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2074&auto=format&fit=crop"] },
        { business_name: "Zak Prod Photography", category: "photographer", cities: ["Oran"], min_price: 45000, status: "APPROVED", is_premium: true, rating_average: 4.9, review_count: 67, response_time_hours: 1, portfolio_urls: ["https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop"] },
        { business_name: "Elite Traiteur", category: "catering", cities: ["Constantine"], min_price: 2500, status: "APPROVED", is_premium: true, rating_average: 4.7, review_count: 38, response_time_hours: 3, portfolio_urls: ["https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2070&auto=format&fit=crop"] },
        { business_name: "Zellij Décor", category: "decoration", cities: ["Tlemcen"], min_price: 35000, status: "APPROVED", is_premium: false, rating_average: 4.6, review_count: 25, response_time_hours: 4, portfolio_urls: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"] },
        { business_name: "Sahara Events", category: "planner", cities: ["Oran", "Alger"], min_price: 60000, status: "APPROVED", is_premium: true, rating_average: 4.9, review_count: 55, response_time_hours: 1, portfolio_urls: ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop"] },
      ];

      const { error } = await supabase.from("providers").upsert(
        providers.map(p => ({ ...p, user_id: crypto.randomUUID(), created_at: new Date().toISOString() })),
        { onConflict: "business_name" }
      );
      if (error) throw error;
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h3 className="text-xl font-bold">{t("admin.pendingApplications")}</h3>
      <Button onClick={seed} className="bg-[var(--color-secondary)] text-white">{t("common.submit")}</Button>
    </div>
  );
}
