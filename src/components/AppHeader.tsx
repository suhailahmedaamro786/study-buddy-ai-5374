import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, LogOut, Moon, Sun, Library, Home } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";

export function AppHeader() {
  const { user, profile } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const name = profile?.display_name ?? user?.email?.split("@")[0] ?? "You";
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/app" className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <h1 className="font-semibold leading-tight truncate">StudyBuddy</h1>
            <p className="text-xs text-muted-foreground">AI study assistant</p>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-6">
          <NavLink to="/app" icon={<Home className="w-4 h-4" />} label="Study" />
          <NavLink to="/library" icon={<Library className="w-4 h-4" />} label="Library" />
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode" className="h-10 w-10">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </motion.div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none focus-visible:ring-2 ring-primary min-h-11 min-w-11 grid place-items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt={name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-sm font-medium truncate">{name}</div>
                <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="gap-2">
                <LogOut className="w-4 h-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, icon, label }: { to: "/app" | "/library"; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      activeProps={{ className: "text-primary bg-primary/10" }}
    >
      {icon} {label}
    </Link>
  );
}
