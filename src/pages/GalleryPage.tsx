import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { CITIES } from "@/lib/constants";
import { Heart } from "lucide-react";

const SAMPLE_IMAGES = Array.from({ length: 12 }, (_, i) => ({
  id: String(i), url: `https://images.unsplash.com/photo-${1519741497674 + i * 1000}-0899955994e?w=400&h=${300 + (i % 3) * 100}&fit=crop`,
  city: CITIES[i % CITIES.length], type: ["MARIAGE", "FIANCAILLES", "CORPORATE"][i % 3], likes: Math.floor(Math.random() * 200),
}));

export default function GalleryPage() {
  const { t } = useTranslation();
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filtered = SAMPLE_IMAGES.filter(img => (!cityFilter || img.city === cityFilter) && (!typeFilter || img.type === typeFilter));

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <Helmet><title>{t("pages.gallery.title")} | ZAKEVENTS</title></Helmet>
      <h1 className="text-3xl font-light mb-2">{t("pages.gallery.title")}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-8">{t("pages.gallery.subtitle")}</p>

      <div className="flex gap-4 mb-8">
        <select className="h-10 border border-[var(--color-border)] px-3 text-sm bg-white" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
          <option value="">{t("pages.gallery.allCities")}</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="h-10 border border-[var(--color-border)] px-3 text-sm bg-white" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">{t("pages.gallery.allTypes")}</option>
          {["MARIAGE", "FIANCAILLES", "CORPORATE"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {filtered.map(img => (
          <div key={img.id} className="break-inside-avoid mb-4 group relative overflow-hidden rounded-[var(--radius-sm)]">
            <img src={img.url} alt="" className="w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <div className="text-white text-xs flex justify-between w-full">
                <span>{img.city}</span>
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{img.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
