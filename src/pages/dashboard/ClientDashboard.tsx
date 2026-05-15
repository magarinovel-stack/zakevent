import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth, UserProfile } from "@/lib/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, Calendar, MessageSquare, 
  Heart, Settings, LogOut, Bell,
  ChevronRight, Clock, CheckCircle2, XCircle,
  Plus, ExternalLink, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

import ProfileSettings from "@/components/dashboard/ProfileSettings";

interface Booking {
  id: string;
  status: string;
  eventDate: string;
  providerName?: string;
  totalAmount?: number;
  category?: string;
  city?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export default function ClientDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from("bookings")
          .select("*")
          .eq("client_id", user.id)
          .order("event_date", { ascending: false })
          .limit(10);
        setBookings((data || []) as unknown as Booking[]);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navItems = [
    { name: "Accueil", path: "/dashboard/client", icon: LayoutDashboard },
    { name: "Mes réservations", path: "/dashboard/client/bookings", icon: Calendar },
    { name: "Messages", path: "/dashboard/client/messages", icon: MessageSquare },
    { name: "Favoris", path: "/dashboard/client/favorites", icon: Heart },
    { name: "Paramètres", path: "/dashboard/client/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-[var(--color-border)] fixed h-screen top-0 left-0 pt-32 pb-8 px-6 space-y-8 z-20">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 rounded-full border border-[var(--color-border)] bg-[var(--color-background-alt)] flex items-center justify-center text-[var(--color-foreground)] font-bold text-xl overflow-hidden">
             {profile?.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full object-cover" /> : profile?.firstName?.charAt(0) || "U"}
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-[var(--color-foreground)] text-sm tracking-tight">{profile?.firstName} {profile?.lastName}</p>
            <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest text-[var(--color-muted)] border-[var(--color-border)]">Client</Badge>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-none transition-all font-medium text-xs uppercase tracking-widest",
                  isActive ? "bg-[var(--color-foreground)] text-white" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-[var(--color-muted)]")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="flex items-center justify-start gap-3 px-4 py-3 text-[var(--color-muted)] hover:bg-[var(--color-background-alt)] hover:text-[var(--color-foreground)] rounded-none transition-all text-xs uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-40 pb-24 px-6 lg:px-12 max-w-6xl">
        <Helmet>
           <title>{profile?.firstName} | Dashboard Client | ZAKEVENTS</title>
        </Helmet>
        <Routes>
          <Route path="/" element={<Overview profile={profile} bookings={bookings} loading={loading} />} />
          <Route path="/bookings" element={<Bookings bookings={bookings} />} />
          <Route path="/messages" element={<div>Messages coming soon...</div>} />
          <Route path="/favorites" element={<div>Favoris coming soon...</div>} />
          <Route path="/settings" element={<ProfileSettings type="client" />} />
        </Routes>
      </main>
    </div>
  );
}

function Overview({ profile, bookings, loading }: { profile: UserProfile | null, bookings: Booking[], loading: boolean }) {
  const { t } = useTranslation();
  const confirmed = bookings.filter(b => b.status === "CONFIRMED").length;
  const pending = bookings.filter(b => b.status === "PENDING").length;

  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--color-border)] pb-12">
        <div className="space-y-4">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-muted)]">Espace Client</span>
          <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-[var(--color-foreground)]">Bonjour, {profile?.firstName}</h1>
          <p className="text-[var(--color-muted)] font-light max-w-sm">Suivez l'avancement de vos événements mémorables.</p>
        </div>
        <Link to="/search">
          <Button className="bg-[var(--color-primary)] text-white h-14 px-8 rounded-none text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[var(--color-accent)] transition-all flex items-center gap-3">
            <Plus className="w-4 h-4" />
            Planifier un événement
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--color-border)] border border-[var(--color-border)]">
        <StatCard title="Réservations" value={bookings.length.toString().padStart(2, '0')} subtitle={`${confirmed} Confirmées, ${pending} En attente`} />
        <StatCard title="Messages" value="00" subtitle="Service bientôt disponible" />
        <StatCard title="Favoris" value="00" subtitle="Service bientôt disponible" />
      </div>

      <div className="space-y-10">
        <div className="flex items-end justify-between border-b border-[var(--color-border)] pb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-foreground)]">Activités Récentes</h2>
            <Link to="/dashboard/client/bookings" className="text-[10px] uppercase tracking-widest text-[var(--color-primary)] font-bold hover:text-[var(--color-accent)] transition-colors">Tout voir →</Link>
        </div>
        <div className="space-y-4">
           {loading ? (
             <p className="italic text-[var(--color-muted)]">{t("common.loadingMemories")}</p>
           ) : bookings.length === 0 ? (
             <div className="py-20 text-center border-2 border-dashed border-[var(--color-border)] space-y-6">
                <p className="text-[var(--color-muted)]">Aucune réservation pour le moment.</p>
                <Link to="/search">
                   <Button variant="outline" className="rounded-none border-[var(--color-foreground)] text-[var(--color-foreground)]">Explorer le catalogue</Button>
                </Link>
             </div>
           ) : (
             bookings.slice(0, 3).map(booking => (
               <BookingSummaryCard key={booking.id} booking={booking} />
             ))
           )}
        </div>
      </div>
    </div>
  );
}

