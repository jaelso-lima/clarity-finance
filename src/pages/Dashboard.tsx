import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Heart, Trophy, ArrowRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [totals, setTotals] = useState({ receitas: 0, despesas: 0, investimentos: 0, pendente: 0 });
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [expRes, incRes, billRes, invRes] = await Promise.all([
        supabase.from("expenses").select("valor, categoria"),
        supabase.from("incomes").select("valor"),
        supabase.from("bills").select("valor, status"),
        supabase.from("investments").select("valor_investido, lucro_prejuizo"),
      ]);

      const despesas = (expRes.data || []).reduce((s, e) => s + Number(e.valor), 0);
      const receitas = (incRes.data || []).reduce((s, i) => s + Number(i.valor), 0);
      const pendente = (billRes.data || []).filter((b) => b.status === "pendente").reduce((s, b) => s + Number(b.valor), 0);
      const investimentos = (invRes.data || []).reduce((s, i) => s + Number(i.valor_investido) + Number(i.lucro_prejuizo), 0);

      setTotals({ receitas, despesas, investimentos, pendente });

      // Group expenses by category
      const catMap: Record<string, number> = {};
      (expRes.data || []).forEach((e) => {
        catMap[e.categoria] = (catMap[e.categoria] || 0) + Number(e.valor);
      });
      const colors = ["hsl(160, 60%, 40%)", "hsl(200, 70%, 50%)", "hsl(38, 92%, 50%)", "hsl(280, 60%, 55%)", "hsl(340, 65%, 50%)", "hsl(10, 70%, 55%)", "hsl(120, 50%, 45%)"];
      setExpensesByCategory(
        Object.entries(catMap).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))
      );

      setLoading(false);
    };
    fetchData();
  }, []);

  const saldo = totals.receitas - totals.despesas;
  const circumference = 2 * Math.PI * 36;
  const score = Math.min(100, Math.max(0, Math.round((saldo / (totals.receitas || 1)) * 100)));
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const summaryCards = [
    { title: "Saldo Atual", value: saldo, icon: Wallet, positive: saldo >= 0 },
    { title: "Receitas do Mês", value: totals.receitas, icon: TrendingUp, positive: true },
    { title: "Despesas do Mês", value: totals.despesas, icon: TrendingDown, positive: false },
    { title: "Investimentos", value: totals.investimentos, icon: DollarSign, positive: true },
  ];

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua vida financeira</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.title}</span>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <card.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold">{fmt(card.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/score">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5 flex items-center gap-5">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
                  <circle cx="40" cy="40" r="36" stroke="hsl(var(--primary))" strokeWidth="6" fill="none" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-lg font-bold">{score}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <p className="font-display font-semibold">Score Financeiro</p>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">Baseado nos seus dados reais.</p>
                <span className="text-xs text-primary flex items-center gap-1 mt-1"><ArrowRight className="h-3 w-3" /> Ver detalhes</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-warning" />
              <p className="font-display font-semibold">Resumo</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contas Pendentes</span>
                <span className="font-semibold text-warning">{fmt(totals.pendente)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Economia do Mês</span>
                <span className={`font-semibold ${saldo >= 0 ? "text-success" : "text-destructive"}`}>{fmt(saldo)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {expensesByCategory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-display text-lg">Despesas por Categoria</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {expensesByCategory.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                  </Pie>
                  <Tooltip formatter={(value: number) => fmt(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
