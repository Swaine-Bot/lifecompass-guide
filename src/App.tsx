import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Goals from "./pages/Goals";
import NewGoal from "./pages/NewGoal";
import Habits from "./pages/Habits";
import NewHabit from "./pages/NewHabit";
import Mentor from "./pages/Mentor";
import Library from "./pages/Library";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Protected routes */}
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/goals/new" element={<NewGoal />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/habits/new" element={<NewHabit />} />
              <Route path="/calendar" element={<Goals />} />
              <Route path="/journal" element={<Home />} />
              <Route path="/mentor" element={<Mentor />} />
              <Route path="/library" element={<Library />} />
              <Route path="/settings" element={<Home />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
