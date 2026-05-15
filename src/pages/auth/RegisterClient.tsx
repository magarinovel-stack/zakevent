import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, Phone, ArrowRight, Loader2 } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { useTranslation } from "react-i18next";

export default function RegisterClient() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", city: "", password: "", confirmPassword: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error(t("validation.required"));
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: `${formData.firstName} ${formData.lastName}`, role: "CLIENT" } },
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from("users").insert({
          auth_id: data.user.id,
          email: formData.email,
          full_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          city: formData.city,
          role: "CLIENT",
          is_verified: false,
          created_at: new Date().toISOString(),
        });
      }
      toast.success(t("toast.registerSuccess"));
      navigate("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-24 px-6 bg-[var(--color-background)]">
      <Card className="w-full max-w-2xl rounded-[var(--radius-xl)] border-[var(--color-border)] shadow-[var(--shadow-[var(--shadow-md)])] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-[var(--color-secondary)] p-10 text-white flex flex-col justify-between space-y-12">
            <div className="space-y-6">
              <Link to="/" className="text-2xl font-bold"><span className="text-[var(--color-primary)]">ZAK</span>EVENTS</Link>
              <h1 className="text-3xl font-serif leading-tight">{t("auth.registerTitle")}</h1>
              <p className="text-white/60 text-sm">{t("hero.subtitle")}</p>
            </div>
            <div className="space-y-4">
              {[t("featured.verifiedLabel"), t("featured.paymentLabel"), t("featured.secureLabel")].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]"><ArrowRight className="w-3 h-3" /></div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <CardContent className="p-8 md:p-10 space-y-8 bg-white">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{t("auth.asClient")}</h2>
              <p className="text-[var(--color-muted)] text-sm">{t("auth.registerTitle")}</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("validation.required")}</label>
                  <Input placeholder="Ahmed" className="h-11 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("validation.required")}</label>
                  <Input placeholder="Benali" className="h-11 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("auth.email")}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <Input type="email" placeholder="ahmed@exemple.com" className="pl-12 h-11 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("validation.phone")}</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                    <Input placeholder="+213 5XX XX XX XX" className="pl-12 h-11 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("search.city")}</label>
                  <select className="w-full h-11 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] px-4 text-sm" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required>
                    <option value="">{t("search.allCities")}</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("auth.password")}</label>
                  <Input type="password" placeholder="••••••••" className="h-11 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("auth.password")}</label>
                  <Input type="password" placeholder="••••••••" className="h-11 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-[var(--color-primary)] text-white h-12 rounded-[var(--radius-lg)] text-lg hover:shadow-[var(--shadow-md)] transition-all">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : t("auth.submitRegister")}
                {!loading && <ArrowRight className="w-5 h-5 ml-2 rtl:rotate-180" />}
              </Button>

              <footer className="text-center text-xs text-[var(--color-muted)]">
                {t("auth.hasAccount")} <Link to="/login" className="text-[var(--color-primary)] underline">{t("auth.submitLogin")}</Link>
              </footer>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
