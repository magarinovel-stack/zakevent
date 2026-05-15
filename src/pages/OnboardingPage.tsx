import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

const STORAGE_KEY = "zakevents_onboarding";

interface OnboardingData {
  businessName: string;
  category: string;
  cities: string[];
  description: string;
  photos: string[];
}

export default function OnboardingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({ businessName: "", category: "", cities: [], description: "", photos: [] });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { try { const p = JSON.parse(saved); setData(p.data); setStep(p.step); } catch { /* empty */ } }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
  }, [step, data]);

  async function handleFinish() {
    if (!user) { toast.error(t("errors.unauthorized")); return; }
    setSubmitting(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch("/api/providers/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          business_name: data.businessName,
          category: data.category,
          cities: data.cities,
          description: data.description,
          document_urls: data.photos,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      localStorage.removeItem(STORAGE_KEY);
      toast.success(t("pages.onboarding.saved"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
    }
    setSubmitting(false);
  }

  const steps = [t("pages.onboarding.step1"), t("pages.onboarding.step2"), t("pages.onboarding.step3"), t("pages.onboarding.step4"), t("pages.onboarding.step5")];

  return (
    <div className="pt-32 pb-24 px-6 max-w-2xl mx-auto">
      <Helmet><title>{t("pages.onboarding.title")} | ZAKEVENTS</title></Helmet>
      <h1 className="text-2xl font-light mb-8">{t("pages.onboarding.title")}</h1>

      <div className="flex gap-2 mb-12">
        {steps.map((s, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1 rounded ${i <= step ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}`} />
            <p className="text-[9px] uppercase tracking-widest mt-2 text-center text-[var(--color-muted)]">{s}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {step === 0 && (
          <>
            <Input placeholder={t("pages.onboarding.businessName")} value={data.businessName} onChange={(e) => setData({ ...data, businessName: e.target.value })} />
            <select className="w-full h-12 border border-[var(--color-border)] px-3 bg-white" value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })}>
              <option value="">{t("pages.onboarding.category")}</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </>
        )}
        {step === 1 && <textarea className="w-full h-32 border border-[var(--color-border)] p-3" placeholder={t("pages.onboarding.description")} value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />}
        {step === 2 && <div className="border-2 border-dashed border-[var(--color-border)] p-12 text-center text-[var(--color-muted)]">{t("pages.onboarding.uploadPhotos")}</div>}
        {step === 3 && (
          <div className="grid grid-cols-2 gap-2">
            {CITIES.map((c) => (
              <Button key={c} variant={data.cities.includes(c) ? "primary" : "outline"} size="sm" onClick={() => setData({ ...data, cities: data.cities.includes(c) ? data.cities.filter((x) => x !== c) : [...data.cities, c] })}>
                {c}
              </Button>
            ))}
          </div>
        )}
        {step === 4 && (
          <div className="space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[var(--color-primary)] mx-auto" />
            <p className="text-center font-medium">{t("pages.onboarding.reviewInfo")}</p>
            <div className="bg-[var(--color-background-alt)] p-4 text-sm space-y-1">
              <p><strong>{t("pages.onboarding.businessName")}:</strong> {data.businessName}</p>
              <p><strong>{t("pages.onboarding.category")}:</strong> {data.category}</p>
              <p><strong>{t("pages.onboarding.cities")}:</strong> {data.cities.join(", ")}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-12">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>{t("common.back")}</Button>
        <Button
          onClick={() => step < 4 ? setStep(step + 1) : handleFinish()}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]"
          disabled={submitting}
        >
          {submitting && <Loader2 className="w-4 h-4 me-1 animate-spin" />}
          {step === 4 ? t("pages.onboarding.finish") : t("common.next")}
        </Button>
      </div>
    </div>
  );
}
