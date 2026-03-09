import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, DollarSign, UserPlus, Gift, Shield, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyGrowth = [
  { month: "Jan", usuarios: 120 }, { month: "Fev", usuarios: 185 },
  { month: "Mar", usuarios: 260 }, { month: "Abr", usuarios: 340 },
  { month: "Mai", usuarios: 420 }, { month: "Jun", usuarios: 530 },
];

const revenueData = [
  { month: "Jan", receita: 1200 }, { month: "Fev", receita: 1850 },
  { month: "Mar", receita: 2600 }, { month: "Abr", receita: 3400 },
  { month: "Mai", receita: 4200 }, { month: "Jun", receita: 5300 },
];

const planDistribution = [
  { name: "Free", value: 380, color: "hsl(210, 10%, 70%)" },
  { name: "PRO", value: 120, color: "hsl(160, 60%, 40%)" },
  { name: "PRO (Indicação)", value: 18, color: "hsl(200, 70%, 50%)" },
  { name: "PRO (Manual)", value: 12, color: "hsl(38, 92%, 50%)" },
];

const metrics = [
  { label: "Total de Usuários", value: "530", icon: Users, change: "+12%" },
  { label: "Usuários Ativos", value: "412", icon: Activity, change: "+8%" },
  { label: "Usuários PRO", value: "150", icon: CreditCard, change: "+15%" },
  { label: "Receita Mensal", value: "R$ 5.300", icon: DollarSign, change: "+26%" },
  { label: "Receita Total", value: "R$ 18.750", icon: TrendingUp, change: "" },
  { label: "Novos Hoje", value: "8", icon: UserPlus, change: "+3" },
  { label: "PRO por Indicação", value: "18", icon: Gift, change: "+5" },
  { label: "PRO Manual", value: "12", icon: Shield, change: "+2" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Dashboard da Plataforma</h2>
        <p className="text-muted-foreground">Visão geral do sistema FinanceFlow</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <m.icon className="h-5 w-5 text-muted-foreground" />
                {m.change && <span className="text-xs font-medium text-primary">{m.change}</span>}
              </div>
              <p className="text-2xl font-bold mt-2">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Crescimento de Usuários</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="usuarios" fill="hsl(160, 60%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Receita Mensal (R$)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="receita" stroke="hsl(200, 70%, 50%)" strokeWidth={2} dot={{ fill: "hsl(200, 70%, 50%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Distribuição de Planos</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center gap-8">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={planDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {planDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {planDistribution.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}: <strong>{p.value}</strong></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