function Bookings({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState("all");
  const filtered = bookings.filter(b => filter === "all" || b.status === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-3xl font-serif font-bold">Mes Réservations</h1>
        <div className="flex bg-white rounded-none p-1 border border-[var(--color-border)]">
           {["all", "CONFIRMED", "PENDING", "COMPLETED"].map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={cn(
                 "px-4 py-2 text-[10px] uppercase font-bold tracking-widest transition-all",
                 filter === f ? "bg-[var(--color-foreground)] text-white" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
               )}
             >
               {f === 'all' ? 'Toutes' : f}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-[var(--color-muted)] border border-dashed border-[var(--color-border)]">Aucune réservation trouvée.</p>
        ) : (
          filtered.map(booking => (
            <BookingSummaryCard key={booking.id} booking={booking} />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string, value: string, subtitle: string }) {
  return (
    <div className="bg-white p-10 space-y-4">
      <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-[var(--color-muted)]">{title}</p>
      <div className="space-y-1">
        <p className="text-4xl font-extralight tracking-tight text-[var(--color-foreground)]">{value}</p>
        <p className="text-[10px] text-[var(--color-muted)] font-medium uppercase tracking-wider">{subtitle}</p>
      </div>
    </div>
  );
}

function BookingSummaryCard({ booking }: { booking: Booking }) {
  const date = new Date(booking.eventDate);
  const formattedDate = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white p-0 rounded-none border-l-2 border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all flex flex-col md:flex-row items-center gap-10 group overflow-hidden">
       <div className="w-24 h-24 rounded-none bg-[var(--color-background-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)]/5 transition-colors">
          <Calendar className="w-8 h-8" />
       </div>
       <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-4">
             <h4 className="text-2xl font-light tracking-tight text-[var(--color-foreground)] font-sans">{booking.providerName || "Prestataire"}</h4>
             <Badge className={cn(
               "border-none rounded-none text-[8px] uppercase tracking-widest font-bold px-3 py-1",
               booking.status === "CONFIRMED" ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" : "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
             )}>
               {booking.status}
             </Badge>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-8 text-[11px] uppercase tracking-widest text-[var(--color-muted)] font-bold">
             <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" /> {formattedDate}</span>
             <span className="flex items-center gap-2 italic font-serif text-[var(--color-foreground)]">{booking.packageName}</span>
          </div>
       </div>
       <div className="text-center md:text-right space-y-4 md:pr-10 pb-6 md:pb-0">
          <p className="text-2xl font-light tracking-tighter text-[var(--color-foreground)]">{booking.totalAmount?.toLocaleString()} DA</p>
          <Button variant="ghost" className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-foreground)] p-0 hover:bg-transparent hover:text-[var(--color-primary)] transition-colors">
             Détails de la prestation →
          </Button>
       </div>
    </div>
  );
}
