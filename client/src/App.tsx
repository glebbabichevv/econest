import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";

import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import About from "@/pages/About";
import Footprint from "@/pages/FootprintNew";
import HowItWorks from "@/pages/HowItWorks";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import Leaderboard from "@/pages/Leaderboard";
import AIAssistant from "@/pages/AIAssistant";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-bg dark:bg-gray-900">
      <Switch>
        {isLoading || !isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/auth" component={Auth} />
            <Route path="/how-it-works" component={HowItWorks} />
            <Route path="/faq" component={FAQ} />
            <Route path="/contact" component={Contact} />
            <Route path="/about" component={About} />
          </>
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/ai-assistant" component={AIAssistant} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/footprint" component={Footprint} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/history" component={History} />
            <Route path="/profile" component={Profile} />

            <Route path="/how-it-works" component={HowItWorks} />
            <Route path="/faq" component={FAQ} />
            <Route path="/contact" component={Contact} />
            <Route path="/about" component={About} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
