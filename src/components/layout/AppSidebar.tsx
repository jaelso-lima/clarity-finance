import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ArrowLeftRight, FileText, TrendingUp, CreditCard, ChevronLeft, LogOut,
  Heart, LineChart, Gift, Shield, User, Trophy, Calculator, Gamepad2, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: ArrowLeftRight, label: "Extrato", path: "/movimentacoes" },
  { icon: Heart, label: "Score", path: "/score" },
  { icon: FileText, label: "Contas", path: "/contas" },
  { icon: TrendingUp, label: "Investimentos", path: "/investimentos" },
  { icon: Calculator, label: "Simulador", path: "/simulador" },
  
  { icon: Trophy, label: "Conquistas", path: "/desafios" },
  { icon: Gamepad2, label: "Arena", path: "/arena" },
  { icon: Wallet, label: "Carteira", path: "/carteira" },
  { icon: Gift, label: "Indicações", path: "/indicacoes" },
  { icon: CreditCard, label: "Planos", path: "/planos" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

interface AppSidebarProps { open: boolean; onToggle: () => void; }

export function AppSidebar({ open, onToggle }: AppSidebarProps) {
  const location = useLocation();
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden" onClick={onToggle} />}
      <aside className={cn(
        "fixed left-0 top-0 z-50 flex h-full flex-col border-r bg-card transition-all duration-300 max-md:hidden",
        open ? "w-64" : "w-20"
      )}>
        <div className="flex h-16 items-center justify-between border-b px-4">
          {open && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-gradient">Nexo</span>
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <ChevronLeft className={cn("h-4 w-4 transition-transform", !open && "rotate-180")} />
          </Button>
        </div>
        <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <item.icon className="h-5 w-5 shrink-0" />
                {open && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3 space-y-0.5">
          <Link to="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Shield className="h-5 w-5 shrink-0" />{open && <span>Admin</span>}
          </Link>
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <LogOut className="h-5 w-5 shrink-0" />{open && <span>Sair</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
