import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart as LineChartIcon, Plus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

function generateProjection(monthly: number, months: number, rate: number) {
  const data = [];
  let total = 0;
  for (let i = 0; i <= months; i++) {
    data.push({ month: `M${i}`, valor: Math.round(total) });
    total = (total + monthly) * (1 + rate / 100);
  }
  return data;
}

export default function Projections() {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [simMonthly, setSimMonthly] = useState(500);
  const [simRate, setSimRate] = useState(1.0);
  const [simMonths, setSimMonths] = useState(24);

  useEffect(() => {
    const check = async () => {
      const [expRes, incRes] = await Promise.all([
        supabase.from("expenses").select("id", { count: "exact", head: true }),
        supabase.from("incomes").select("id", { count: "exact", head: true }),
      ]);
      setHasData((expRes.count || 0) > 0 && (incRes.count || 0) > 0);
      setLoading(false);
    };
    check();
  }, []);

  const simData = generateProjection(simMonthly, simMonths, simRate);

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
          <h1 className="font-display text-2xl md:text-3xl font-bold">Projeção Financeira</h1>
          <p className="text-muted-foreground">Veja seu futuro financeiro com base nos dados atuais</p>
        </div>
        <Card>
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <LineChartIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">Adicione seus dados para ver projeções financeiras inteligentes.</h2>
            <p className="text-muted-foreground max-w-md">
              Registre suas receitas e despesas para que possamos calcular projeções personalizadas.
            </p>
            <Button asChild className="gradient-primary border-0 mt-2">
              <Link to="/movimentacoes"><Plus className="h-4 w-4 mr-2" /> Adicionar movimentação</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Projeção Financeira</h1>
        <p className="text-muted-foreground">Veja seu futuro financeiro com base nos dados atuais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Simulador Interativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Aporte Mensal (R$)</Label>
              <Input type="number" value={simMonthly} onChange={(e) => setSimMonthly(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Rendimento Mensal (%)</Label>
              <Input type="number" step="0.1" value={simRate} onChange={(e) => setSimRate(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Período (meses)</Label>
              <Input type="number" value={simMonths} onChange={(e) => setSimMonths(Number(e.target.value))} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Resultado estimado: <span className="font-display font-bold text-foreground text-lg">R$ {simData[simData.length - 1]?.valor.toLocaleString("pt-BR")}</span>
            </p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={simData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Area type="monotone" dataKey="valor" name="Projeção" stroke="hsl(160, 60%, 40%)" fill="hsl(160, 60%, 40%)" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
