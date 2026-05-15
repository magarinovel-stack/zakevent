import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { useAuth, UserProfile } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, ClipboardList, UserCircle, 
  Images, CreditCard, MessageSquare,
  BarChart3, Star, LogOut, TrendingUp,
  Check, X, Eye, Phone, Mail, Clock, Calendar, MapPin, ChevronDown, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

import ProfileSettings from "@/components/dashboard/ProfileSettings";

export default function ProviderDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [providerProfile, setProviderProfile] = useState<Record<string, any> | null>(null);
  const [bookings, setBookings] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoading(true);
      try {
        const { data: provData } = await supabase.from("providers").select("*").eq("user_id", user.id).single();
        if (provData) setProviderProfile(provData);

        const { data: bData } = await supabase
          .from("bookings")
          .select("*")
          .eq("provider_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        setBookings(bData || []);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await supabase.from("bookings").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", bookingId);
      setBookings(prev => prev.map(b => (b as Record<string, any>).id === bookingId ? { ...b, status: newStatus } : b));
    } catch {
      // Error handled silently
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navItems = [
    { name: "Vue d'ensemble", path: "/dashboard/prestataire", icon: LayoutDashboard },
    { name: "Réservations", path: "/dashboard/prestataire/bookings", icon: ClipboardList },
    { name: "Mon profil", path: "/dashboard/prestataire/profile", icon: UserCircle },
    { name: "Portfolio", path: "/dashboard/prestataire/portfolio", icon: Images },
    { name: "Tarifs & Services", path: "/dashboard/prestataire/pricing", icon: CreditCard },
    { name: "Messages", path: "/dashboard/prestataire/messages", icon: MessageSquare },
    { name: "Statistiques", path: "/dashboard/prestataire/analytics", icon: BarChart3 },
    { name: "Avis reçus", path: "/dashboard/prestataire/reviews", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background-alt)] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[var(--color-foreground)] fixed h-screen top-0 left-0 pt-32 pb-8 px-6 space-y-12 z-20 transition-all">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
             {profile?.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : providerProfile?.businessName?.charAt(0) || "P"}
          </div>
          <div className="space-y-0.5 max-w-[150px]">
            <p className="font-bold text-white text-sm tracking-tight truncate">{providerProfile?.businessName || "Prestataire"}</p>
            <div className="flex items-center gap-2">
                <Badge className={cn(
                    "text-[8px] uppercase font-bold tracking-widest",
                    providerProfile?.status === 'APPROVED' ? "bg-[var(--color-primary)]" : "bg-[var(--color-accent)]"
                )}>
                    {providerProfile?.status || 'PENDING'}
                </Badge>
                {providerProfile?.isPremium && <Badge className="bg-[var(--color-primary)] text-[8px] tracking-widest">PREMIUM</Badge>}
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-none transition-all font-medium text-xs uppercase tracking-widest",
                  isActive ? "bg-white text-[var(--color-foreground)] shadow-[var(--shadow-lg)]" : "text-white/40 hover:text-white"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-[var(--color-foreground)]" : "text-white/30")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="flex items-center justify-start gap-3 px-4 py-3 text-white/30 hover:bg-white/5 hover:text-white rounded-none transition-all text-xs uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-40 pb-24 px-6 lg:px-12 max-w-6xl">
        <Helmet>
           <title>{providerProfile?.businessName || "Dashboard"} | Dashboard Prestataire | ZAKEVENTS</title>
        </Helmet>
        <Routes>
          <Route path="/" element={<ProviderOverview profile={providerProfile || {}} bookings={bookings} />} />
          <Route path="/bookings" element={<ProviderBookings bookings={bookings} onUpdateStatus={handleUpdateBookingStatus} />} />
          <Route path="/profile" element={<ProfileSettings type="provider" />} />
          <Route path="/pricing" element={<div className="py-20 text-center font-serif italic text-[var(--color-muted)]">Gestion des tarifs bientôt disponible...</div>} />
          <Route path="/portfolio" element={<div className="py-20 text-center font-serif italic text-[var(--color-muted)]">Gestion du portfolio bientôt disponible...</div>} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reviews" element={<div className="py-20 text-center font-serif italic text-[var(--color-muted)]">Vos avis clients bientôt disponible...</div>} />
          <Route path="/messages" element={<div className="py-20 text-center font-serif italic text-[var(--color-muted)]">Messagerie instantanée bientôt disponible...</div>} />
        </Routes>
      </main>
    </div>
  );
}

