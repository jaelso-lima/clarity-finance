import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Flame, Star, CheckCircle2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: any;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

export default function Challenges() {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [expRes, incRes, invRes] = await Promise.all([
        supabase.from("expenses").select("valor", { count: "exact" }),
        supabase.from("incomes").select("valor", { count: "exact" }),
        supabase.from("investments").select("valor_investido", { count: "exact" }),
      ]);
      const expCount = expRes.count || 0;
      const incCount = incRes.count || 0;
      const invCount = invRes.count || 0;
      const totalIncome = (incRes.data || []).reduce((s, i) => s + Number(i.valor), 0);
      const totalExpenses = (expRes.data || []).reduce((s, e) => s + Number(e.valor), 0);
      const savingsRate = totalIncome > 0 ? Math.round((totalIncome - totalExpenses) / totalIncome * 100) : 0;
      setHasData(expCount > 0 || incCount > 0);
      setChallenges([
        { id: "1", title: "Primeiro Registro", description: "Registre sua primeira movimentação", icon: Star, target: 1, current: Math.min(1, expCount + incCount), unit: "registro", completed: (expCount + incCount) >= 1 },
        { id: "2", title: "Registros Ativos", description: "Registre 10 movimentações", icon: Flame, target: 10, current: Math.min(10, expCount + incCount), unit: "registros", completed: (expCount + incCount) >= 10 },
        { id: "3", title: "Investidor Iniciante", description: "Faça seu primeiro investimento", icon: Target, target: 1, current: Math.min(1, invCount), unit: "investimento", completed: invCount >= 1 },
        { id: "4", title: "Economizador", description: "Taxa de economia acima de 20%", icon: Trophy, target: 20, current: Math.max(0, savingsRate), unit: "%", completed: savingsRate >= 20 },
      ]);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold">Conquistas</h1>
        <p className="text-muted-foreground text-sm">Complete desafios e ganhe medalhas</p>
      </div>
      <Card className="gradient-primary text-primary-foreground">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center"><Trophy className="h-7 w-7" /></div>
          <div className="flex-1">
            <p className="font-display font-bold text-lg">{completedCount}/{challenges.length} conquistas</p>
            <div className="h-2 bg-white/20 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${(completedCount / challenges.length) * 100}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {challenges.map((c) => (
          <Card key={c.id} className={c.completed ? "border-success/30 bg-success/5" : ""}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${c.completed ? "bg-success/10" : "bg-muted"}`}>
                {c.completed ? <CheckCircle2 className="h-6 w-6 text-success" /> : <c.icon className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.description}</p>
                {!c.completed && (
                  <div className="mt-1.5">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(c.current / c.target) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{c.current}/{c.target} {c.unit}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!hasData && (
        <Card><CardContent className="p-6 text-center">
          <p className="text-muted-foreground text-sm mb-3">Comece adicionando movimentações para desbloquear conquistas!</p>
          <Button asChild className="gradient-primary border-0"><Link to="/movimentacoes"><Plus className="h-4 w-4 mr-2" /> Adicionar</Link></Button>
        </CardContent></Card>
      )}
    </div>
  );
}
