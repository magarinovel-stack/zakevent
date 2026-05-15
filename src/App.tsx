import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { BottomNav } from '@/components/BottomNav';
import { TooltipProvider } from '@/components/ui/tooltip';
import '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '@/components/common/ProtectedRoute';

function LoadingSkeleton() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
      <div className="w-32 h-4 bg-gray-100 rounded animate-pulse" />
    </div>
  );
}

// Existing pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const ProviderProfile = lazy(() => import('@/pages/ProviderProfile'));
const SmartPlanner = lazy(() => import('@/pages/SmartPlanner'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const ClientDashboard = lazy(() => import('@/pages/dashboard/ClientDashboard'));
const ProviderDashboard = lazy(() => import('@/pages/dashboard/ProviderDashboard'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterClient = lazy(() => import('@/pages/auth/RegisterClient'));
const RegisterProvider = lazy(() => import('@/pages/auth/RegisterProvider'));
const HowItWorks = lazy(() => import('@/pages/HowItWorks'));
const SeedData = lazy(() => import('@/pages/admin/SeedData'));

// New pages (Directive 3A)
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const TimelinePage = lazy(() => import('@/pages/TimelinePage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const DisputesPage = lazy(() => import('@/pages/DisputesPage'));
const GalleryPage = lazy(() => import('@/pages/GalleryPage'));
const CalculatorPage = lazy(() => import('@/pages/CalculatorPage'));
const RankingsPage = lazy(() => import('@/pages/RankingsPage'));
const CampaignsPage = lazy(() => import('@/pages/CampaignsPage'));

export default function App() {
  const { i18n } = useTranslation();
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} className="min-h-screen bg-[#FAF8F4] text-[#1C1C1E] font-sans selection:bg-[#C49A3C]/30">
      <BrowserRouter>
        <TooltipProvider>
          <Navbar />
          <main className="pb-16 lg:pb-0">
            <Suspense fallback={<LoadingSkeleton />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/prestataires/:id" element={<ProviderProfile />} />
                <Route path="/organiser-mon-evenement" element={<SmartPlanner />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register/client" element={<RegisterClient />} />
                <Route path="/register/prestataire" element={<RegisterProvider />} />
                <Route path="/comment-ca-marche" element={<HowItWorks />} />

                {/* New public pages */}
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/inspiration" element={<GalleryPage />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                <Route path="/classements" element={<RankingsPage />} />
                <Route path="/promos/:slug" element={<CampaignsPage />} />

                {/* New authenticated pages */}
                <Route path="/prestataire/onboarding" element={<ProtectedRoute allowedRoles={["PRESTATAIRE"]}><OnboardingPage /></ProtectedRoute>} />
                <Route path="/disputes" element={<ProtectedRoute allowedRoles={["CLIENT", "PRESTATAIRE"]}><DisputesPage /></ProtectedRoute>} />
                <Route path="/dashboard/client/event/:id/timeline" element={<ProtectedRoute allowedRoles={["CLIENT"]}><TimelinePage /></ProtectedRoute>} />

                {/* Protected: Admin */}
                <Route path="/admin/seed" element={<ProtectedRoute allowedRoles={["ADMIN"]}><SeedData /></ProtectedRoute>} />
                <Route path="/admin/*" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />

                {/* Protected: Client */}
                <Route path="/dashboard/client/*" element={<ProtectedRoute allowedRoles={["CLIENT"]}><ClientDashboard /></ProtectedRoute>} />

                {/* Protected: Provider */}
                <Route path="/dashboard/prestataire/*" element={<ProtectedRoute allowedRoles={["PRESTATAIRE"]}><ProviderDashboard /></ProtectedRoute>} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <BottomNav />
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </BrowserRouter>
    </div>
  );
}