function ProviderOverview({ profile, bookings }: { profile: Record<string, any>, bookings: Record<string, any>[] }) {
  const confirmed = bookings.filter(b => b.status === "CONFIRMED").length;
  const pending = bookings.filter(b => b.status === "PENDING").length;
  const totalRevenue = bookings.filter(b => b.status === "CONFIRMED" || b.status === "COMPLETED").reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const data = [
    { name: 'Lun', views: 400 },
    { name: 'Mar', views: 300 },
    { name: 'Mer', views: 600 },
    { name: 'Jeu', views: 800 },
    { name: 'Ven', views: 500 },
    { name: 'Sam', views: 900 },
    { name: 'Dim', views: 700 },
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--color-border)] pb-12">
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)]">Dashboard</span>
          <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-[var(--color-foreground)]">Vue d'ensemble</h1>
          <p className="text-[var(--color-muted)] font-light max-w-sm">Performance et pilotage de votre activité en Algérie.</p>
        </div>
        <div className="flex gap-4">
           {profile?.status !== 'APPROVED' && (
              <Badge className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20 h-12 rounded-none text-[10px] flex items-center gap-2 uppercase tracking-widest font-bold px-6">
                 <Clock className="w-4 h-4" /> En attente de validation
              </Badge>
           )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[var(--color-border)] border border-[var(--color-border)]">
        <StatCard title="Vues" value="0.0k" trend="+0%" trendType="up" />
        <StatCard title="Demandes" value={pending.toString()} trend="+0%" trendType="up" />
        <StatCard title="Revenus (DA)" value={totalRevenue.toLocaleString()} trend="+0%" trendType="up" />
        <StatCard title="Note" value={profile?.ratingAverage?.toFixed(1) || "5.0"} trend="+0.1" trendType="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <Card className="lg:col-span-2 rounded-none border-[var(--color-border)] shadow-none p-10 bg-white">
            <CardHeader className="px-0 pt-0 pb-12 flex flex-row items-center justify-between">
               <div className="space-y-1">
                 <CardTitle className="text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)]">Trafic Hebdomadaire</CardTitle>
                 <p className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider">Vues uniques du profil</p>
               </div>
               <TrendingUp className="text-[var(--color-primary)] w-5 h-5" />
            </CardHeader>
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-background-alt)" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-muted)', fontWeight: 600 }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-muted)', fontWeight: 600 }} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '0px', border: '1px solid var(--color-border)', boxShadow: 'none' }} // ds-ignore
                     />
                     <Line type="monotone" dataKey="views" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </Card>

         <Card className="rounded-none border-[var(--color-border)] shadow-none p-10 bg-white flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)] mb-10">Dernières Demandes</h3>
            <div className="flex-1 space-y-10">
               {bookings.filter(b => b.status === 'PENDING').slice(0, 3).map((booking, i) => (
                  <div key={booking.id} className="flex items-center gap-6 group cursor-pointer">
                     <div className="w-12 h-12 rounded-none bg-[var(--color-background-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-foreground)] font-bold text-xs scale-100 group-hover:scale-110 transition-transform font-sans uppercase">
                        {booking.clientName?.substring(0, 2) || "CL"}
                     </div>
                     <div className="flex-1 space-y-1">
                        <p className="text-sm font-bold text-[var(--color-foreground)]">{booking.clientName || "Nouveau Client"}</p>
                        <p className="text-[9px] uppercase tracking-widest text-[var(--color-muted)] font-bold">
                           {booking.packageName} · {new Date(booking.eventDate?.toDate?.() || booking.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </p>
                     </div>
                     <ChevronRight className="w-4 h-4 text-[var(--color-border)] group-hover:text-[var(--color-foreground)] transition-colors" />
                  </div>
               ))}
               {bookings.filter(b => b.status === 'PENDING').length === 0 && (
                  <p className="text-center italic text-[var(--color-muted)] text-xs pt-10">Aucune demande en attente.</p>
               )}
            </div>
            <Link to="/dashboard/prestataire/bookings" className="mt-12">
               <Button className="w-full bg-[var(--color-foreground)] text-white rounded-none h-12 text-[10px] uppercase tracking-widest font-bold hover:bg-[var(--color-primary)] transition-all">Gérer l'agenda</Button>
            </Link>
         </Card>
      </div>
    </div>
  );
}

