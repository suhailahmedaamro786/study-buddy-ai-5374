import { Link } from "@tanstack/react-router";
import { Home, Library } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur">
      <div className="grid grid-cols-2">
        <Item to="/app" icon={<Home className="w-5 h-5" />} label="Study" />
        <Item to="/library" icon={<Library className="w-5 h-5" />} label="Library" />
      </div>
    </nav>
  );
}

function Item({ to, icon, label }: { to: "/app" | "/library"; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-1 py-2.5 min-h-14 text-xs text-muted-foreground"
      activeProps={{ className: "text-primary" }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
