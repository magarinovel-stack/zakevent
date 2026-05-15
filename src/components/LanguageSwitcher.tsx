import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LANGS = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇩🇿" },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGS.find(l => l.code === i18n.language) || LANGS[0];

  const switchLang = (code: string) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = code === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = code;
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-sm px-2 py-1 hover:bg-[var(--color-background-alt)] rounded">
        <Globe className="w-4 h-4" />
        <span>{current.flag}</span>
      </button>
      {open && (
        <div className="absolute end-0 top-full mt-1 border border-[var(--color-border)] bg-white shadow-[var(--shadow-md)] z-50 min-w-[140px]">
          {LANGS.map(lang => (
            <button key={lang.code} onClick={() => switchLang(lang.code)}
              className={`w-full px-3 py-2 text-start text-sm flex items-center gap-2 hover:bg-[var(--color-background-alt)] ${lang.code === i18n.language ? "bg-[var(--color-primary)]/10" : ""}`}>
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
