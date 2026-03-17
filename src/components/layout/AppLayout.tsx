import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import {
  Menu, LogOut, Sun, Moon, LayoutDashboard, ArrowLeftRight, TrendingUp, User, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const mobileNav = [
  { icon: LayoutDashboard, label: "Início", path: "/dashboard" },
  { icon: ArrowLeftRight, label: "Extrato", path: "/movimentacoes" },
  { icon: Plus, label: "", path: "/movimentacoes?add=true", isCenter: true },
  { icon: TrendingUp, label: "Investir", path: "/investimentos" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"} pb-20 md:pb-0`}>
        {/* Desktop header */}
        <header className="sticky top-0 z-30 hidden md:flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-xl px-6">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} className="h-9 w-9">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9">
              <LogOut className="h-4 w-4" />
            </Button>
            <Link to="/perfil">
              <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-border">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="gradient-primary text-primary-foreground text-sm font-semibold">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex md:hidden h-14 items-center justify-between bg-background/80 backdrop-blur-xl px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-gradient">Nexo</span>
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggle} className="h-9 w-9">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t bg-card/95 backdrop-blur-xl safe-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNav.map((item) => {
            const isActive = location.pathname === item.path;
            if (item.isCenter) {
              return (
                <Link key="add" to={item.path} className="-mt-6">
                  <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                    <Plus className="h-7 w-7 text-primary-foreground" />
                  </div>
                </Link>
              );
            }
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center gap-0.5 py-1">
                <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
