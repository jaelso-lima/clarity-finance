import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, CheckCircle2, AlertTriangle, TrendingUp, FileText } from "lucide-react";

interface DiagnosisResult {
  score: number;
  situation: string;
  recommendations: string[];
  positives: string[];
}

function calculateDiagnosis(income: number, expenses: number, debts: number, investments: number): DiagnosisResult {
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const debtRatio = income > 0 ? (debts / income) * 100 : 100;
  const investRate = income > 0 ? (investments / income) * 100 : 0;

  let score = 50;
  score += savingsRate > 20 ? 20 : savingsRate > 10 ? 10 : savingsRate > 0 ? 5 : -10;
  score += debtRatio < 10 ? 15 : debtRatio < 30 ? 5 : -10;
  score += investRate > 15 ? 15 : investRate > 5 ? 10 : 0;
  score = Math.max(0, Math.min(100, score));

  const situation = score >= 75 ? "Saudável" : score >= 50 ? "Atenção" : "Crítica";

  const positives: string[] = [];
  const recommendations: string[] = [];

  if (savingsRate > 10) positives.push(`Você economiza ${savingsRate.toFixed(0)}% da renda`);
  if (investRate > 5) positives.push(`Você investe ${investRate.toFixed(0)}% da renda`);
  if (debtRatio < 30) positives.push("Seu nível de endividamento é controlado");
  if (expenses < income) positives.push("Suas receitas superam suas despesas");

  if (savingsRate < 10) recommendations.push("Tente economizar pelo menos 10-20% da sua renda");
  if (investRate < 10) recommendations.push("Considere aumentar seus investimentos para pelo menos 10% da renda");
  if (debtRatio > 30) recommendations.push("Priorize a quitação de dívidas — elas consomem sua renda");
  if (expenses > income * 0.8) recommendations.push("Revise seus gastos fixos para reduzir despesas");
  recommendations.push("Crie um fundo de emergência equivalente a 6 meses de despesas");

  return { score, situation, recommendations, positives };
}

export default function Diagnosis() {
  const [step, setStep] = useState<"form" | "result">("form");
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [debts, setDebts] = useState("");
  const [investments, setInvestments] = useState("");
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  function handleSubmit() {
    const res = calculateDiagnosis(Number(income), Number(expenses), Number(debts), Number(investments));
    setResult(res);
    setStep("result");
  }

  if (step === "result" && result) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Diagnóstico Financeiro</h1>
          <p className="text-muted-foreground">Seu relatório financeiro personalizado</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="65" stroke="hsl(var(--muted))" strokeWidth="10" fill="none" />
                  <circle cx="80" cy="80" r="65" stroke="hsl(var(--primary))" strokeWidth="10" fill="none" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 65} strokeDashoffset={2 * Math.PI * 65 * (1 - result.score / 100)} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-3xl font-bold">{result.score}</span>
                  <span className="text-xs text-muted-foreground">de 100</span>
                </div>
              </div>
              <p className={`mt-3 font-display font-semibold ${result.score >= 75 ? "text-success" : result.score >= 50 ? "text-warning" : "text-destructive"}`}>
                Situação: {result.situation}
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Relatório Personalizado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.positives.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Pontos Positivos</p>
                  {result.positives.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-success/5 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Recomendações</p>
                {result.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-warning/5 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setStep("form")} variant="outline">Refazer Diagnóstico</Button>
          <Button>Criar Conta para Salvar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Diagnóstico Financeiro</h1>
        <p className="text-muted-foreground">Responda algumas perguntas e receba um relatório personalizado</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Questionário Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Qual sua renda mensal? (R$)</Label>
            <Input type="number" placeholder="5000" value={income} onChange={(e) => setIncome(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Quanto gasta por mês? (R$)</Label>
            <Input type="number" placeholder="3500" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Possui dívidas? Valor total (R$)</Label>
            <Input type="number" placeholder="0" value={debts} onChange={(e) => setDebts(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Quanto investe por mês? (R$)</Label>
            <Input type="number" placeholder="500" value={investments} onChange={(e) => setInvestments(e.target.value)} />
          </div>
          <Button className="w-full mt-2" onClick={handleSubmit} disabled={!income || !expenses}>
            Gerar Diagnóstico
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
