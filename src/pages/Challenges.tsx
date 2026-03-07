import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Target, Star, Medal, Award, Zap, CheckCircle2 } from "lucide-react";

interface Challenge {
  id: string;
  name: string;
  description: string;
  goal: number;
  progress: number;
  unit: string;
  status: "active" | "completed" | "locked";
  reward: string;
  icon: typeof Trophy;
  daysLeft?: number;
}

const challenges: Challenge[] = [
  { id: "1", name: "Economizar R$300 em 30 dias", description: "Guarde R$300 nos próximos 30 dias", goal: 300, progress: 120, unit: "R$", status: "active", reward: "Medalha Economizador", icon: Target, daysLeft: 18 },
  { id: "2", name: "7 dias sem gastos desnecessários", description: "Fique 7 dias sem compras por impulso", goal: 7, progress: 4, unit: "dias", status: "active", reward: "+5 pontos no Score", icon: Flame, daysLeft: 3 },
  { id: "3", name: "Guardar 10% da renda", description: "Economize pelo menos 10% da sua renda mensal", goal: 100, progress: 100, unit: "%", status: "completed", reward: "Medalha Poupador", icon: Star },
  { id: "4", name: "Reduzir gastos com delivery", description: "Reduza seus gastos com delivery em 50%", goal: 50, progress: 30, unit: "%", status: "active", reward: "Medalha Disciplinado", icon: Zap, daysLeft: 22 },
  { id: "5", name: "Investir por 3 meses seguidos", description: "Faça pelo menos um investimento por mês", goal: 3, progress: 0, unit: "meses", status: "locked", reward: "Medalha Investidor", icon: Trophy },
];

const badges = [
  { name: "Economizador Iniciante", icon: Medal, earned: true, description: "Completou seu primeiro desafio" },
  { name: "Controle Financeiro", icon: Target, earned: true, description: "Registrou finanças por 30 dias" },
  { name: "Investidor Consistente", icon: Trophy, earned: false, description: "Investiu por 3 meses seguidos" },
  { name: "Disciplina de Ferro", icon: Flame, earned: false, description: "Completou 5 desafios" },
  { name: "Mestre Financeiro", icon: Award, earned: false, description: "Score acima de 90 por 3 meses" },
  { name: "Super Poupador", icon: Star, earned: true, description: "Economizou 20% da renda em um mês" },
];

export default function Challenges() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const filtered = challenges.filter(c => filter === "all" || c.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Desafios Financeiros</h1>
        <p className="text-muted-foreground">Complete desafios e ganhe recompensas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Desafios Ativos", value: "3", icon: Flame, color: "text-warning" },
          { label: "Completados", value: "1", icon: CheckCircle2, color: "text-success" },
          { label: "Medalhas", value: "3/6", icon: Medal, color: "text-primary" },
          { label: "Pontos Bônus", value: "+15", icon: Star, color: "text-accent" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="font-display text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(["all", "active", "completed"] as const).map(f => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Completos"}
          </Button>
        ))}
      </div>

      {/* Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => {
          const pct = Math.min(100, (c.progress / c.goal) * 100);
          return (
            <Card key={c.id} className={c.status === "locked" ? "opacity-60" : ""}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c.status === "completed" ? "bg-success/10" : "bg-primary/10"}`}>
                      <c.icon className={`h-5 w-5 ${c.status === "completed" ? "text-success" : "text-primary"}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                    </div>
                  </div>
                  <Badge variant={c.status === "completed" ? "default" : c.status === "locked" ? "secondary" : "outline"}>
                    {c.status === "completed" ? "✓ Completo" : c.status === "locked" ? "Bloqueado" : `${c.daysLeft}d restantes`}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{c.progress} / {c.goal} {c.unit}</span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Award className="h-3 w-3" />
                  <span>Recompensa: {c.reward}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Suas Medalhas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {badges.map((b) => (
              <div key={b.name} className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-center ${b.earned ? "bg-primary/5 border-primary/20" : "opacity-40 bg-muted/50"}`}>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${b.earned ? "gradient-primary" : "bg-muted"}`}>
                  <b.icon className={`h-6 w-6 ${b.earned ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <p className="text-xs font-medium leading-tight">{b.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
