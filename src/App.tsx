import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { registerNavigate } from "@/services/nativeDeepLinkRouter";
import { isNative } from "@/lib/platform";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Goals from "./pages/Goals";
import GoalDetail from "./pages/GoalDetail";
import NewGoal from "./pages/NewGoal";
import Habits from "./pages/Habits";
import MicroMoves from "./pages/MicroMoves";
import NewHabit from "./pages/NewHabit";
import Mentor from "./pages/Mentor";
import Journal from "./pages/Journal";
import JournalPlayback from "./pages/JournalPlayback";
import Library from "./pages/Library";
import Calendar from "./pages/Calendar";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import LifeEvents from "./pages/LifeEvents";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Admin from "./pages/Admin";
import IPDocumentation from "./pages/IPDocumentation";
import LaunchVideo from "./pages/LaunchVideo";
import AppStoreSubmission from "./pages/AppStoreSubmission";
import PlayStoreSubmission from "./pages/PlayStoreSubmission";
import Mirror from "./pages/Mirror";
import Cinematics from "./pages/Cinematics";
import Vault from "./pages/Vault";
import ShareStudio from "./pages/ShareStudio";
import InsightLibrary from "./pages/InsightLibrary";
import SharedContent from "./pages/SharedContent";
import PlaybookDetail from "./pages/PlaybookDetail";
import CuratedPlacements from "./pages/CuratedPlacements";
import AdminIntelligenceWalkthrough from "./pages/AdminIntelligenceWalkthrough";
import PublicProfile from "./pages/PublicProfile";
import PitchDiscovery from "./pages/PitchDiscovery";

const queryClient = new QueryClient();

/** Registers React Router navigate for native deep-link routing */
function DeepLinkBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    if (isNative()) {
      registerNavigate((path) => navigate(path));
    }
  }, [navigate]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <DeepLinkBridge />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/ip-docs" element={<IPDocumentation />} />
                <Route path="/launch-video" element={<LaunchVideo />} />
                <Route path="/app-store-submission" element={<AppStoreSubmission />} />
                <Route path="/play-store-submission" element={<PlayStoreSubmission />} />
                <Route path="/s/:slug" element={<SharedContent />} />
                <Route path="/curated-placements" element={<CuratedPlacements />} />
                <Route path="/admin-intelligence" element={<AdminIntelligenceWalkthrough />} />
                <Route path="/pitch/discovery" element={<PitchDiscovery />} />
                
                {/* Protected routes */}
                <Route element={<AppLayout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/goals/:id" element={<GoalDetail />} />
                  <Route path="/goals/new" element={<NewGoal />} />
                  <Route path="/habits" element={<Habits />} />
                  <Route path="/micro-moves" element={<MicroMoves />} />
                 <Route path="/habits/new" element={<NewHabit />} />
                 <Route path="/habits/:id/edit" element={<NewHabit />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/journal/playback/:entryId" element={<JournalPlayback />} />
                  <Route path="/mentor" element={<Mentor />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/life-events" element={<LifeEvents />} />
                  <Route path="/mirror" element={<Mirror />} />
                  <Route path="/cinematics" element={<Cinematics />} />
                  <Route path="/vault" element={<Vault />} />
                  <Route path="/share-studio" element={<ShareStudio />} />
                  <Route path="/insights" element={<InsightLibrary />} />
                  <Route path="/playbook/:id" element={<PlaybookDetail />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/u/:userId" element={<PublicProfile />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SubscriptionProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
