import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, TrendingUp, Calendar, DollarSign, BarChart3, Shield, Flame, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const scenarios = {
  conservador: { label: "Conservador", rate: 0.007, icon: Shield, color: "text-primary", description: "Renda fixa, CDBs, Tesouro Direto" },
  moderado: { label: "Moderado", rate: 0.012, icon: Target, color: "text-warning", description: "Fundos multimercado, ações blue chip" },
  agressivo: { label: "Agressivo", rate: 0.02, icon: Flame, color: "text-destructive", description: "Ações growth, criptos, day trade" },
};

type ScenarioKey = keyof typeof scenarios;

export default function Simulator() {
  const [initialValue, setInitialValue] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [months, setMonths] = useState(12);
  const [scenario, setScenario] = useState<ScenarioKey>("moderado");

  const { rate, label, icon: ScenarioIcon, color, description } = scenarios[scenario];

  const projectionData = useMemo(() => {
    const data = [];
    let balance = initialValue;
    for (let i = 0; i <= months; i++) {
      data.push({
        month: i === 0 ? "Início" : `Mês ${i}`,
        total: Math.round(balance * 100) / 100,
        invested: initialValue + monthlyContribution * i,
      });
      balance = (balance + monthlyContribution) * (1 + rate);
    }
    return data;
  }, [initialValue, monthlyContribution, months, rate]);

  const finalValue = projectionData[projectionData.length - 1]?.total || 0;
  const totalInvested = initialValue + monthlyContribution * months;
  const totalGain = finalValue - totalInvested;
  const gainPercent = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Simulador de Investimentos</h1>
        <p className="text-muted-foreground">Projete o crescimento do seu capital em diferentes cenários</p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Aviso importante</p>
          <p className="text-sm text-muted-foreground">
            Simulação baseada em cenários educacionais. Não representa garantia de lucro. Rentabilidade passada não garante rentabilidade futura.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-display">Configurar Simulação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Valor Inicial (R$)</Label>
              <Input
                type="number"
                value={initialValue}
                onChange={(e) => setInitialValue(Math.max(0, Number(e.target.value)))}
                min={0}
              />
              <Slider
                value={[initialValue]}
                onValueChange={([v]) => setInitialValue(v)}
                min={0}
                max={100000}
                step={100}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Aporte Mensal (R$)</Label>
              <Input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
                min={0}
              />
              <Slider
                value={[monthlyContribution]}
                onValueChange={([v]) => setMonthlyContribution(v)}
                min={0}
                max={10000}
                step={50}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label>Período (meses)</Label>
              <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">1 ano</SelectItem>
                  <SelectItem value="24">2 anos</SelectItem>
                  <SelectItem value="36">3 anos</SelectItem>
                  <SelectItem value="60">5 anos</SelectItem>
                  <SelectItem value="120">10 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Cenário de Rendimento</Label>
              {(Object.keys(scenarios) as ScenarioKey[]).map((key) => {
                const s = scenarios[key];
                const Icon = s.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setScenario(key)}
                    className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      scenario === key
                        ? "border-primary bg-accent"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${s.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{(s.rate * 100).toFixed(1)}%/mês</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Total Investido</p>
                <p className="text-lg font-bold font-display">
                  R$ {totalInvested.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" />
                <p className="text-xs text-muted-foreground">Valor Final</p>
                <p className="text-lg font-bold font-display text-success">
                  R$ {finalValue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-xs text-muted-foreground">Rendimento</p>
                <p className="text-lg font-bold font-display text-primary">
                  R$ {totalGain.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-5 w-5 mx-auto text-warning mb-1" />
                <p className="text-xs text-muted-foreground">Retorno</p>
                <p className="text-lg font-bold font-display text-warning">{gainPercent}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg">Projeção de Crescimento</CardTitle>
                <Badge variant="outline" className={color}>
                  <ScenarioIcon className="h-3 w-3 mr-1" /> {label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={projectionData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 90%)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    interval={Math.max(0, Math.floor(projectionData.length / 8))}
                  />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                      name === "total" ? "Valor Projetado" : "Total Investido",
                    ]}
                  />
                  <Area type="monotone" dataKey="invested" stroke="hsl(217, 91%, 50%)" fill="url(#colorInvested)" strokeWidth={1.5} name="invested" />
                  <Area type="monotone" dataKey="total" stroke="hsl(152, 60%, 42%)" fill="url(#colorTotal)" strokeWidth={2.5} name="total" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly projection table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">Projeção Mês a Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-muted-foreground">Período</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Investido</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Valor Total</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Ganho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectionData.filter((_, i) => i > 0).map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2">{row.month}</td>
                        <td className="text-right py-2">R$ {row.invested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="text-right py-2 font-medium">R$ {row.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="text-right py-2 text-success">
                          R$ {(row.total - row.invested).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
