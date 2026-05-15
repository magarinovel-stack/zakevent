import { Helmet } from "react-helmet-async";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useInView } from "react-intersection-observer";
import { 
  Filter, MapPin, Star, Search, 
  LayoutGrid, List as ListIcon,
  CheckCircle2, SlidersHorizontal,
  ChevronDown, ArrowUp, BrainCircuit,
  Calculator, Sparkles
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { aiService } from "@/services/aiService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";

interface Provider {
  id: string;
  businessName: string;
  category: string;
  cities?: string[];
  ratingAverage?: number;
  reviewCount?: number;
  isPremium?: boolean;
  minPrice?: number;
  description?: string;
  coverPhotoUrl?: string;
  status?: string;
}

interface BudgetResults {
  [key: string]: number | string;
}

interface SearchResponse {
  results: Provider[];
}

export default function SearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? searchParams.get('category')!.split(',') : []
  );
  const [priceRange, setPriceRange] = useState([0, parseInt(searchParams.get('maxPrice') || "1000000")]);
  const [minRating, setMinRating] = useState(parseInt(searchParams.get('minRating') || "0"));
  const [onlyVerified, setOnlyVerified] = useState(searchParams.get('verified') === 'true');

  // Handle URL Sync
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
    if (selectedCities.length > 0) params.city = selectedCities.join(',');
    if (searchTerm) params.q = searchTerm;
    if (priceRange[1] !== 1000000) params.maxPrice = priceRange[1].toString();
    if (minRating > 0) params.minRating = minRating.toString();
    if (onlyVerified) params.verified = 'true';
    
    setSearchParams(params, { replace: true });
  }, [selectedCategories, selectedCities, searchTerm, priceRange, minRating, onlyVerified]);

  // Pagination / Infinite Scroll
  const [displayCount, setDisplayCount] = useState(9);
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [budgetResults, setBudgetResults] = useState<BudgetResults | null>(null);

  const handleAiOptimize = async () => {
    setIsAiLoading(true);
    try {
      const result = await aiService.optimizeBudget(priceRange[1], 150, "Mariage");
      setBudgetResults(result);
      toast.success(t("search.budgetOptimized"));
    } catch (err) {
      toast.error(t("search.aiOptimizeFailed"));
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (inView && !loading && displayCount < filteredProviders.length) {
      setDisplayCount(prev => prev + 6);
    }
  }, [inView]);

  useEffect(() => {
    fetchProviders();
  }, [selectedCategories, selectedCities, searchTerm, minRating, onlyVerified, priceRange]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: selectedCategories.join(','),
        city: selectedCities.join(','),
        q: searchTerm,
        minRating: minRating.toString(),
        onlyVerified: onlyVerified.toString(),
        maxPrice: priceRange[1].toString()
      });

      const { api } = await import('@/lib/api');
      const response = await api(`/api/search?${params.toString()}`);
      if (!response.ok) throw new Error('Search failed');
      const data: SearchResponse = await response.json();
      setProviders(data.results);
    } catch (error) {
      toast.error(t("search.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  // Memoized client-side filtering and sorting for performance
  const filteredProviders = useMemo(() => {
    let result = providers.filter(p => {
      const matchesSearch = p.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCities.length === 0 || p.cities?.some((c: string) => selectedCities.includes(c));
      const matchesRating = (p.ratingAverage || 0) >= minRating;
      const matchesVerified = !onlyVerified || p.isPremium;
      const matchesPrice = (p.minPrice || 0) <= priceRange[1];
      
      return matchesSearch && matchesCity && matchesRating && matchesVerified && matchesPrice;
    });

    // Handle Sorting
    if (sortBy === "rating") {
      result.sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0));
    } else if (sortBy === "price_asc") {
      result.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
    }

    return result;
  }, [providers, searchTerm, selectedCities, selectedCategories, priceRange, minRating, onlyVerified, sortBy]);

  const displayedProviders = filteredProviders.slice(0, displayCount);

  const toggleCity = (city: string) => {
    setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
    setDisplayCount(9);
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]);
    setDisplayCount(9); 
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1600px] mx-auto min-h-screen bg-[var(--color-background-alt)]">
      <Helmet>
        <title>Trouver un Prestataire | ZAKEVENTS</title>
        <meta name="description" content="Recherchez et filtrez parmi les meilleurs prestataires d'événements en Algérie." />
      </Helmet>
      
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Sidebar Filters */}
        <aside className={cn(
          "lg:w-80 space-y-12 lg:sticky lg:top-32 h-fit bg-white lg:bg-transparent p-6 lg:p-0 rounded-[var(--radius-sm)] z-40 transition-all shadow-[var(--shadow-lg)] lg:shadow-none overflow-y-auto",
          isSidebarOpen ? "fixed inset-0 translate-y-0" : "fixed inset-0 translate-y-full lg:static lg:translate-y-0"
        )}>
          <div className="flex items-center justify-between lg:hidden border-b border-[var(--color-border)] pb-6 mb-8">
            <h2 className="text-xl font-light tracking-tight">Filtres</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <ChevronDown className="w-6 h-6" />
            </Button>
          </div>

          <div className="space-y-12 pr-2 custom-scrollbar lg:h-[calc(100vh-16rem)] lg:overflow-y-auto">
            <FilterBlock title="Mots-clés">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                <Input 
                  placeholder={t("search.placeholder")} 
                  className="pl-10 h-12 bg-white border-[var(--color-border)] rounded-[var(--radius-sm)] focus-visible:ring-[var(--color-foreground)] font-sans"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setDisplayCount(9);
                  }}
                />
              </div>
            </FilterBlock>

            <FilterBlock title="Villes">
              <div className="grid grid-cols-1 gap-4">
                {CITIES.map(city => (
                  <div key={city} className="flex items-center space-x-3 rtl:space-x-reverse group cursor-pointer" onClick={() => toggleCity(city)}>
                    <Checkbox 
                      id={`city-${city}`} 
                      checked={selectedCities.includes(city)}
                      className="border-[var(--color-border)] data-[state=checked]:bg-[var(--color-foreground)] rounded-[var(--radius-sm)]"
                    />
                    <label htmlFor={`city-${city}`} className="text-xs uppercase tracking-widest font-bold text-[var(--color-muted)] group-hover:text-[var(--color-foreground)] transition-colors cursor-pointer">{city}</label>
                  </div>
                ))}
              </div>
            </FilterBlock>

            <FilterBlock title="Catégories">
              <div className="grid grid-cols-1 gap-4">
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="flex items-center space-x-3 rtl:space-x-reverse group cursor-pointer" onClick={() => toggleCategory(cat.id)}>
                    <Checkbox 
                      id={`cat-${cat.id}`} 
                      checked={selectedCategories.includes(cat.id)}
                      className="border-[var(--color-border)] data-[state=checked]:bg-[var(--color-foreground)] rounded-[var(--radius-sm)]"
                    />
                    <label htmlFor={`cat-${cat.id}`} className="text-xs uppercase tracking-widest font-bold text-[var(--color-muted)] group-hover:text-[var(--color-foreground)] transition-colors cursor-pointer">{cat.label}</label>
                  </div>
                ))}
              </div>
            </FilterBlock>

            <FilterBlock title="Capacité Budget">
              <div className="space-y-8 px-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[var(--color-muted)]">Limite Max</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled
                    title="Coming soon"
                    className="h-6 text-[var(--color-muted)] rounded-[var(--radius-sm)] text-[9px] font-bold uppercase tracking-widest opacity-50 cursor-not-allowed"
                  >
                    <BrainCircuit className="w-3 h-3 mr-1.5" />
                    Bientôt
                  </Button>
                </div>
                <Slider 
                  value={[priceRange[1]]} 
                  onValueChange={(val) => {
                    const v = Array.isArray(val) ? val : [val];
                    setPriceRange([0, v[0]]);
                    setDisplayCount(9);
                  }} 
                  max={2000000} 
                  step={10000} 
                  className="[&_[role=slider]]:bg-[var(--color-foreground)] [&_[role=slider]]:border-none"
                />
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--color-primary)]">
                  <span>{priceRange[0].toLocaleString()} DA</span>
                  <span>{priceRange[1].toLocaleString()} DA</span>
                </div>

                <AnimatePresence>
                  {budgetResults && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden border-t border-[var(--color-border)] pt-6 space-y-4"
                    >
                      <div className="flex items-center gap-2 text-[var(--color-primary)]">
                        <Sparkles className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Répartition IA</span>
                      </div>
                      <div className="bg-[var(--color-background-alt)] p-4 space-y-3">
                        {Object.entries(budgetResults).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-[9px] uppercase tracking-widest font-bold">
                            <span className="text-[var(--color-muted)]">{k}</span>
                            <span className="text-[var(--color-foreground)]">{typeof v === 'number' ? v.toLocaleString() : v} DA</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setBudgetResults(null)}
                        className="w-full text-[var(--color-muted)] text-[8px] uppercase tracking-widest"
                      >
                        Effacer l'analyse
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FilterBlock>

            <FilterBlock title="Note Minimale">
              <div className="flex gap-2">
                {[3, 4, 5].map(star => (
                  <Button 
                    key={star} 
                    variant={minRating === star ? "primary" : "outline"}
                    size="sm" 
                    onClick={() => {
                      setMinRating(minRating === star ? 0 : star);
                      setDisplayCount(9);
                    }}
                    className={cn(
                      "flex-1 h-10 border-[var(--color-border)] rounded-[var(--radius-sm)] text-xs tracking-tighter transition-all",
                      minRating === star ? "bg-[var(--color-foreground)] text-white" : "text-[var(--color-foreground)] hover:bg-[var(--color-foreground)] hover:text-white"
                    )}
                  >
                    {star}+ <Star className={cn("w-3 h-3 ml-1", minRating === star ? "fill-white text-white" : "fill-[var(--color-primary)] text-[var(--color-primary)]")} />
                  </Button>
                ))}
              </div>
            </FilterBlock>

            <div className="flex items-center justify-between pt-8 border-t border-[var(--color-border)]">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-foreground)]">Certifiés</label>
                <p className="text-[9px] text-[var(--color-muted)] uppercase tracking-wider">Vérification Premium</p>
              </div>
              <Switch 
                checked={onlyVerified} 
                onCheckedChange={(val) => {
                  setOnlyVerified(val);
                  setDisplayCount(9);
                }}
                className="data-[state=checked]:bg-[var(--color-accent)]"
              />
            </div>
          </div>
        </aside>

        {/* Results Content */}
        <main className="flex-1 space-y-12">
          {/* Top Bar with Sort & View Toggle */}
          <div className="space-y-6">
            <div className="bg-white p-10 rounded-[var(--radius-sm)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in slide-in-from-top duration-700">
              <div className="space-y-2">
                <h1 className="text-4xl font-extralight tracking-tight text-[var(--color-foreground)] font-sans italic">
                  {selectedCategories.length === 1 
                    ? CATEGORIES.find(c => c.id === selectedCategories[0])?.label 
                    : 'Collections Curatées'}
                </h1>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)] font-bold">{filteredProviders.length} Perles Algériennes Découvertes</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center bg-[var(--color-background-alt)] rounded-[var(--radius-sm)] p-1 border border-[var(--color-border)]">
                  <button 
                    onClick={() => setView('grid')}
                    className={cn("p-3 border border-transparent transition-all", view === 'grid' ? "bg-white border-[var(--color-border)] text-[var(--color-foreground)] shadow-[var(--shadow-sm)]" : "text-[var(--color-muted)]")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setView('list')}
                    className={cn("p-3 border border-transparent transition-all", view === 'list' ? "bg-white border-[var(--color-border)] text-[var(--color-foreground)] shadow-[var(--shadow-sm)]" : "text-[var(--color-muted)]")}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>

                <Select value={sortBy} onValueChange={(val) => {
                  setSortBy(val || "relevance");
                  setDisplayCount(9);
                }}>
                  <SelectTrigger className="w-[200px] h-12 bg-white border-[var(--color-border)] rounded-[var(--radius-sm)] focus:ring-0 uppercase text-[10px] font-bold tracking-widest">
                    <SelectValue placeholder={t("search.sortBy")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-[var(--radius-sm)]">
                    <SelectItem value="relevance" className="text-[10px] uppercase tracking-widest font-bold">{t("search.sortRelevance")}</SelectItem>
                    <SelectItem value="rating" className="text-[10px] uppercase tracking-widest font-bold">{t("search.sortRating")}</SelectItem>
                    <SelectItem value="price_asc" className="text-[10px] uppercase tracking-widest font-bold">{t("search.sortPriceAsc")}</SelectItem>
                    <SelectItem value="price_desc" className="text-[10px] uppercase tracking-widest font-bold">{t("search.sortPriceDesc")}</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  className="lg:hidden h-12 border-[var(--color-foreground)] rounded-[var(--radius-sm)] px-6 uppercase text-[10px] font-bold tracking-widest"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
              </div>
            </div>

            {/* Active Filter Chips */}
            <div className="flex flex-wrap gap-3">
              {selectedCategories.map(cat => (
                <Badge key={cat} variant="secondary" className="bg-white border-[var(--color-border)] text-[var(--color-foreground)] rounded-[var(--radius-sm)] px-3 py-1 text-[9px] uppercase tracking-widest flex items-center gap-2">
                  {CATEGORIES.find(c => c.id === cat)?.label}
                  <button onClick={() => toggleCategory(cat)} className="hover:text-[var(--color-primary)]">×</button>
                </Badge>
              ))}
              {selectedCities.map(city => (
                <Badge key={city} variant="secondary" className="bg-white border-[var(--color-border)] text-[var(--color-foreground)] rounded-[var(--radius-sm)] px-3 py-1 text-[9px] uppercase tracking-widest flex items-center gap-2">
                  {city}
                  <button onClick={() => toggleCity(city)} className="hover:text-[var(--color-primary)]">×</button>
                </Badge>
              ))}
              {minRating > 0 && (
                <Badge variant="secondary" className="bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-[var(--radius-sm)] px-3 py-1 text-[9px] uppercase tracking-widest flex items-center gap-2">
                  {minRating}+ {t('search.ratingStars') || 'Stars'}
                  <button onClick={() => setMinRating(0)} className="hover:text-[var(--color-foreground)]">×</button>
                </Badge>
              )}
              {(selectedCategories.length > 0 || selectedCities.length > 0 || minRating > 0) && (
                <button 
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedCities([]);
                    setMinRating(0);
                  }}
                  className="text-[9px] uppercase tracking-widest font-bold text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors underline underline-offset-4"
                >
                  {t('search.clearBtn')}
                </button>
              )}
            </div>
          </div>

          {/* Grid/List Results with Infinite Scroll Skeletons */}
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-[450px] bg-white animate-pulse border border-[var(--color-border)]" />
                ))}
             </div>
          ) : (
            <div className={cn(
              "grid gap-16 animate-in fade-in slide-in-from-bottom duration-1000",
              view === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            )}>
              {displayedProviders.map((p) => (
                <ProviderCard key={p.id} provider={p} view={view} />
              ))}
              
              {/* Load more sentinel */}
              {displayCount < filteredProviders.length && (
                <div ref={loadMoreRef} className="col-span-full h-20 flex items-center justify-center">
                  <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-ping" />
                </div>
              )}
            </div>
          )}

          {filteredProviders.length === 0 && !loading && (
            <div className="text-center py-40 space-y-8 animate-in zoom-in duration-700">
              <Search className="w-24 h-24 text-[var(--color-border)] mx-auto opacity-20" />
              <div className="space-y-4">
                <h3 className="text-3xl font-extralight tracking-tight text-[var(--color-foreground)]">L'exception n'a pas été trouvée</h3>
                <p className="text-sm text-[var(--color-muted)] font-serif italic">Essayez d'élargir votre recherche pour découvrir d'autres talents.</p>
                <Button 
                  variant="outline" 
                   onClick={() => {
                    setSelectedCities([]);
                    setSelectedCategories([]);
                    setPriceRange([0, 1000000]);
                    setMinRating(0);
                    setOnlyVerified(false);
                    setSearchTerm("");
                  }}
                  className="rounded-[var(--radius-sm)] border-[var(--color-foreground)] text-[var(--color-foreground)] h-12 px-10 uppercase text-[10px] font-bold tracking-widest mt-8"
                >
                  Tout réinitialiser
                </Button>
              </div>
            </div>
          )}
          
          {/* Scroll to top fab */}
          <button 
            onClick={scrollToTop}
            className="fixed bottom-12 right-12 w-14 h-14 bg-white border border-[var(--color-border)] shadow-[var(--shadow-lg)] flex items-center justify-center group hover:bg-[var(--color-foreground)] transition-all z-50 text-[var(--color-foreground)] hover:text-white"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          </button>
        </main>
      </div>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--color-foreground)] border-l-2 border-[var(--color-primary)] pl-4">{title}</h3>
      <div className="animate-in fade-in duration-500">
        {children}
      </div>
    </div>
  );
}

