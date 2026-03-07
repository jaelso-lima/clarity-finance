import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Shield, Target, PiggyBank, BarChart3, CheckCircle2, AlertTriangle } from "lucide-react";

const score = 72;

const scoreBreakdown = [
  { label: "Receitas vs Despesas", value: 82, icon: BarChart3 },
  { label: "Controle de Dívidas", value: 65, icon: Shield },
  { label: "Investimentos", value: 58, icon: TrendingUp },
  { label: "Saldo Mensal", value: 78, icon: PiggyBank },
  { label: "Regularidade", value: 85, icon: Target },
  { label: "Taxa de Economia", value: 64, icon: TrendingDown },
];

const positivePoints = [
  "Você está investindo 12% da sua renda — acima da média!",
  "Suas despesas estão controladas nos últimos 3 meses",
  "Seu saldo mensal está positivo há 4 meses consecutivos",
  "Você registra suas finanças regularmente",
];

const improvementPoints = [
  "Você gastou 25% a mais com lazer este mês",
  "Seu fundo de emergência cobre apenas 2 meses de despesas",
  "Seu nível de investimento pode melhorar — tente chegar a 20%",
  "Considere reduzir gastos com delivery em 15%",
];

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
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Score Financeiro</h1>
        <p className="text-muted-foreground">Sua pontuação de saúde financeira</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Ring */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
                <circle
                  cx="80" cy="80" r="70"
                  stroke="hsl(var(--primary))"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
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

        {/* Score Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Detalhamento do Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scoreBreakdown.map((item) => (
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

      {/* Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Pontos Positivos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {positivePoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/10">
                <div className="h-2 w-2 rounded-full bg-success mt-1.5 shrink-0" />
                <p className="text-sm">{point}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Pontos a Melhorar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {improvementPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/10">
                <div className="h-2 w-2 rounded-full bg-warning mt-1.5 shrink-0" />
                <p className="text-sm">{point}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
