import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Gift,
  FileText,
  Handshake,
  Shield,
  Settings,
  ChevronLeft,
  LogOut,
  Menu,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Users, label: "Usuários", path: "/admin/usuarios" },
  { icon: CreditCard, label: "Planos", path: "/admin/planos" },
  { icon: Gift, label: "Indicações", path: "/admin/indicacoes" },
  { icon: FileText, label: "Relatórios", path: "/admin/relatorios" },
  { icon: Handshake, label: "Sócios", path: "/admin/socios" },
  { icon: Shield, label: "Segurança", path: "/admin/seguranca" },
  { icon: Settings, label: "Configurações", path: "/admin/configuracoes" },
];

export function AdminLayout() {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r bg-card transition-all duration-300",
          open ? "w-64" : "w-20",
          !open && "max-md:hidden"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {open && (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-destructive flex items-center justify-center">
                <Shield className="h-4 w-4 text-destructive-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Admin</span>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="hidden md:flex">
            <ChevronLeft className={cn("h-4 w-4 transition-transform", !open && "rotate-180")} />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {open && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <TrendingUp className="h-5 w-5 shrink-0" />
            {open && <span>App Principal</span>}
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {open && <span>Sair</span>}
          </Link>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${open ? "md:ml-64" : "md:ml-20"}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6">
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Painel Administrativo</h1>
          <div className="flex-1" />
          <div className="h-8 w-8 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground text-sm font-semibold">
            A
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
