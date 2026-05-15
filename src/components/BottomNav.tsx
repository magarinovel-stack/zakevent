import { Link, useLocation } from "react-router-dom";
import { 
  Home, Search, Calendar, 
  MessageSquare, User, LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

export function BottomNav() {
  const location = useLocation();
  const { user, profile } = useAuth();
  const isProvider = profile?.type === 'provider';
  const basePath = isProvider ? "/dashboard/prestataire" : "/dashboard/client";

  const guestNav = [
    { icon: <Home className="w-5 h-5" />, label: "Accueil", path: "/" },
    { icon: <Search className="w-5 h-5" />, label: "Explorer", path: "/search" },
    { icon: <User className="w-5 h-5" />, label: "Connexion", path: "/login" },
  ];

  const authNav = [
    { icon: <Home className="w-5 h-5" />, label: "ZAKEVENTS", path: "/" },
    { icon: <Search className="w-5 h-5" />, label: "Explorer", path: "/search" },
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Stats", path: basePath },
    { icon: <Calendar className="w-5 h-5" />, label: "Planning", path: `${basePath}/bookings` },
    { icon: <User className="w-5 h-5" />, label: "Profil", path: `${basePath}/settings` },
  ];

  const navItems = user ? authNav : guestNav;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] px-6 h-20 flex items-center justify-between z-50 pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-[var(--color-primary)]" : "text-[var(--color-muted)]"
            )}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
