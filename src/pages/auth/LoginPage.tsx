import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success(t("toast.loginSuccess"));
      navigate("/");
    } catch {
      toast.error(t("toast.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) toast.error(t("toast.loginFailed"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-32 pb-24 px-6 bg-[var(--color-background)]">
      <Card className="w-full max-w-md rounded-[var(--radius-xl)] border-[var(--color-border)] shadow-[var(--shadow-[var(--shadow-md)])] overflow-hidden">
        <div className="bg-[var(--color-primary)] p-10 text-white text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold">ZAKEVENTS</h1>
          <p className="text-white/80 text-sm italic">{t("hero.subtitle")}</p>
        </div>
        <CardContent className="p-8 md:p-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{t("auth.loginTitle")}</h2>
            <p className="text-[var(--color-muted)] text-sm">{t("auth.loginTitle")}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("auth.email")}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <Input type="email" placeholder="nom@exemple.com" className="pl-12 h-12 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">{t("auth.password")}</label>
                  <Link to="/forgot-password" className="text-xs text-[var(--color-primary)] hover:underline">{t("auth.forgotPassword")}</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <Input type="password" placeholder="••••••••" className="pl-12 h-12 rounded-[var(--radius-lg)] border-[var(--color-border)]" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-[var(--color-secondary)] text-white h-12 rounded-[var(--radius-lg)] text-lg hover:shadow-[var(--shadow-md)] transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : t("auth.submitLogin")}
              {!loading && <ArrowRight className="w-5 h-5 ml-2 rtl:rotate-180" />}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[var(--color-border)]" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-[var(--color-muted)]">ou</span></div>
          </div>

          <Button variant="outline" onClick={handleGoogleLogin} className="w-full h-12 rounded-[var(--radius-lg)] border-[var(--color-border)] space-x-3 rtl:space-x-reverse">
            {/* ds-ignore */}<svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.34-1.99 4.36-1.12 1.04-2.85 1.88-5.85 1.88-4.74 0-8.68-3.46-8.68-8.12s3.94-8.12 8.68-8.12c2.6 0 4.6 1.07 6.03 2.4l2.42-2.42c-2.45-2.31-5.73-3.66-8.45-3.66-7.1 0-12.48 5.4-12.48 11.72s5.38 11.72 12.48 11.72c3.78 0 6.64-1.25 8.87-3.56 2.3-2.31 3.03-5.58 3.03-8.18 0-.64-.06-1.39-.18-2.08h-11.72z" /></svg>
            <span>Google</span>
          </Button>

          <footer className="text-center text-sm text-[var(--color-muted)]">
            {t("auth.noAccount")} <Link to="/register/client" className="text-[var(--color-primary)] font-bold hover:underline">{t("auth.submitRegister")}</Link>
          </footer>
        </CardContent>
      </Card>
    </div>
  );
}
