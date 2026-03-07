import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface ComparisonItem {
  category: string;
  userValue: number;
  avgValue: number;
}

const comparisons: ComparisonItem[] = [
  { category: "Alimentação", userValue: 520, avgValue: 700 },
  { category: "Transporte", userValue: 410, avgValue: 300 },
  { category: "Moradia", userValue: 900, avgValue: 950 },
  { category: "Lazer", userValue: 450, avgValue: 380 },
  { category: "Educação", userValue: 200, avgValue: 350 },
  { category: "Saúde", userValue: 180, avgValue: 250 },
  { category: "Delivery", userValue: 320, avgValue: 280 },
  { category: "Assinaturas", userValue: 90, avgValue: 120 },
];

function getStatus(user: number, avg: number) {
  const ratio = user / avg;
  if (ratio <= 0.85) return { label: "Abaixo da média", color: "text-success", bg: "bg-success", icon: TrendingDown };
  if (ratio >= 1.15) return { label: "Acima da média", color: "text-warning", bg: "bg-warning", icon: TrendingUp };
  return { label: "Na média", color: "text-muted-foreground", bg: "bg-muted-foreground", icon: Minus };
}

export default function Comparison() {
  const totalUser = comparisons.reduce((a, c) => a + c.userValue, 0);
  const totalAvg = comparisons.reduce((a, c) => a + c.avgValue, 0);
  const betterCount = comparisons.filter(c => c.userValue < c.avgValue).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Comparação Financeira</h1>
        <p className="text-muted-foreground">Compare seus gastos com a média dos usuários (100% anônimo)</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-display text-2xl font-bold">1.247</p>
            <p className="text-sm text-muted-foreground">Usuários comparados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <TrendingDown className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="font-display text-2xl font-bold">{betterCount}/{comparisons.length}</p>
            <p className="text-sm text-muted-foreground">Categorias abaixo da média</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className={`font-display text-2xl font-bold ${totalUser < totalAvg ? "text-success" : "text-warning"}`}>
              {totalUser < totalAvg ? "-" : "+"}R$ {Math.abs(totalUser - totalAvg).toLocaleString("pt-BR")}
            </p>
            <p className="text-sm text-muted-foreground">vs gasto médio total</p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {comparisons.map((item) => {
          const status = getStatus(item.userValue, item.avgValue);
          const maxVal = Math.max(item.userValue, item.avgValue);
          return (
            <Card key={item.category}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">{item.category}</p>
                  <div className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                    <status.icon className="h-3 w-3" />
                    {status.label}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Você</span>
                    <span className="font-semibold">R$ {item.userValue.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${status.bg}`} style={{ width: `${(item.userValue / maxVal) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Média da plataforma</span>
                    <span className="font-semibold">R$ {item.avgValue.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/40" style={{ width: `${(item.avgValue / maxVal) * 100}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
