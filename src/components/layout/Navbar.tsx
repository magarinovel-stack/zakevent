import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === "fr" ? "ar" : "fr");

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.providers"), path: "/search" },
    { name: t("nav.planner"), path: "/organiser-mon-evenement" },
    { name: t("nav.howItWorks"), path: "/comment-ca-marche" },
  ];

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-8 py-6", isScrolled ? "glass-morphism border-b border-black/5 py-4" : "bg-transparent")}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-5 h-5 bg-[var(--color-primary)] rounded-none rotate-45 transition-transform group-hover:rotate-0" />
          <span className={cn("text-sm font-bold tracking-ultra uppercase transition-colors duration-500", isScrolled ? "text-[var(--color-foreground)]" : "text-white")}>ZAKEVENTS</span>
        </Link>

        <div className="hidden lg:flex items-center space-x-12 rtl:space-x-reverse">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={cn("text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-500 hover:tracking-[0.3em]", isScrolled ? "text-[var(--color-foreground)]/60 hover:text-[var(--color-primary)]" : "text-white/60 hover:text-white")}>{link.name}</Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center space-x-10 rtl:space-x-reverse">
          <button onClick={toggleLanguage} className={cn("flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors px-2 py-1", isScrolled ? "text-[var(--color-foreground)]/40 hover:text-[var(--color-foreground)]" : "text-white/40 hover:text-white")}>
            {i18n.language === 'fr' ? '🇫🇷 FR' : '🇩🇿 AR'}
          </button>

          {user ? (
            <div className="flex items-center gap-6">
              <Link to="/dashboard/client" className={cn("text-[10px] uppercase font-bold tracking-widest", isScrolled ? "text-[var(--color-foreground)]/60 hover:text-[var(--color-foreground)]" : "text-white/60 hover:text-white")}>{t("nav.dashboard")}</Link>
              <button onClick={async () => { await signOut(); navigate('/'); }} className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-accent)] hover:opacity-80 transition-opacity">{t("nav.logout")}</button>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <Link to="/login" className={cn("text-[10px] uppercase font-bold tracking-widest transition-colors", isScrolled ? "text-[var(--color-foreground)]/60 hover:text-[var(--color-foreground)]" : "text-white/60 hover:text-white")}>{t("nav.login")}</Link>
              <Link to="/register/client"><Button size="sm" className={cn("rounded-none h-11 px-8 text-[10px] uppercase font-bold tracking-widest transition-all", isScrolled ? "bg-[var(--color-foreground)] text-white hover:bg-[var(--color-primary)]" : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-accent)]")}>{t("nav.register")}</Button></Link>
            </div>
          )}
        </div>

        <div className="lg:hidden flex items-center space-x-4 rtl:space-x-reverse">
          <Button variant="ghost" size="icon" onClick={toggleLanguage} className={isScrolled ? "text-[var(--color-foreground)]" : "text-white"}><Globe className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={isScrolled ? "text-[var(--color-foreground)]" : "text-white"}>{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-[var(--shadow-lg)] animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-6 space-y-4">
            {navLinks.map((link) => (<Link key={link.path} to={link.path} className="text-lg font-medium text-[var(--color-foreground)] py-2 border-b border-[var(--color-border)]" onClick={() => setIsMobileMenuOpen(false)}>{link.name}</Link>))}
            <div className="pt-4 flex flex-col space-y-4">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}><Button variant="outline" className="w-full">{t("nav.login")}</Button></Link>
              <Link to="/register/client" onClick={() => setIsMobileMenuOpen(false)}><Button className="w-full bg-[var(--color-primary)] text-white">{t("nav.register")}</Button></Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
