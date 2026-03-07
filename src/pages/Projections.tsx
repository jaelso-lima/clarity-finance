import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, AlertTriangle, Sparkles } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";

function generateProjection(monthly: number, months: number, rate: number) {
  const data = [];
  let total = 0;
  for (let i = 0; i <= months; i++) {
    data.push({ month: `M${i}`, valor: Math.round(total) });
    total = (total + monthly) * (1 + rate / 100);
  }
  return data;
}

const scenarios = [
  {
    title: "Se continuar gastando assim...",
    description: "Em 6 meses você pode entrar em dívida de R$3.200",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/5 border-destructive/10",
  },
  {
    title: "Se economizar 15% da renda",
    description: "Em 2 anos pode acumular R$12.000 em poupança",
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/5 border-success/10",
  },
  {
    title: "Se investir R$300/mês",
    description: "Em 5 anos pode ter R$80.000 com rendimento médio de 12% a.a.",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/5 border-primary/10",
  },
];

const savingsData = generateProjection(1845, 24, 0.8);
const investmentData = generateProjection(300, 60, 1.0);

export default function Projections() {
  const [simMonthly, setSimMonthly] = useState(500);
  const [simRate, setSimRate] = useState(1.0);
  const [simMonths, setSimMonths] = useState(24);
  const simData = generateProjection(simMonthly, simMonths, simRate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Projeção Financeira</h1>
        <p className="text-muted-foreground">Veja seu futuro financeiro com base nos dados atuais</p>
      </div>

      {/* Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((s) => (
          <Card key={s.title} className={`border ${s.bg}`}>
            <CardContent className="p-5">
              <s.icon className={`h-8 w-8 ${s.color} mb-3`} />
              <p className={`font-display font-semibold ${s.color}`}>{s.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projection Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Projeção de Economia (24 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                <Area type="monotone" dataKey="valor" name="Economia Acumulada" stroke="hsl(160, 60%, 40%)" fill="hsl(160, 60%, 40%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Projeção de Investimentos (5 anos)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={investmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                <Line type="monotone" dataKey="valor" name="Investimento Acumulado" stroke="hsl(200, 70%, 50%)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Simulator */}
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
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 90%)" />
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
