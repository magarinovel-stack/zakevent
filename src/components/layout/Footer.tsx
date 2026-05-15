import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone, Globe } from "lucide-react";

export default function Footer() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === "fr" ? "ar" : "fr";
    i18n.changeLanguage(nextLang);
    document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
  };

  return (
    <footer className="bg-[var(--color-foreground)] text-white/40 py-24 px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
        {/* Brand */}
        <div className="space-y-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-5 h-5 bg-white rounded-full transition-transform group-hover:scale-110" />
            <span className="text-sm font-bold tracking-ultra text-white uppercase">
              ZAKEVENTS
            </span>
          </Link>
          <p className="text-sm leading-relaxed font-light max-w-xs">
            {t('hero.subtitle')}
          </p>
          <div className="flex space-x-6 rtl:space-x-reverse grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
            <a href="#" className="hover:text-white transition-colors"><Mail className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors"><Globe className="w-4 h-4" /></a>
          </div>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all group"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--color-primary)] group-hover:rotate-180 transition-transform duration-700" />
            {i18n.language === 'fr' ? 'العربية' : 'Français'}
          </button>
        </div>

        {/* Links */}
        <div className="space-y-8">
          <h4 className="text-white text-[10px] font-bold tracking-[0.4em] uppercase">{t('nav.howItWorks')}</h4>
          <ul className="space-y-4 text-[11px] uppercase tracking-[0.2em] font-medium">
            <li><Link to="/search" className="hover:text-white transition-colors">Explorer</Link></li>
            <li><Link to="/organiser-mon-evenement" className="hover:text-white transition-colors">Planifier</Link></li>
            <li><Link to="/register/prestataire" className="hover:text-white transition-colors">Partenariat</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-8">
          <h4 className="text-white text-[10px] font-bold tracking-[0.4em] uppercase">Assistance</h4>
          <ul className="space-y-4 text-[11px] uppercase tracking-[0.2em] font-medium">
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link to="/cgu" className="hover:text-white transition-colors">Conditions</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-8">
          <h4 className="text-white text-[10px] font-bold tracking-[0.4em] uppercase">Contact</h4>
          <ul className="space-y-4 text-[11px] uppercase tracking-[0.2em] font-medium">
            <li className="flex items-center space-x-3 rtl:space-x-reverse">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>Alger & Oran, Algérie</span>
            </li>
            <li className="flex items-center space-x-3 rtl:space-x-reverse">
              <Mail className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>contact@zakevents.dz</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-24 pt-12 text-[10px] tracking-[0.3em] font-medium uppercase text-center opacity-30">
        <p>&copy; {new Date().getFullYear()} ZAKEVENTS. EXCELLENCE ALGÉRIENNE.</p>
      </div>
    </footer>
  );
}
