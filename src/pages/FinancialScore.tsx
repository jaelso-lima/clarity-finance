import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function getScoreColor(s: number) {
  if (s >= 80) return "text-success";
  if (s >= 60) return "text-primary";
  if (s >= 40) return "text-warning";
  return "text-destructive";
}

function getScoreLabel(s: number) {
  if (s >= 80) return "Excelente";
  if (s >= 60) return "Bom";
  if (s >= 40) return "Regular";
  return "Crítico";
}

function getBarColor(s: number) {
  if (s >= 80) return "bg-success";
  if (s >= 60) return "bg-primary";
  if (s >= 40) return "bg-warning";
  return "bg-destructive";
}

export default function FinancialScore() {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [score, setScore] = useState(0);
  const [breakdown, setBreakdown] = useState<{ label: string; value: number }[]>([]);

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
        setHasData(false); setLoading(false); return;
      }
      setHasData(true);

      const totalIncome = incomes.reduce((s, i) => s + Number(i.valor), 0);
      const totalExpenses = expenses.reduce((s, e) => s + Number(e.valor), 0);
      const totalPending = bills.filter(b => b.status === "pendente").reduce((s, b) => s + Number(b.valor), 0);
      const totalInvested = investments.reduce((s, i) => s + Number(i.valor_investido), 0);
      const saldo = totalIncome - totalExpenses;

      const incVsExp = totalIncome > 0 ? Math.min(100, Math.round((saldo / totalIncome) * 100 + 50)) : 0;
      const debtCtrl = totalIncome > 0 ? Math.max(0, Math.min(100, 100 - Math.round((totalPending / totalIncome) * 100))) : (totalPending === 0 ? 100 : 0);
      const investScore = totalIncome > 0 ? Math.min(100, Math.round((totalInvested / totalIncome) * 100)) : 0;
      const savingsRate = totalIncome > 0 ? Math.max(0, Math.min(100, Math.round((saldo / totalIncome) * 100))) : 0;

      const b = [
        { label: "Receitas vs Despesas", value: Math.max(0, incVsExp) },
        { label: "Controle de Dívidas", value: debtCtrl },
        { label: "Investimentos", value: Math.min(100, investScore) },
        { label: "Taxa de Economia", value: Math.max(0, savingsRate) },
      ];

      const s = Math.round(b.reduce((sum, item) => sum + item.value, 0) / b.length);
      setScore(Math.max(0, Math.min(100, s)));
      setBreakdown(b);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!hasData) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="font-display text-2xl font-bold">Score Financeiro</h1>
          <p className="text-muted-foreground text-sm">Sua pontuação de saúde financeira</p>
        </div>
        <Card>
          <CardContent className="p-8 md:p-12 flex flex-col items-center text-center gap-4">
            <div className="h-20 w-20 rounded-3xl gradient-primary flex items-center justify-center">
              <Heart className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold">Seu score será calculado automaticamente</h2>
            <p className="text-muted-foreground max-w-sm text-sm">Adicione suas receitas e despesas para gerar seu score financeiro personalizado.</p>
            <Button asChild className="gradient-primary border-0 h-11 mt-2">
              <Link to="/movimentacoes"><Plus className="h-4 w-4 mr-2" /> Adicionar movimentação</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 58;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold">Score Financeiro</h1>
        <p className="text-muted-foreground text-sm">Sua pontuação de saúde financeira</p>
      </div>

      {/* Score Ring */}
      <Card className="animate-scale-in">
        <CardContent className="p-6 flex flex-col items-center">
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="58" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
              <circle cx="64" cy="64" r="58"
                stroke="hsl(var(--primary))" strokeWidth="8" fill="none" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-display text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
              <span className="text-xs text-muted-foreground">de 100</span>
            </div>
          </div>
          <p className={`font-display text-lg font-semibold ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
          <p className="text-xs text-muted-foreground mt-1">Baseado nos seus dados reais</p>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <Card className="animate-slide-up">
        <CardContent className="p-5 space-y-4">
          <p className="font-display font-semibold text-sm">Detalhamento</p>
          {breakdown.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={`font-semibold ${getScoreColor(item.value)}`}>{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(item.value)}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
