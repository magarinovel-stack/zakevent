import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Upload, Store, User, Loader2, CheckCircle2 } from "lucide-react";
import { CITIES, CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function RegisterProvider() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ businessName: "", category: "", firstName: "", lastName: "", email: "", phone: "", cities: [] as string[], experience: "", password: "" });

  const handleRegister = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: `${formData.firstName} ${formData.lastName}`, role: "PRESTATAIRE" } },
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from("users").insert({
          auth_id: data.user.id, email: formData.email, full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone, role: "PRESTATAIRE", is_verified: false, created_at: new Date().toISOString(),
        });
        await supabase.from("providers").insert({
          user_id: data.user.id, business_name: formData.businessName, category: formData.category,
          cities: formData.cities, min_price: 0, rating_average: 5, review_count: 0,
          is_premium: false, status: "PENDING", response_time_hours: 24, portfolio_urls: [],
          created_at: new Date().toISOString(),
        });
      }
      setStep(4);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[var(--color-background)] flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-[var(--color-foreground)]">{t("pages.onboarding.title")}</h1>
          <p className="text-[var(--color-muted)] max-w-xl mx-auto">{t("hero.subtitle")}</p>
        </div>

        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm", step === s ? "bg-[var(--color-primary)] text-white" : step > s ? "bg-[var(--color-success)] text-white" : "bg-[var(--color-border)] text-[var(--color-muted)]")}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={cn("h-px w-8 md:w-16 bg-[var(--color-border)]", step > s && "bg-[var(--color-success)]")} />}
            </div>
          ))}
        </div>

        <Card className="rounded-[var(--radius-xl)] border-none shadow-[var(--shadow-[var(--shadow-md)])] overflow-hidden bg-white">
          <CardContent className="p-8 md:p-16">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold flex items-center gap-3"><Store className="w-6 h-6 text-[var(--color-primary)]" />{t("pages.onboarding.step1")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("pages.onboarding.businessName")}</label>
                    <Input placeholder="ex: Zak Prod Photography" className="h-12 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("pages.onboarding.category")}</label>
                    <select className="w-full h-12 bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-lg)] px-4 text-sm" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      <option value="">{t("search.allCategories")}</option>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("pages.onboarding.cities")}</label>
                    <select className="w-full h-12 bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-lg)] px-4 text-sm" multiple value={formData.cities} onChange={(e) => setFormData({ ...formData, cities: Array.from(e.target.selectedOptions, o => o.value) })}>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("pages.onboarding.description")}</label>
                    <Input type="number" placeholder="5" className="h-12 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setStep(2)} disabled={!formData.businessName || !formData.category} className="bg-[var(--color-primary)] text-white h-14 px-12 rounded-[var(--radius-lg)] text-lg shadow-[var(--shadow-md)]">
                    {t("common.next")} <ArrowRight className="w-5 h-5 ml-2 rtl:rotate-180" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold flex items-center gap-3"><User className="w-6 h-6 text-[var(--color-primary)]" />{t("pages.onboarding.step2")}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2"><Input placeholder="Ahmed" className="h-12 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} /></div>
                  <div className="space-y-2"><Input placeholder="Benali" className="h-12 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} /></div>
                  <div className="space-y-2"><Input type="email" placeholder="contact@studio.com" className="h-12 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                  <div className="space-y-2"><Input placeholder="+213 5XX XX XX XX" className="h-12 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                  <div className="space-y-2 md:col-span-2"><Input type="password" placeholder="••••••••" className="h-12 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="h-14 px-8 text-[var(--color-muted)]"><ArrowLeft className="w-5 h-5 mr-2 rtl:rotate-180" /> {t("common.back")}</Button>
                  <Button onClick={() => setStep(3)} disabled={!formData.email || !formData.password} className="bg-[var(--color-primary)] text-white h-14 px-12 rounded-[var(--radius-lg)] text-lg shadow-[var(--shadow-md)]">{t("common.next")} <ArrowRight className="w-5 h-5 ml-2 rtl:rotate-180" /></Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto text-[var(--color-primary)]"><Upload className="w-10 h-10" /></div>
                  <h2 className="text-2xl font-bold">{t("pages.onboarding.step5")}</h2>
                </div>
                <div className="border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-xl)] p-12 text-center space-y-4 hover:border-[var(--color-primary)] transition-colors cursor-pointer">
                  <Upload className="w-6 h-6 mx-auto text-[var(--color-muted)]" />
                  <p className="text-sm font-bold">{t("pages.onboarding.uploadPhotos")}</p>
                  <p className="text-xs text-[var(--color-muted)]">JPG, PNG (Max. 5MB)</p>
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="h-14 px-8 text-[var(--color-muted)]"><ArrowLeft className="w-5 h-5 mr-2" /> {t("common.back")}</Button>
                  <Button onClick={handleRegister} disabled={loading} className="bg-[var(--color-primary)] text-white h-14 px-12 rounded-[var(--radius-lg)] text-lg shadow-[var(--shadow-md)]">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : t("common.submit")}
                    {!loading && <ArrowRight className="w-5 h-5 ml-2 rtl:rotate-180" />}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center space-y-8 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-[var(--color-success)]/10 rounded-full flex items-center justify-center mx-auto text-[var(--color-success)]"><CheckCircle2 className="w-12 h-12" /></div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-serif font-bold text-[var(--color-foreground)]">{t("common.success")}</h2>
                  <p className="text-[var(--color-muted)] max-w-lg mx-auto text-lg">{t("pages.onboarding.saved")}</p>
                </div>
                <Link to="/dashboard/prestataire"><Button className="bg-[var(--color-secondary)] text-white h-14 px-12 rounded-[var(--radius-lg)] text-lg">{t("nav.dashboard")} →</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
