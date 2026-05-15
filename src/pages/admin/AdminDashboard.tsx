import { useState, useEffect, ReactNode } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Users, UserCheck, ShieldAlert, 
  CreditCard, Settings, LayoutDashboard,
  Check, X, Search, Filter, Eye
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";
import { monitoringService } from "@/services/monitoringService";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      <aside className="w-64 bg-[var(--color-secondary)] text-white/70 flex flex-col h-screen fixed pt-32 px-4 space-y-2">
        <NavItem to="/admin" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
        <NavItem to="/admin/providers" icon={<UserCheck className="w-5 h-5" />} label="Prestataires" />
        <NavItem to="/admin/bookings" icon={<CreditCard className="w-5 h-5" />} label="Réservations" />
        <NavItem to="/admin/users" icon={<Users className="w-5 h-5" />} label="Utilisateurs" />
        <NavItem to="/admin/disputes" icon={<ShieldAlert className="w-5 h-5" />} label="Litiges" />
        <NavItem to="/admin/settings" icon={<Settings className="w-5 h-5" />} label="Paramètres" />
      </aside>

      <main className="flex-1 ml-64 pt-32 pb-24 px-12">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/providers" element={<ProvidersList />} />
          <Route path="/bookings" element={<div>Bookings admin...</div>} />
          <Route path="/users" element={<div>Users admin...</div>} />
        </Routes>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-white/10 hover:text-white transition-all">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

interface DashboardStats {
  totalUsers: number;
  activeProviders: number;
  totalRevenue: number;
  totalCommissions: number;
}

function Overview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true });
        const { count: activeProviders } = await supabase.from("providers").select("*", { count: "exact", head: true }).eq("status", "APPROVED");
        const { data: bookingsData } = await supabase.from("bookings").select("total_amount").in("payment_status", ["HELD", "RELEASED"]);
        let totalRevenue = 0;
        let totalCommissions = 0;
        (bookingsData || []).forEach((b) => {
          totalRevenue += b.total_amount || 0;
          totalCommissions += (b.total_amount || 0) * 0.1;
        });

        setStats({
          totalUsers: totalUsers ?? 0,
          activeProviders: activeProviders ?? 0,
          totalRevenue,
          totalCommissions,
        });
      } catch (err) {
        monitoringService.captureError(err, { context: "admin_stats_fetch" });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return n.toLocaleString();
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <AdminStatCard title="Total Utilisateurs" value={formatNumber(stats?.totalUsers ?? 0)} />
            <AdminStatCard title="Prestataires Actifs" value={formatNumber(stats?.activeProviders ?? 0)} />
            <AdminStatCard title="CA Total (DA)" value={formatNumber(stats?.totalRevenue ?? 0)} />
            <AdminStatCard title="Commissions (DA)" value={formatNumber(stats?.totalCommissions ?? 0)} />
          </>
        )}
      </div>

      <Card className="rounded-[var(--radius-xl)] border-none shadow-[var(--shadow-sm)]">
        <CardHeader>
          <CardTitle>Candidatures en attente</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
              <TableHeader>
                 <TableRow>
                    <TableHead>Prestataire</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {[1, 2, 3].map(i => (
                    <TableRow key={i}>
                       <TableCell className="font-bold">Studio Algiers {i}</TableCell>
                       <TableCell>Photographe</TableCell>
                       <TableCell>Alger</TableCell>
                       <TableCell>12/05/2024</TableCell>
                       <TableCell className="text-right flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20"><Check className="w-4 h-4 mr-1" /> Approuver</Button>
                          <Button size="sm" variant="outline" className="bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20"><X className="w-4 h-4 mr-1" /> Rejeter</Button>
                       </TableCell>
                    </TableRow>
                 ))}
              </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatSkeleton() {
  return (
    <Card className="p-6 rounded-[var(--radius-lg)] border-none shadow-[var(--shadow-sm)] bg-white">
      <div className="w-24 h-3 bg-[var(--color-border)] rounded animate-pulse" />
      <div className="w-16 h-6 bg-[var(--color-border)] rounded animate-pulse mt-2" />
    </Card>
  );
}

function ProvidersList() {
   const { t } = useTranslation();
   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t("nav.providers")}</h2>
            <div className="flex gap-4">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <Input placeholder={t("search.placeholder")} className="pl-10 h-10 w-64 bg-white" />
               </div>
               <Button variant="outline" className="bg-white"><Filter className="w-4 h-4 mr-2" /> {t("search.filterBtn")}</Button>
            </div>
         </div>

         <Card className="rounded-[var(--radius-xl)] border-none shadow-[var(--shadow-sm)]">
            <CardContent className="p-0">
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead className="text-right">Détails</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {[1, 2, 3, 4, 5].map(i => (
                        <TableRow key={i}>
                           <TableCell>
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-[var(--color-background-alt)]" />
                                 <span className="font-bold">Elite Events {i}</span>
                              </div>
                           </TableCell>
                           <TableCell><Badge className="bg-[var(--color-success)]/10 text-[var(--color-success)]">Approuvé</Badge></TableCell>
                           <TableCell>Traiteur</TableCell>
                           <TableCell>4.8 (24)</TableCell>
                           <TableCell className="text-right">
                              <Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>
      </div>
   );
}

function AdminStatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="p-6 rounded-[var(--radius-lg)] border-none shadow-[var(--shadow-sm)] bg-white">
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)]">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </Card>
  );
}
