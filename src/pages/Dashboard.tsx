import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Heart,
  Trophy,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from "recharts";

const summaryCards = [
  { title: "Saldo Atual", value: "R$ 8.450,00", icon: Wallet, trend: "+12%", positive: true },
  { title: "Receitas do Mês", value: "R$ 12.300,00", icon: TrendingUp, trend: "+8%", positive: true },
  { title: "Despesas do Mês", value: "R$ 3.850,00", icon: TrendingDown, trend: "-5%", positive: false },
  { title: "Lucro do Mês", value: "R$ 8.450,00", icon: DollarSign, trend: "+15%", positive: true },
];

const expensesByCategory = [
  { name: "Alimentação", value: 1200, color: "hsl(160, 60%, 40%)" },
  { name: "Transporte", value: 600, color: "hsl(200, 70%, 50%)" },
  { name: "Moradia", value: 900, color: "hsl(38, 92%, 50%)" },
  { name: "Lazer", value: 450, color: "hsl(280, 60%, 55%)" },
  { name: "Educação", value: 350, color: "hsl(340, 65%, 50%)" },
  { name: "Saúde", value: 350, color: "hsl(10, 70%, 55%)" },
];

const revenueVsExpenses = [
  { month: "Jan", receitas: 10500, despesas: 4200 },
  { month: "Fev", receitas: 11000, despesas: 3800 },
  { month: "Mar", receitas: 10800, despesas: 4500 },
  { month: "Abr", receitas: 12300, despesas: 3900 },
  { month: "Mai", receitas: 11500, despesas: 4100 },
  { month: "Jun", receitas: 12300, despesas: 3850 },
];

const balanceEvolution = [
  { month: "Jan", saldo: 5200 },
  { month: "Fev", saldo: 6100 },
  { month: "Mar", saldo: 5900 },
  { month: "Abr", saldo: 7200 },
  { month: "Mai", saldo: 7800 },
  { month: "Jun", saldo: 8450 },
];

const investmentGrowth = [
  { month: "Jan", valor: 15000 },
  { month: "Fev", valor: 15800 },
  { month: "Mar", valor: 16200 },
  { month: "Abr", valor: 17500 },
  { month: "Mai", valor: 18200 },
  { month: "Jun", valor: 19800 },
];

const score = 72;
const activeChallenges = [
  { name: "Economizar R$300", progress: 40 },
  { name: "7 dias sem gastos", progress: 57 },
];

export default function Dashboard() {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua vida financeira</p>
      </div>

      {/* Summary Cards */}
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
              <p className="font-display text-2xl font-bold">{card.value}</p>
              <span className={`text-xs font-medium ${card.positive ? "text-success" : "text-destructive"}`}>
                {card.trend} vs mês anterior
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score + Challenges Quick View */}
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
                <p className="text-sm text-muted-foreground mt-0.5">Sua saúde financeira está boa. Veja como melhorar.</p>
                <span className="text-xs text-primary flex items-center gap-1 mt-1"><ArrowRight className="h-3 w-3" /> Ver detalhes</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/desafios">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-warning" />
                <p className="font-display font-semibold">Desafios Ativos</p>
                <span className="text-xs text-primary ml-auto flex items-center gap-1"><ArrowRight className="h-3 w-3" /> Ver todos</span>
              </div>
              <div className="space-y-3">
                {activeChallenges.map((c) => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{c.name}</span>
                      <span className="text-muted-foreground">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Despesas por Categoria</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {expensesByCategory.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Receitas vs Despesas</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueVsExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="hsl(160, 60%, 40%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Evolução do Saldo</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={balanceEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                <Area type="monotone" dataKey="saldo" name="Saldo" stroke="hsl(200, 70%, 50%)" fill="hsl(200, 70%, 50%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Crescimento dos Investimentos</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={investmentGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                <Line type="monotone" dataKey="valor" name="Investimentos" stroke="hsl(160, 60%, 40%)" strokeWidth={2.5} dot={{ fill: "hsl(160, 60%, 40%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