function Analytics() {
   const data = [
      { name: 'Jan', revenue: 200000 },
      { name: 'Fév', revenue: 150000 },
      { name: 'Mar', revenue: 300000 },
      { name: 'Avr', revenue: 450000 },
      { name: 'Mai', revenue: 400000 },
      { name: 'Juin', revenue: 600000 },
   ];

   return (
      <div className="space-y-10">
         <h1 className="text-3xl font-serif font-bold">Analyse de revenus</h1>
         <Card className="rounded-[var(--radius-xl)] border-none shadow-[var(--shadow-sm)] p-8 bg-white">
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted)' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted)' }} tickFormatter={(val) => `${val/1000}k`} />
                     <Tooltip cursor={{ fill: 'var(--color-background)' }} />
                     <Bar dataKey="revenue" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </Card>
      </div>
   );
}

function ProviderBookings({ bookings, onUpdateStatus }: { bookings: Record<string, any>[], onUpdateStatus: (id: string, status: string) => void }) {
  const [filter, setFilter] = useState("PENDING");
  const filtered = bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom duration-700">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--color-border)] pb-12">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)]">Agenda</span>
            <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-[var(--color-foreground)]">Réservations</h1>
            <p className="text-[var(--color-muted)] font-light">Gérez vos engagements et vos demandes entrantes.</p>
          </div>
          <div className="flex bg-[var(--color-background-alt)] p-1 border border-[var(--color-border)]">
             {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f)}
                 className={cn(
                   "px-6 py-2.5 text-[10px] uppercase font-bold tracking-widest transition-all",
                   filter === f ? "bg-[var(--color-foreground)] text-white" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                 )}
               >
                 {f === 'PENDING' ? `En attente (${bookings.filter(b=>b.status==='PENDING').length})` : f}
               </button>
             ))}
          </div>
       </div>

       <div className="space-y-12">
          {filtered.length === 0 ? (
            <p className="py-20 text-center italic text-[var(--color-muted)] border border-dashed border-[var(--color-border)]">Aucune réservation dans cette catégorie.</p>
          ) : (
            filtered.map(booking => (
              <Card key={booking.id} className="rounded-none border-[var(--color-border)] p-12 shadow-none bg-white relative group">
                <div className="absolute top-0 right-12 w-24 h-px bg-[var(--color-primary)]" />
                <div className="flex flex-col lg:flex-row gap-12">
                   <div className="flex-1 space-y-10">
                      <div className="flex items-center gap-6">
                         <div className="w-20 h-20 rounded-none bg-[var(--color-background-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] uppercase font-bold">
                            {booking.clientName?.substring(0, 2) || <UserCircle className="w-10 h-10" />}
                         </div>
                         <div className="space-y-1">
                            <h4 className="text-2xl font-light tracking-tight text-[var(--color-foreground)]">{booking.clientName || "Client Confidentiel"}</h4>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-bold">Client particulier · {booking.clientEmail}</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-12 py-10 border-y border-[var(--color-border)]">
                          <DetailItem icon={<Calendar className="w-3.5 h-3.5" />} label="Événement" value={new Date(booking.eventDate?.toDate?.() || booking.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                          <DetailItem icon={<MapPin className="w-3.5 h-3.5" />} label="Lieu" value={booking.location || "Non spécifié"} />
                          <DetailItem icon={<TrendingUp className="w-3.5 h-3.5" />} label="Package" value={booking.packageName} />
                      </div>
                      <div className="flex flex-wrap items-center gap-10">
                         <a href={`tel:${booking.clientPhone}`} className="flex items-center gap-3 text-[11px] uppercase tracking-widest font-bold text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors">
                          <Phone className="w-3.5 h-3.5 text-[var(--color-accent)]" /> {booking.clientPhone || "Non fourni"}
                         </a>
                         <a href={`mailto:${booking.clientEmail}`} className="flex items-center gap-3 text-[11px] uppercase tracking-widest font-bold text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors">
                          <Mail className="w-3.5 h-3.5 text-[var(--color-accent)]" /> {booking.clientEmail}
                         </a>
                      </div>
                   </div>
                   <div className="lg:w-80 space-y-8 flex flex-col justify-center lg:border-l lg:pl-12 border-[var(--color-border)]">
                      <div className="space-y-2">
                         <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--color-muted)] font-bold">Total Prestation</p>
                         <p className="text-4xl font-extralight tracking-tighter text-[var(--color-foreground)]">{booking.totalAmount?.toLocaleString()} DA</p>
                      </div>
                      <div className="space-y-4">
                         {booking.status === 'PENDING' && (
                           <>
                             <Button 
                               onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')}
                               className="w-full bg-[var(--color-foreground)] text-white rounded-none h-14 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[var(--color-primary)] transition-all flex items-center justify-center gap-2"
                             >
                                <Check className="w-4 h-4" /> Accepter l'offre
                             </Button>
                             <Button 
                               onClick={() => onUpdateStatus(booking.id, 'CANCELLED')}
                               variant="outline" 
                               className="w-full border-[var(--color-foreground)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)] hover:text-white hover:border-[var(--color-accent)] rounded-none h-14 text-[10px] uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2"
                             >
                                <X className="w-4 h-4" /> Décliner
                             </Button>
                           </>
                         )}
                         {booking.status === 'CONFIRMED' && (
                            <Button 
                              onClick={() => onUpdateStatus(booking.id, 'COMPLETED')}
                              className="w-full bg-[var(--color-success)] text-white rounded-none h-14 text-[10px] uppercase tracking-[0.2em] font-bold transition-all flex items-center justify-center gap-2"
                            >
                               <CheckCircle2 className="w-4 h-4" /> Marquer comme Terminé
                            </Button>
                         )}
                         {booking.status === 'COMPLETED' && (
                            <div className="bg-[var(--color-success)]/10 text-[var(--color-success)] p-4 text-center text-[10px] font-bold uppercase tracking-widest">
                               Prestation terminée
                            </div>
                         )}
                      </div>
                   </div>
                </div>
              </Card>
            ))
          )}
       </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendType }: { title: string, value: string, trend: string, trendType: 'up' | 'down' }) {
    return (
       <div className="bg-white p-10 space-y-4">
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[var(--color-muted)]">{title}</span>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extralight tracking-tighter text-[var(--color-foreground)]">{value}</span>
            <div className={cn(
                "flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 border",
                trendType === 'up' ? "text-[var(--color-primary)] border-[var(--color-primary)]/10 bg-[var(--color-primary)]/5" : "text-[var(--color-accent)] border-[var(--color-accent)]/10 bg-[var(--color-accent)]/5"
            )}>
                {trendType === 'up' ? <TrendingUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-180" />}
                {trend}
            </div>
          </div>
       </div>
    );
 }

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
   return (
      <div className="space-y-1">
         <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted)] flex items-center gap-2">
            <span className="text-[var(--color-primary)]">{icon}</span> {label}
         </p>
         <p className="text-sm font-bold">{value}</p>
      </div>
   );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
