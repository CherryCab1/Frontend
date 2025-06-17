import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { MobileNavigation, DesktopSidebar, FloatingOrbs } from "@/components/Navigation";
import Dashboard from "@/pages/Dashboard";
import Messages from "@/pages/Messages";
import Xendit from "@/pages/Xendit";
import System from "@/pages/System";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen relative">
      <FloatingOrbs />
      <DesktopSidebar />
      <main className="md:ml-72 min-h-screen pb-24 md:pb-8 relative z-10">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/messages" component={Messages} />
          <Route path="/xendit" component={Xendit} />
          <Route path="/system" component={System} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <MobileNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="telebot-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
