import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Camera, Home, Palette, Cookie, 
  Music, Flower2, Utensils, Calendar, Star
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import type { ProviderProfile } from "@/lib/types";

export default function HomePage() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await supabase
          .from("providers")
          .select("*")
          .eq("status", "APPROVED")
          .eq("is_premium", true)
          .limit(3);
        setFeatured(data || []);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background-alt)]">
      <Helmet>
        <title>{t('seo.homeTitle') || "ZAKEVENTS | Le Marketplace d'Exception en Algérie"}</title>
        <meta name="description" content={t('seo.homeDesc') || "Découvrez les meilleurs prestataires pour vos mariages et événements en Algérie. Photographes, Salles, Traiteurs et plus."} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
        {/* Golden Hour Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542662565-7e4b66bae529?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover brightness-75 scale-105"
            alt={t('hero.bgAlt') || "Algerian Sunset"}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[var(--color-background-alt)]" />
        </div>

        <div className="relative z-10 px-8 max-w-7xl mx-auto w-full">
          <div className="max-w-4xl space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <span className="text-[10px] uppercase tracking-[0.5em] text-white/80 font-bold bg-[var(--color-accent)]/20 backdrop-blur-sm px-4 py-2 border border-white/10 inline-block">
                {t('hero.tagline') || "Algerian Excellence"}
              </span>
              <h1 className="text-7xl md:text-9xl font-extralight leading-[0.95] tracking-tight text-white">
                {t('hero.title_part1') || "Sublimez l'"}<span className="italic font-serif text-[var(--color-primary)]">{t('hero.title_part2') || "exception."}</span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-3xl text-white/80 font-light leading-relaxed max-w-2xl font-sans"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Floating Glassmorphic Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-morphism p-2 rounded-none flex flex-col md:flex-row gap-2 max-w-3xl mt-12 shadow-[var(--shadow-lg)] border-white/20"
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
                <div className="bg-white/10 p-4 hover:bg-white/20 transition-all flex flex-col justify-center">
                  <span className="text-[9px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">{t('search.category') || "Catégorie"}</span>
                  <select className="bg-transparent border-none text-white text-sm focus:ring-0 w-full cursor-pointer appearance-none">
                    <option className="text-black">{t('search.allCategories') || "Toutes les catégories"}</option>
                    {CATEGORIES.map(cat => <option key={cat.id} value={cat.id} className="text-black">{cat.label}</option>)}
                  </select>
                </div>
                <div className="bg-white/10 p-4 hover:bg-white/20 transition-all flex flex-col justify-center">
                  <span className="text-[9px] uppercase tracking-widest text-[var(--color-primary)] font-bold mb-1">{t('search.city')}</span>
                  <select className="bg-transparent border-none text-white text-sm focus:ring-0 w-full cursor-pointer appearance-none">
                    <option className="text-black">{t('search.allCities') || "Toute l'Algérie"}</option>
                    <option className="text-black">Alger</option>
                    <option className="text-black">Oran</option>
                    <option className="text-black">Constantine</option>
                  </select>
                </div>
              </div>
              <Link to="/search">
                <Button className="h-full px-12 rounded-none bg-[var(--color-primary)] text-white hover:bg-[var(--color-accent)] transition-all font-bold text-xs tracking-widest uppercase">
                  {t('search.submit')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/40">
          <span className="text-[8px] uppercase tracking-[0.4em]">Découvrir</span>
          <div className="w-px h-16 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* Stats with Zellij Accent */}
      <section className="relative py-32 px-8 bg-white overflow-hidden">
        <div className="absolute left-0 top-0 w-64 h-64 zellij-pattern" />
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24 relative z-10">
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-primary)]">{t('stats.heritage') || "Héritage"}</span>
              <h2 className="text-4xl font-serif">{t('stats.title_part1') || "Une sélection "}<span className="italic">{t('stats.title_part2') || "curatée"}</span>{t('stats.title_part3') || " avec soin."}</h2>
              <div className="h-px w-20 bg-[var(--color-accent)]" />
              <p className="text-sm text-[var(--color-muted)] font-light leading-relaxed">
                {t('stats.desc') || "Nous parcourons l'Algérie pour dénicher les talents qui feront battre le cœur de vos événements. Une exigence sans compromis."}
              </p>
            </div>
            
            <div className="bg-[var(--color-background-alt)] p-12 border-l-4 border-[var(--color-primary)]">
              <span className="text-7xl font-extralight tracking-tighter text-[var(--color-foreground)]">500+</span>
              <p className="mt-4 text-[10px] uppercase tracking-widest font-bold text-[var(--color-muted)]">{t('stats.providersLabel') || "Prestataires Authentifiés"}</p>
            </div>

            <div className="bg-[var(--color-foreground)] p-12 text-white">
              <span className="text-7xl font-extralight tracking-tighter text-[var(--color-primary)]">98%</span>
              <p className="mt-4 text-[10px] uppercase tracking-widest font-bold text-white/40">{t('stats.satisfactionLabel') || "Taux de Satisfaction"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--color-border)] pb-12">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)]">{t('categories.exploration') || "Exploration"}</span>
              <h2 className="text-4xl md:text-5xl font-extralight tracking-tight text-[var(--color-foreground)]">{t('categories.title') || "Catégories de Services"}</h2>
            </div>
            <p className="text-[var(--color-muted)] max-w-sm font-light">
              {t('categories.desc') || "Parcourez nos catégories sélectionnées pour trouver les talents qui correspondent à votre vision."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--color-border)] border border-[var(--color-border)]">
            {CATEGORIES.map((cat, i) => (
              <Link 
                key={cat.id} 
                to={`/search?category=${cat.id}`}
                className="group p-12 bg-white hover:bg-[var(--color-background-alt)] transition-all flex flex-col justify-between items-start min-h-[280px]"
              >
                <div className="w-12 h-12 bg-[var(--color-background-alt)] rounded-full flex items-center justify-center text-[var(--color-foreground)] group-hover:scale-110 transition-transform">
                  {i === 0 && <Camera className="w-6 h-6" />}
                  {i === 2 && <Palette className="w-6 h-6" />}
                  {i === 3 && <Cookie className="w-6 h-6" />}
                  {i === 4 && <Music className="w-6 h-6" />}
                  {i === 5 && <Flower2 className="w-6 h-6" />}
                  {i === 6 && <Utensils className="w-6 h-6" />}
                  {i === 7 && <Calendar className="w-6 h-6" />}
                  {![0,2,3,4,5,6,7].includes(i) && <Home className="w-6 h-6" />}
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[var(--color-muted)]">{t('categories.serviceTag') || "Services"}</span>
                  <h3 className="text-xl font-light tracking-tight text-[var(--color-foreground)]">{cat.label}</h3>
                  <div className="h-px w-0 group-hover:w-full bg-[var(--color-foreground)] transition-all duration-500 mt-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Planner Teaser */}
      <section className="py-32 px-8 bg-[var(--color-background-alt)]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[var(--color-foreground)] rounded-none p-12 md:p-24 text-white grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            
            <div className="space-y-12 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)]">{t('planner.ai_tag') || "Intelligence Artificielle"}</span>
              <h2 className="text-4xl md:text-6xl font-extralight leading-tight tracking-tight">
                {t('planner.teaser_title_part1') || "Laissez-nous "}<span className="italic font-serif">{t('planner.teaser_title_part2') || "composer"}</span>{t('planner.teaser_title_part3') || " votre événement."}
              </h2>
              <p className="text-white/60 text-lg font-light leading-relaxed max-w-md">
                {t('planner.teaser_desc') || "Notre moteur intelligent analyse votre vision et sélectionne les prestataires parfaits. Une harmonie numérique au service de vos souvenirs."}
              </p>
              <Link to="/organiser-mon-evenement">
                <Button className="bg-white text-[var(--color-foreground)] hover:bg-[var(--color-border)] px-10 h-14 rounded-none text-xs tracking-wide-caps transition-all">
                  {t('planner.launchBtn') || "Lancer le planificateur AI"}
                </Button>
              </Link>
            </div>
            
            <div className="relative border border-white/10 p-8 flex items-center justify-center aspect-square md:aspect-auto">
              <div className="w-full h-full border border-white/5 flex items-center justify-center p-12">
                <div className="w-full h-full border border-white/5 flex items-center justify-center">
                  <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full blur-2xl opacity-20 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Section */}
      <section className="py-32 px-8 bg-[var(--color-background-alt)]">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)]">{t('featured.tagline') || "Curated Talents"}</span>
              <h2 className="text-5xl md:text-8xl font-extralight tracking-tight text-[var(--color-foreground)]">
                {t('featured.title_part1') || "La crème de l'"}<span className="italic font-serif text-[var(--color-primary)]">{t('featured.title_part2') || "Algérie."}</span>
              </h2>
              <p className="text-lg text-[var(--color-muted)] font-light leading-relaxed max-w-lg">
                {t('featured.desc')}
              </p>
              <div className="flex gap-16 pt-8">
                <div className="space-y-2">
                  <span className="block text-[32px] font-extralight text-[var(--color-foreground)]">100%</span>
                  <span className="block text-[9px] uppercase tracking-widest font-bold text-[var(--color-muted)]">{t('featured.verifiedLabel') || "Identité Vérifiée"}</span>
                </div>
                <div className="w-px h-16 bg-[var(--color-border)]" />
                <div className="space-y-2">
                  <span className="block text-[32px] font-extralight text-[var(--color-foreground)]">{t('featured.secureLabel') || "Sécurisé"}</span>
                  <span className="block text-[9px] uppercase tracking-widest font-bold text-[var(--color-muted)]">{t('featured.paymentLabel') || "Paiement Garanti"}</span>
                </div>
              </div>
            </div>
            <div className="relative group overflow-hidden bg-[var(--color-foreground)]">
              <div className="absolute inset-0 bg-[var(--color-accent)]/20 mix-blend-overlay z-10" />
              <img 
                src="https://images.unsplash.com/photo-1542662565-7e4b66bae529?q=80&w=2070&auto=format&fit=crop" 
                alt={t('featured.imgAlt') || "Event refinement"} 
                className="w-full aspect-[4/5] object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-32 px-8 bg-white overflow-hidden relative">
        <div className="absolute right-0 bottom-0 w-96 h-96 zellij-pattern rotate-180" />
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-[var(--color-border)] pb-12">
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)]">{t('providers.selection') || "Selection"}</span>
              <h2 className="text-4xl md:text-5xl font-extralight tracking-tight text-[var(--color-foreground)]">{t('providers.featuredTitle') || "Prestataires en vedette"}</h2>
            </div>
            <Link to="/search" className="tracking-wide-caps text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors border-b border-transparent hover:border-[var(--color-foreground)] pb-1">{t('providers.viewAll') || "Voir tout le catalogue →"}</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-[500px] bg-[var(--color-background-alt)] animate-pulse rounded-none" />
              ))
            ) : featured.length === 0 ? (
               <p className="col-span-full text-center text-[var(--color-muted)]">Aucun prestataire en vedette pour le moment.</p>
            ) : (
                featured.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProviderCard({ provider }: { provider: ProviderProfile }) {
  const coverUrl = provider.portfolio_urls?.[0] || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="group space-y-8 animate-in fade-in duration-1000 transform transition-all duration-500 hover:-translate-y-4 hover:shadow-[var(--shadow-lg)]">
      <div className="relative aspect-[4/5] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 bg-[var(--color-background-alt)] cursor-pointer">
        <Link to={`/prestataires/${provider.id}`}>
            <img 
            src={coverUrl as string} 
            alt={provider.business_name} 
            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-1000"
            referrerPolicy="no-referrer"
            />
        </Link>
        <div className="absolute top-6 left-6">
          <span className="bg-white/90 backdrop-blur-md text-[var(--color-foreground)] text-[9px] font-bold uppercase tracking-[0.3em] px-4 py-2 border border-black/5">Premium</span>
        </div>
        
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Link to={`/prestataires/${provider.id}`}>
                <button className="bg-white text-black px-6 py-3 text-[10px] uppercase font-bold tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform">
                    Aperçu Rapide
                </button>
            </Link>
        </div>
      </div>
      <div className="space-y-6 px-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.3em]">{provider.category}</span>
          <div className="flex items-center text-[10px] text-[var(--color-muted)] uppercase tracking-wider font-bold">
            <MapPin className="w-3 h-3 mr-1 text-[var(--color-accent)]" />
            {provider.cities?.[0]}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-light tracking-tight text-[var(--color-foreground)]">
            {provider.business_name}
          </h3>
          <div className="flex items-center gap-1 opacity-50">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-[var(--color-primary)] fill-[var(--color-primary)]" />)}
          </div>
        </div>
        <p className="text-sm text-[var(--color-muted)] font-light leading-relaxed line-clamp-2 italic font-serif">
          {provider.description?.substring(0, 100)}...
        </p>
        <div className="pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-muted)] block mb-1 font-bold">À partir de</span>
            <span className="text-lg font-light tracking-tight text-[var(--color-foreground)]">{(provider.minPrice || 0).toLocaleString()} DA</span>
          </div>
          <Link to={`/prestataires/${provider.id}`}>
            <button className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--color-foreground)] border-b-2 border-[var(--color-accent)] pb-1 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all">Details</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
