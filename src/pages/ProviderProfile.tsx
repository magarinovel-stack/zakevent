import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Star, MapPin, CheckCircle2, MessageCircle, 
  Calendar, Camera, Clock, Languages,
  Award, Image as ImageIcon, Share2, Heart,
  ChevronLeft, ChevronRight, ShieldCheck as ShieldIcon,
  AlertCircle, Info
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ProviderProfile as ProviderProfileType, ServicePackage } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function ProviderProfile() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [provider, setProvider] = useState<ProviderProfileType | null>(null);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("19:00");
  const [guestCount, setGuestCount] = useState<number>(100);

  useEffect(() => {
    const fetchDoc = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data: providerData } = await supabase.from("providers").select("*").eq("id", id).single();
        if (providerData) {
          setProvider(providerData as unknown as ProviderProfileType);
          const { data: pkgs } = await supabase.from("service_packages").select("*").eq("provider_id", id).eq("is_active", true);
          setPackages((pkgs || []) as unknown as ServicePackage[]);
        }
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const handleBooking = async (packageName?: string, price?: number) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedDate) {
      toast.error(t("validation.required"));
      return;
    }

    if (!selectedTime) {
      toast.error(t("validation.required"));
      return;
    }

    const finalPrice = price || provider?.min_price || 0;
    const commission = finalPrice * 0.1;
    const totalWithCommission = finalPrice + commission;

    setBookingLoading(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        client_id: user.id,
        provider_id: id,
        total_amount: totalWithCommission,
        commission_amount: commission,
        status: "PENDING",
        payment_status: "NONE",
        event_date: selectedDate,
        event_time: selectedTime,
        guest_count: guestCount,
        notes: packageName || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success(t("toast.bookingSuccess"));
      navigate("/dashboard/client");
    } catch {
      toast.error(t("toast.bookingFailed"));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-serif text-2xl animate-pulse">{t("common.loadingExceptional")}</div>;
  if (!provider) return <div className="h-screen flex items-center justify-center">Prestataire introuvable.</div>;

  const coverUrl = provider.portfolio_urls?.[0] || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>{provider.business_name} | ZAKEVENTS</title>
        <meta name="description" content={provider.description?.substring(0, 160)} />
        <meta property="og:title" content={`${provider.business_name} - ${provider.category} à ${provider.cities?.[0]}`} />
        <meta property="og:image" content={coverUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Hero Header */}
      <div className="relative h-[60vh] min-h-[400px]">
        <img 
          src={coverUrl} 
          className="w-full h-full object-cover"
          alt="Cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Profile Card Floating */}
        <div className="absolute -bottom-24 left-6 right-6 lg:left-12 lg:right-12">
          <div className="bg-white rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-lg)] flex flex-col md:flex-row md:items-center justify-between gap-8 border border-[var(--color-border)]">
          <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white shadow-[var(--shadow-lg)] bg-white">
                <img src={coverUrl} className="w-full h-full object-cover" alt="Avatar" referrerPolicy="no-referrer" />
              </div>
              <div className="text-center md:text-left space-y-3">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <h1 className="text-3xl lg:text-5xl font-serif font-bold">{provider.business_name}</h1>
                  <div className="flex items-center gap-2">
                    {provider.is_premium && <CheckCircle2 className="w-6 h-6 text-[var(--color-primary)]" />}
                    {provider.is_premium && <Badge className="bg-[var(--color-primary)] text-white rounded-none">Premium</Badge>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[var(--color-muted)]">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[var(--color-primary)] border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 rounded-none">{provider.category}</Badge>
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <MapPin className="w-4 h-4 text-[var(--color-accent)]" />
                    {provider.cities?.[0]}
                  </div>
                  <div className="flex items-center gap-1 font-bold text-[var(--color-foreground)]">
                    <Star className="w-4 h-4 text-[var(--color-primary)] fill-[var(--color-primary)]" />
                    {provider.rating_average || 5.0} <span className="font-normal text-[var(--color-muted)] ml-1">({provider.review_count || 0} avis)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button variant="outline" className="flex-1 md:flex-initial h-12 rounded-none border-[var(--color-foreground)] text-[var(--color-foreground)] uppercase text-xs font-bold tracking-widest">
                <MessageCircle className="w-5 h-5 mr-3" />
                Contacter
              </Button>
              <Button 
                onClick={() => handleBooking()}
                disabled={bookingLoading}
                className="flex-1 md:flex-initial h-12 rounded-none bg-[var(--color-foreground)] text-white px-10 uppercase text-xs font-bold tracking-widest hover:bg-[var(--color-primary)] transition-all"
              >
                {bookingLoading ? t("common.loading") : t("common.book")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b border-[var(--color-border)] rounded-none h-14 p-0 space-x-8 rtl:space-x-reverse overflow-x-auto no-scrollbar">
              <TabsTrigger value="overview" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-transparent rounded-none h-full px-0 font-bold">Présentation</TabsTrigger>
              <TabsTrigger value="portfolio" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-transparent rounded-none h-full px-0 font-bold">Portfolio</TabsTrigger>
              <TabsTrigger value="prices" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-transparent rounded-none h-full px-0 font-bold">Tarifs & Services</TabsTrigger>
              <TabsTrigger value="availability" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-transparent rounded-none h-full px-0 font-bold">Disponibilités</TabsTrigger>
              <TabsTrigger value="reviews" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-[var(--color-primary)] data-[state=active]:bg-transparent rounded-none h-full px-0 font-bold">Avis</TabsTrigger>
            </TabsList>

            <div className="pt-10">
              <TabsContent value="overview" className="space-y-12 m-0 outline-none">
                <div className="prose max-w-none text-lg text-[var(--color-foreground)] leading-relaxed">
                  <h3 className="text-2xl font-serif mb-4">À propos de Zak Prod</h3>
                  <p>Spécialisé dans la photographie de mariage et d'événements d'exception à Oran et ses environs. Nous capturons chaque instant avec une approche artistique et moderne.</p>
                  <p className="mt-4">Chaque événement est unique, c'est pourquoi nous accordons une importance particulière à la préparation et au contact humain pour retranscrire fidèlement l'émotion de votre journée.</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <StatCard icon={<Award />} label="Expérience" value="8 ans" />
                  <StatCard icon={<Camera />} label="Événements" value="450+" />
                  <StatCard icon={<MapPin />} label="Rayon" value="100km" />
                  <StatCard icon={<Languages />} label="Langues" value="FR, AR" />
                </div>
              </TabsContent>

              <TabsContent value="portfolio" className="m-0 outline-none">
                <div className="columns-1 md:columns-2 gap-6 space-y-6">
                  {(provider.portfolio_urls || []).length > 0 ? (provider.portfolio_urls || []).map((url: string, idx: number) => (
                    <div key={idx} className="overflow-hidden rounded-[var(--radius-lg)] cursor-pointer hover:opacity-90 transition-all border border-[var(--color-border)]">
                      <img src={url} alt={`Portfolio ${idx + 1}`} className="w-full h-auto" referrerPolicy="no-referrer" />
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-20 text-[var(--color-muted)]">
                      <ImageIcon className="w-12 h-12 mx-auto opacity-20 mb-4" />
                      <p className="text-sm italic">Portfolio en cours de préparation.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="prices" className="space-y-8 m-0 outline-none">
                {packages.length > 0 ? packages.map((pkg: ServicePackage) => (
                  <Card key={pkg.id} className={cn("rounded-[var(--radius-xl)] border-2 transition-all p-8", "border-[var(--color-border)]")}>
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold">{pkg.name}</h3>
                        </div>
                        <p className="text-[var(--color-muted)]">{pkg.description}</p>
                      </div>
                      <div className="flex flex-col items-center md:items-end justify-center gap-4 min-w-[200px]">
                        <span className="text-3xl font-bold text-[var(--color-primary)] font-sans tracking-tight">{(pkg.priceDa || 0).toLocaleString()} DA</span>
                        <Button 
                          onClick={() => handleBooking(pkg.name, pkg.priceDa)}
                          disabled={bookingLoading}
                          className="w-full bg-[var(--color-foreground)] text-white hover:bg-[var(--color-primary)] rounded-none h-12 uppercase text-[10px] font-bold tracking-widest"
                        >
                           Choisir cette offre
                        </Button>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <div className="text-center py-20 text-[var(--color-muted)]">
                    <Info className="w-12 h-12 mx-auto opacity-20 mb-4" />
                    <p className="text-sm italic">Tarifs disponibles sur demande.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="availability" className="m-0 outline-none">
                <Card className="rounded-[var(--radius-xl)] border-[var(--color-border)] p-8">
                  <div className="text-center space-y-4">
                    <Calendar className="w-12 h-12 mx-auto text-[var(--color-primary)] opacity-20" />
                    <p className="text-lg">{t("common.calendarLoading")}</p>
                    <p className="text-sm text-[var(--color-muted)]">Veuillez contacter le prestataire pour confirmer la date souhaitée.</p>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-8 m-0 outline-none">
                 <div className="flex items-center gap-8 p-8 bg-white rounded-[var(--radius-xl)] border border-[var(--color-border)]">
                    <div className="text-center space-y-1">
                       <p className="text-5xl font-serif font-bold text-[var(--color-primary)]">{provider.rating_average || 5.0}</p>
                       <div className="flex justify-center">
                          {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-[var(--color-primary)] fill-[var(--color-primary)]" />)}
                       </div>
                       <p className="text-xs text-[var(--color-muted)] uppercase font-bold tracking-widest">128 avis</p>
                    </div>
                    <div className="flex-1 space-y-2">
                       <RatingBar star={5} percent={85} />
                       <RatingBar star={4} percent={12} />
                       <RatingBar star={3} percent={2} />
                       <RatingBar star={2} percent={1} />
                       <RatingBar star={1} percent={0} />
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    {[1,2,3].map(i => (
                      <Card key={i} className="rounded-[var(--radius-lg)] border-[var(--color-border)] p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold">Y</div>
                              <div>
                                <p className="font-bold">Yasmine B.</p>
                                <p className="text-xs text-[var(--color-muted)]">Mariage · 20 Août 2024</p>
                              </div>
                            </div>
                            <div className="flex">
                              {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-[var(--color-primary)] fill-[var(--color-primary)]" />)}
                            </div>
                          </div>
                          <p className="text-[var(--color-muted)]">Service exceptionnel ! Zak a su nous mettre à l'aise dès le début et le résultat est magnifique. Les photos sont pleines d'émotions. Je recommande vivement.</p>
                        </div>
                      </Card>
                    ))}
                 </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Sticky Sidebar */}
        <aside className="space-y-8 h-fit lg:sticky lg:top-32">
          <Card className="rounded-[var(--radius-xl)] border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-sm)]">
            <div className="bg-[var(--color-primary)] p-6 text-white">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">À partir de</span>
              <p className="text-3xl font-bold">25 000 DA</p>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-muted)]">{t('booking.date')}</label>
                       <input 
                         type="date" 
                         value={selectedDate}
                         onChange={(e) => setSelectedDate(e.target.value)}
                         min={new Date().toISOString().split('T')[0]}
                         className="w-full h-12 bg-[var(--color-background-alt)] border border-[var(--color-border)] px-4 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-muted)]">{t('booking.time')}</label>
                       <input 
                         type="time" 
                         value={selectedTime}
                         onChange={(e) => setSelectedTime(e.target.value)}
                         className="w-full h-12 bg-[var(--color-background-alt)] border border-[var(--color-border)] px-4 text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-muted)]">{t('booking.guests')}</label>
                    <div className="flex items-center bg-[var(--color-background-alt)] border border-[var(--color-border)]">
                       <button 
                         onClick={() => setGuestCount(Math.max(1, guestCount - 10))}
                         className="w-12 h-12 flex items-center justify-center text-[var(--color-foreground)] hover:bg-white transition-colors"
                       >-</button>
                       <input 
                         type="number" 
                         value={guestCount}
                         onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                         className="flex-1 h-12 bg-transparent text-center text-sm font-bold focus:outline-none"
                       />
                       <button 
                         onClick={() => setGuestCount(guestCount + 10)}
                         className="w-12 h-12 flex items-center justify-center text-[var(--color-foreground)] hover:bg-white transition-colors"
                       >+</button>
                    </div>
                    {provider?.max_capacity && guestCount > provider.max_capacity && (
                      <p className="text-[10px] text-[var(--color-accent)] font-bold uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {t('booking.capacityAlert')} ({provider.max_capacity})
                      </p>
                    )}
                 </div>

                 <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
                    <div className="flex justify-between text-[11px] uppercase tracking-widest font-bold">
                       <span className="text-[var(--color-muted)]">{t('booking.basePrice')}</span>
                       <span className="text-[var(--color-foreground)]">{(provider?.min_price || 0).toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between text-[11px] uppercase tracking-widest font-bold">
                       <span className="text-[var(--color-muted)]">{t('booking.serviceFee')}</span>
                       <span className="text-[var(--color-foreground)]">{((provider?.min_price || 0) * 0.1).toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between text-[13px] uppercase tracking-[0.2em] font-bold pt-2 border-t border-dashed border-[var(--color-border)]">
                       <span className="text-[var(--color-foreground)]">{t('booking.total')}</span>
                       <span className="text-[var(--color-primary)]">{((provider?.min_price || 0) * 1.1).toLocaleString()} DA</span>
                    </div>
                    <div className="pt-2">
                       <p className="text-[9px] text-[var(--color-muted)] italic font-medium">
                         * {t('booking.cancelPolicy')}
                       </p>
                    </div>
                 </div>
              </div>
              <div className="space-y-4">
                <Button 
                   onClick={() => handleBooking()}
                   disabled={bookingLoading}
                   className="w-full bg-[var(--color-foreground)] text-white rounded-none h-14 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--color-primary)] transition-all"
                >
                   {bookingLoading ? "..." : t('booking.bookBtn')}
                </Button>
                
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[var(--color-muted)]">{t('booking.respondMsg')}</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-[var(--color-muted)]" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[var(--color-foreground)] text-white border-none rounded-none text-[10px] p-4 max-w-[200px]">
                      {t('booking.escrowMsg')}
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Button variant="outline" className="w-full rounded-none h-14 border-[var(--color-foreground)] text-[var(--color-foreground)] uppercase text-xs font-bold tracking-widest">Message</Button>
              </div>
              <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-center gap-6">
                <button className="flex flex-col items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-primary)]">
                  <Heart className="w-5 h-5" />
                  <span className="text-[10px] uppercase font-bold">Sauvegarder</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-[var(--color-muted)] hover:text-[var(--color-primary)]">
                  <Share2 className="w-5 h-5" />
                  <span className="text-[10px] uppercase font-bold">Partager</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[var(--radius-xl)] border-[var(--color-border)] p-8 space-y-6">
            <h4 className="font-bold text-lg">ZAKEVENTS Protection</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <ShieldIcon className="w-5 h-5 text-[var(--color-success)] mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">Paiement Sécurisé</p>
                  <p className="text-xs text-[var(--color-muted)]">Votre argent est gardé en séquestre jusqu'à la fin de l'événement.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Award className="w-5 h-5 text-[var(--color-primary)] mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">Profil Vérifié</p>
                  <p className="text-xs text-[var(--color-muted)]">Nous avons vérifié les documents légaux de ce prestataire.</p>
                </div>
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] flex flex-col items-center text-center space-y-2">
      <div className="text-[var(--color-primary)]">{icon}</div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-muted)]">{label}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  );
}

function RatingBar({ star, percent }: { star: number, percent: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-bold w-4">{star}</span>
      <div className="flex-1 h-2 bg-[var(--color-background-alt)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${percent}%` }} />{/* ds-ignore */}
      </div>
      <span className="text-xs text-[var(--color-muted)] w-8">{percent}%</span>
    </div>
  );
}
