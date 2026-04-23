import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Buy Leads", href: "/purchase" },
    ...(isAuthenticated ? [
      { label: "My Orders", href: "/orders" },
      { label: "Dashboard", href: "/dashboard" },
    ] : []),
    ...(user?.role === "admin" ? [
      { label: "Admin", href: "/admin" },
      { label: "Analytics", href: "/analytics" },
      { label: "Manage Leads", href: "/manage-leads" },
    ] : []),
  ];

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div
            className="text-xl font-bold cursor-pointer"
            onClick={() => navigate("/")}
          >
            Agentic Lead Arbitrage
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="text-sm hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            {navItems.map(item => (
              <button
                key={item.href}
                onClick={() => {
                  navigate(item.href);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-accent rounded-md"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    {user?.email}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
