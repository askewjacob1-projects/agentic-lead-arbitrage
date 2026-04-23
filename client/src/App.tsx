import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Purchase from "./pages/Purchase";
import Dashboard from "./pages/Dashboard";
import Success from "./pages/Success";
import Delivery from "./pages/Delivery";
import Admin from "./pages/Admin";
import OrderTracking from "./pages/OrderTracking";
import LeadListManagement from "./pages/LeadListManagement";
import Analytics from "./pages/Analytics";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/purchase"} component={Purchase} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/orders"} component={OrderTracking} />
      <Route path={"/manage-leads"} component={LeadListManagement} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/success"} component={Success} />
      <Route path={"/delivery"} component={Delivery} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
