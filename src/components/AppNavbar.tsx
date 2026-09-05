import { createFileRoute } from "@tanstack/react-router";
import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BookOpen, LogOut, Menu, X, Home, BarChart3, Search, Clock, Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppNavbar() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  const navLinks = [
    { label: "Home", href: "/app", icon: <Home className="w-4 h-4" /> },
    { label: "Stats", href: "/app/stats", icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Search", href: "/app/search", icon: <Search className="w-4 h-4" /> },
    { label: "World Clock", href: "/app/clock", icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/app" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="hidden sm:inline">StudyBuddy</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent"
                }`
              }
            >
              {link.icon}
              <span className="hidden lg:inline">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right Side - User & Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-accent rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <button className="p-2 hover:bg-accent rounded-lg transition-colors hidden sm:flex">
            <Settings className="w-5 h-5" />
          </button>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user.email?.split("@")[0]}</p>
                <p className="text-xs text-muted-foreground">Studying...</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-bold text-sm">
                {user.email?.[0].toUpperCase()}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            size="sm"
            variant="ghost"
            className="gap-2 hidden sm:flex"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-border bg-background/50 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  }`
                }
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}