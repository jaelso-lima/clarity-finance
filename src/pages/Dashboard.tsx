import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Eye, EyeOff, ArrowRight, Plus,
  ShoppingBag, Car, Home, Gamepad2, GraduationCap, HeartPulse, MoreHorizontal,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const categoryIcons: Record<string, any> = {
  "Alimentação": ShoppingBag, "Transporte": Car, "Moradia": Home,
  "Lazer": Gamepad2, "Educação": GraduationCap, "Saúde": HeartPulse,
};

export default function Dashboard() {
  const { profile } = useAuth();
  const [totals, setTotals] = useState({ receitas: 0, despesas: 0, investimentos: 0, pendente: 0 });
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [monthlyEvolution, setMonthlyEvolution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [expRes, incRes, billRes, invRes] = await Promise.all([
        supabase.from("expenses").select("valor, categoria, data, descricao").order("data", { ascending: false }),
        supabase.from("incomes").select("valor, categoria, data, descricao").order("data", { ascending: false }),
        supabase.from("bills").select("valor, status"),
        supabase.from("investments").select("valor_investido, lucro_prejuizo"),
      ]);

      const expenses = expRes.data || [];
      const incomes = incRes.data || [];
      const bills = billRes.data || [];
      const investments = invRes.data || [];

      const despesas = expenses.reduce((s, e) => s + Number(e.valor), 0);
      const receitas = incomes.reduce((s, i) => s + Number(i.valor), 0);
      const pendente = bills.filter(b => b.status === "pendente").reduce((s, b) => s + Number(b.valor), 0);
      const investimentos = investments.reduce((s, i) => s + Number(i.valor_investido) + Number(i.lucro_prejuizo), 0);

      setTotals({ receitas, despesas, investimentos, pendente });
      setHasData(expenses.length > 0 || incomes.length > 0);

      // Recent transactions (mixed)
      const mixed = [
        ...incomes.slice(0, 5).map(i => ({ ...i, type: "income" as const })),
        ...expenses.slice(0, 5).map(e => ({ ...e, type: "expense" as const })),
      ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 6);
      setRecentTransactions(mixed);

      // Category breakdown
      const catMap: Record<string, number> = {};
      expenses.forEach(e => { catMap[e.categoria] = (catMap[e.categoria] || 0) + Number(e.valor); });
      const colors = ["hsl(252, 56%, 57%)", "hsl(280, 60%, 55%)", "hsl(200, 70%, 50%)", "hsl(38, 92%, 50%)", "hsl(340, 65%, 50%)", "hsl(152, 60%, 42%)", "hsl(10, 70%, 55%)"];
      setExpensesByCategory(Object.entries(catMap).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] })));

      // Monthly evolution
      const monthMap: Record<string, { receitas: number; despesas: number }> = {};
      incomes.forEach(i => {
        const m = new Date(i.data).toLocaleDateString("pt-BR", { month: "short" });
        if (!monthMap[m]) monthMap[m] = { receitas: 0, despesas: 0 };
        monthMap[m].receitas += Number(i.valor);
      });
      expenses.forEach(e => {
        const m = new Date(e.data).toLocaleDateString("pt-BR", { month: "short" });
        if (!monthMap[m]) monthMap[m] = { receitas: 0, despesas: 0 };
        monthMap[m].despesas += Number(e.valor);
      });
      setMonthlyEvolution(Object.entries(monthMap).map(([month, data]) => ({ month, ...data })).reverse().slice(-6));

      setLoading(false);
    };
    fetchData();
  }, []);

  const saldo = totals.receitas - totals.despesas;
  const fmt = (v: number) => showBalance ? `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ ••••";

  const firstName = profile?.full_name?.split(" ")[0] || "Usuário";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div className="flex items-center gap-3">
          <Link to="/perfil">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                {firstName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">{greeting},</p>
            <h1 className="font-display text-xl font-bold">{firstName} 👋</h1>
          </div>
        </div>
      </div>

      {!hasData ? (
        /* Empty state */
        <Card className="animate-scale-in">
          <CardContent className="p-8 md:p-12 flex flex-col items-center text-center gap-4">
            <div className="h-20 w-20 rounded-3xl gradient-primary flex items-center justify-center">
              <Wallet className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold">Comece sua jornada financeira</h2>
            <p className="text-muted-foreground max-w-sm">
              Adicione suas receitas e despesas para ver seu dashboard completo com gráficos e insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button asChild className="gradient-primary border-0 h-12 px-6">
                <Link to="/movimentacoes"><Plus className="h-4 w-4 mr-2" /> Adicionar receita</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-6">
                <Link to="/movimentacoes"><Plus className="h-4 w-4 mr-2" /> Adicionar despesa</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Balance Card */}
          <Card className="gradient-primary text-primary-foreground overflow-hidden animate-scale-in">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 -ml-6 -mb-6" />
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-primary-foreground/70">Saldo total</p>
                  <button onClick={() => setShowBalance(!showBalance)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
                <p className="font-display text-3xl md:text-4xl font-bold mb-4">
                  {showBalance ? `R$ ${saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ ••••••"}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/10 rounded-xl p-3">
                    <TrendingUp className="h-4 w-4 mb-1 text-primary-foreground/70" />
                    <p className="text-xs text-primary-foreground/70">Receitas</p>
                    <p className="font-semibold text-sm">{fmt(totals.receitas)}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <TrendingDown className="h-4 w-4 mb-1 text-primary-foreground/70" />
                    <p className="text-xs text-primary-foreground/70">Despesas</p>
                    <p className="font-semibold text-sm">{fmt(totals.despesas)}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <DollarSign className="h-4 w-4 mb-1 text-primary-foreground/70" />
                    <p className="text-xs text-primary-foreground/70">Investido</p>
                    <p className="font-semibold text-sm">{fmt(totals.investimentos)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {[
              { icon: Plus, label: "Adicionar", to: "/movimentacoes" },
              { icon: TrendingUp, label: "Investir", to: "/investimentos" },
              { icon: Wallet, label: "Contas", to: "/contas" },
              { icon: DollarSign, label: "Score", to: "/score" },
            ].map((action) => (
              <Link key={action.label} to={action.to} className="flex flex-col items-center gap-1.5 group">
                <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <action.icon className="h-5 w-5 text-accent-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{action.label}</span>
              </Link>
            ))}
          </div>

          {/* Evolution Chart */}
          {monthlyEvolution.length > 1 && (
            <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-4 pt-5">
                <p className="font-display font-semibold text-sm mb-3">Evolução mensal</p>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={monthlyEvolution}>
                    <defs>
                      <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Area type="monotone" dataKey="receitas" stroke="hsl(152, 60%, 42%)" strokeWidth={2} fill="url(#colorReceitas)" />
                    <Area type="monotone" dataKey="despesas" stroke="hsl(0, 72%, 55%)" strokeWidth={2} fill="url(#colorDespesas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent Transactions */}
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-semibold">Últimas movimentações</p>
              <Link to="/movimentacoes" className="text-xs text-primary font-medium flex items-center gap-1">
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {recentTransactions.map((t, i) => {
                  const Icon = categoryIcons[t.categoria] || MoreHorizontal;
                  const isIncome = t.type === "income";
                  return (
                    <div key={i} className="flex items-center gap-3 p-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? "bg-success/10" : "bg-destructive/10"}`}>
                        <Icon className={`h-5 w-5 ${isIncome ? "text-success" : "text-destructive"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{t.descricao || t.categoria}</p>
                        <p className="text-xs text-muted-foreground">{new Date(t.data).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <p className={`font-semibold text-sm ${isIncome ? "text-success" : "text-destructive"}`}>
                        {isIncome ? "+" : "-"}R$ {Number(t.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  );
                })}
                {recentTransactions.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma movimentação ainda.</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          {expensesByCategory.length > 0 && (
            <Card className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <CardContent className="p-4 pt-5">
                <p className="font-display font-semibold text-sm mb-3">Despesas por categoria</p>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {expensesByCategory.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {expensesByCategory.slice(0, 4).map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-muted-foreground">{cat.name}</span>
                        </div>
                        <span className="font-medium">R$ {cat.value.toLocaleString("pt-BR")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
