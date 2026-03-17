import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Heart, ArrowRight, Plus, ArrowLeftRight,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [totals, setTotals] = useState({ receitas: 0, despesas: 0, investimentos: 0, pendente: 0 });
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [expRes, incRes, billRes, invRes] = await Promise.all([
        supabase.from("expenses").select("valor, categoria"),
        supabase.from("incomes").select("valor"),
        supabase.from("bills").select("valor, status"),
        supabase.from("investments").select("valor_investido, lucro_prejuizo"),
      ]);

      const expenses = expRes.data || [];
      const incomes = incRes.data || [];
      const bills = billRes.data || [];
      const investments = invRes.data || [];

      const despesas = expenses.reduce((s, e) => s + Number(e.valor), 0);
      const receitas = incomes.reduce((s, i) => s + Number(i.valor), 0);
      const pendente = bills.filter((b) => b.status === "pendente").reduce((s, b) => s + Number(b.valor), 0);
      const investimentos = investments.reduce((s, i) => s + Number(i.valor_investido) + Number(i.lucro_prejuizo), 0);

      setTotals({ receitas, despesas, investimentos, pendente });
      setHasData(expenses.length > 0 || incomes.length > 0 || bills.length > 0 || investments.length > 0);

      const catMap: Record<string, number> = {};
      expenses.forEach((e) => {
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
  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da sua vida financeira</p>
        </div>
        <Card>
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ArrowLeftRight className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">Você ainda não adicionou informações financeiras.</h2>
            <p className="text-muted-foreground max-w-md">
              Comece adicionando suas receitas e despesas para visualizar seu painel financeiro completo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button asChild className="gradient-primary border-0">
                <Link to="/movimentacoes"><Plus className="h-4 w-4 mr-2" /> Adicionar receita</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/movimentacoes"><Plus className="h-4 w-4 mr-2" /> Adicionar despesa</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summaryCards = [
    { title: "Saldo Atual", value: saldo, icon: Wallet, positive: saldo >= 0 },
    { title: "Receitas do Mês", value: totals.receitas, icon: TrendingUp, positive: true },
    { title: "Despesas do Mês", value: totals.despesas, icon: TrendingDown, positive: false },
    { title: "Investimentos", value: totals.investimentos, icon: DollarSign, positive: true },
  ];

  const circumference = 2 * Math.PI * 36;
  const score = Math.min(100, Math.max(0, Math.round((saldo / (totals.receitas || 1)) * 100)));
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const hasScoreData = totals.receitas > 0 && totals.despesas > 0;

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
        {hasScoreData ? (
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
        ) : (
          <Card>
            <CardContent className="p-5 flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                <Heart className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-display font-semibold">Score Financeiro</p>
                <p className="text-sm text-muted-foreground mt-0.5">Adicione suas receitas e despesas para gerar seu score financeiro.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-5">
            <p className="font-display font-semibold mb-3">Resumo</p>
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

      {expensesByCategory.length > 0 ? (
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
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Seus gráficos aparecerão aqui conforme você adicionar informações.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