function ProviderCard({ provider, view }: { provider: Provider, view: 'grid' | 'list' }) {
  const [isPrefetching, setIsPrefetching] = useState(false);
  const imageUrl = provider.coverPhotoUrl || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop";

  const handleMouseEnter = () => {
    setIsPrefetching(true);
  };

  if (view === 'list') {
    return (
      <Link 
        onMouseEnter={handleMouseEnter}
        to={`/prestataires/${provider.id}`} 
        className="group bg-white rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-border)] transition-all flex flex-col md:flex-row hover:shadow-[var(--shadow-lg)] transform hover:-translate-y-1 duration-700"
      >
        <div className="relative w-full md:w-[450px] h-72 md:h-auto overflow-hidden bg-[var(--color-foreground)]">
          <img src={imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105 duration-1000" alt={provider.businessName} referrerPolicy="no-referrer" />
          {provider.isPremium && <Badge className="absolute top-8 left-8 bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)] uppercase text-[8px] font-bold tracking-[0.3em] px-6 py-3 shadow-[var(--shadow-lg)]">Excellence</Badge>}
        </div>
        <div className="flex-1 p-12 space-y-8 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.3em] font-sans">{provider.category}</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-background-alt)] border border-[var(--color-border)]">
                <Star className="w-3.5 h-3.5 text-[var(--color-primary)] fill-[var(--color-primary)]" />
                <span className="text-sm font-bold font-sans">{provider.ratingAverage?.toFixed(1) || "5.0"}</span>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-4xl font-extralight tracking-tight text-[var(--color-foreground)] flex items-center font-sans group-hover:text-[var(--color-primary)] transition-colors">
                {provider.businessName}
              </h3>
              <div className="flex items-center text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)] font-bold italic">
                <MapPin className="w-4 h-4 mr-3 text-[var(--color-accent)]" />
                {provider.cities?.join(", ") || 'Algérie'}
              </div>
            </div>
            <p className="text-[var(--color-muted)] font-light leading-relaxed line-clamp-2 italic font-serif text-lg">"{provider.description || "Une signature unique pour vos moments d'exception."}"</p>
          </div>
          <div className="flex items-end justify-between pt-10 border-t border-[var(--color-border)]">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)] block mb-2 font-bold">Investissement Minimal</span>
              <span className="text-3xl font-extralight tracking-tighter text-[var(--color-foreground)]">{(provider.minPrice || 45000).toLocaleString()} DA</span>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="rounded-[var(--radius-sm)] border-[var(--color-foreground)] h-14 px-10 text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-[var(--color-foreground)] hover:text-white transition-all">Consulter l'Artiste</Button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      onMouseEnter={handleMouseEnter}
      to={`/prestataires/${provider.id}`} 
      className="group bg-white rounded-[var(--radius-sm)] overflow-hidden border border-[var(--color-border)] transition-all hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] transform hover:-translate-y-4 duration-700 h-full flex flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-foreground)]">
        <img src={imageUrl} className="w-full h-full object-cover opacity-90 transition-all group-hover:scale-110 group-hover:opacity-100 duration-1000 grayscale group-hover:grayscale-0" alt={provider.businessName} referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {provider.isPremium && <Badge className="absolute top-8 left-8 bg-[var(--color-foreground)] text-white rounded-[var(--radius-sm)] uppercase text-[8px] font-bold tracking-[0.3em] px-4 py-2.5">Premium Partner</Badge>}
        
        {/* Quick view on hover */}
        <div className="absolute inset-x-8 bottom-12 flex flex-col items-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-12 group-hover:translate-y-0 duration-700">
            <div className="h-px w-20 bg-[var(--color-primary)]" />
            <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-white">Découvrir l'Expérience</span>
        </div>
      </div>
      <div className="p-10 space-y-8 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-[0.3em] font-sans">{provider.category}</span>
            <div className="flex items-center text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-bold">
              <MapPin className="w-3.5 h-3.5 mr-2 text-[var(--color-accent)]" />
              {provider.cities?.[0]}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-extralight tracking-tight text-[var(--color-foreground)] font-sans group-hover:text-[var(--color-primary)] transition-colors leading-tight">{provider.businessName}</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 opacity-60">
                 {[1,2,3,4,5].map(s => <Star key={s} className={cn("w-3 h-3", s <= Math.floor(provider.ratingAverage || 5) ? "fill-[var(--color-primary)] text-[var(--color-primary)]" : "text-[var(--color-border)]")} />)}
              </div>
              <span className="text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-widest">({provider.reviewCount || 0} avis)</span>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-[var(--color-border)] flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-muted)] block font-bold mb-1">À partir de</span>
            <span className="text-2xl font-extralight tracking-tighter text-[var(--color-foreground)] italic">{(provider.minPrice || 45000).toLocaleString()} DA</span>
          </div>
          <div className="w-10 h-10 border border-[var(--color-border)] flex items-center justify-center group-hover:bg-[var(--color-foreground)] group-hover:text-white transition-all">
             <ChevronDown className="w-4 h-4 rotate-270" />
          </div>
        </div>
      </div>
    </Link>
  );
}
