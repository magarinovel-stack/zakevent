import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "react-i18next";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, profile, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">{t("common.loading")}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    if (profile.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (profile.role === "PRESTATAIRE") return <Navigate to="/dashboard/prestataire" replace />;
    return <Navigate to="/dashboard/client" replace />;
  }

  return <>{children}</>;
}
