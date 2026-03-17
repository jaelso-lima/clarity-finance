import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Shield, Target, PiggyBank, BarChart3, Heart, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function getScoreColor(s: number) {
  if (s >= 80) return "text-success";
  if (s >= 60) return "text-warning";
  return "text-destructive";
}

function getScoreLabel(s: number) {
  if (s >= 80) return "Excelente";
  if (s >= 60) return "Bom";
  if (s >= 40) return "Regular";
  return "Crítico";
}

export default function FinancialScore() {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [scoreData, setScoreData] = useState({ score: 0, breakdown: [] as { label: string; value: number; icon: any }[] });

  useEffect(() => {
    const fetch = async () => {
      const [expRes, incRes, billRes, invRes] = await Promise.all([
        supabase.from("expenses").select("valor"),
        supabase.from("incomes").select("valor"),
        supabase.from("bills").select("valor, status"),
        supabase.from("investments").select("valor_investido, lucro_prejuizo"),
      ]);

      const expenses = expRes.data || [];
      const incomes = incRes.data || [];
      const bills = billRes.data || [];
      const investments = invRes.data || [];

      if (incomes.length === 0 && expenses.length === 0) {
        setHasData(false);
        setLoading(false);
        return;
      }

      setHasData(true);

      const totalIncome = incomes.reduce((s, i) => s + Number(i.valor), 0);
      const totalExpenses = expenses.reduce((s, e) => s + Number(e.valor), 0);
      const totalPending = bills.filter(b => b.status === "pendente").reduce((s, b) => s + Number(b.valor), 0);
      const totalInvested = investments.reduce((s, i) => s + Number(i.valor_investido), 0);
      const saldo = totalIncome - totalExpenses;

      // Calculate sub-scores
      const incomeVsExpense = totalIncome > 0 ? Math.min(100, Math.round((saldo / totalIncome) * 100 + 50)) : 0;
      const debtControl = totalIncome > 0 ? Math.max(0, Math.min(100, 100 - Math.round((totalPending / totalIncome) * 100))) : (totalPending === 0 ? 100 : 0);
      const investmentScore = totalIncome > 0 ? Math.min(100, Math.round((totalInvested / totalIncome) * 100)) : 0;
      const savingsRate = totalIncome > 0 ? Math.max(0, Math.min(100, Math.round((saldo / totalIncome) * 100))) : 0;

      const breakdown = [
        { label: "Receitas vs Despesas", value: Math.max(0, incomeVsExpense), icon: BarChart3 },
        { label: "Controle de Dívidas", value: debtControl, icon: Shield },
        { label: "Investimentos", value: Math.min(100, investmentScore), icon: TrendingUp },
        { label: "Taxa de Economia", value: Math.max(0, savingsRate), icon: PiggyBank },
      ];

      const score = Math.round(breakdown.reduce((s, b) => s + b.value, 0) / breakdown.length);
      setScoreData({ score: Math.max(0, Math.min(100, score)), breakdown });
      setLoading(false);
    };
    fetch();
  }, []);

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
          <h1 className="font-display text-2xl md:text-3xl font-bold">Score Financeiro</h1>
          <p className="text-muted-foreground">Sua pontuação de saúde financeira</p>
        </div>
        <Card>
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">Adicione suas receitas e despesas para gerar seu score financeiro.</h2>
            <p className="text-muted-foreground max-w-md">
              O score é calculado automaticamente com base nos seus dados reais.
            </p>
            <Button asChild className="gradient-primary border-0 mt-2">
              <Link to="/movimentacoes"><Plus className="h-4 w-4 mr-2" /> Adicionar movimentação</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { score, breakdown } = scoreData;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Score Financeiro</h1>
        <p className="text-muted-foreground">Sua pontuação de saúde financeira</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
                <circle cx="80" cy="80" r="70" stroke="hsl(var(--primary))" strokeWidth="10" fill="none" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-display text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
                <span className="text-sm text-muted-foreground">de 100</span>
              </div>
            </div>
            <p className={`mt-4 font-display text-lg font-semibold ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Atualizado automaticamente com base nos seus dados
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Detalhamento do Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {breakdown.map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-primary" />
                    <span>{item.label}</span>
                  </div>
                  <span className={`font-semibold ${getScoreColor(item.value)}`}>{item.value}/100</span>
                </div>
                <Progress value={item.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
