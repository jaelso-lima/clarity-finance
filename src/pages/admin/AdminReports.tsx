import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Users, CreditCard, TrendingUp, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const growthData = [
  { month: "Jan", novos: 120, cancelados: 5 },
  { month: "Fev", novos: 65, cancelados: 8 },
  { month: "Mar", novos: 75, cancelados: 3 },
  { month: "Abr", novos: 80, cancelados: 6 },
  { month: "Mai", novos: 80, cancelados: 4 },
  { month: "Jun", novos: 110, cancelados: 7 },
];

const reports = [
  { title: "Crescimento de Usuários", description: "Novos cadastros, ativos e inativos por período", icon: Users },
  { title: "Usuários Pagantes", description: "Detalhamento de assinantes PRO e churn", icon: CreditCard },
  { title: "Receita Mensal", description: "Faturamento, MRR e projeções de receita", icon: DollarSign },
  { title: "Usuários por Plano", description: "Distribuição entre Free, PRO e promocional", icon: TrendingUp },
];

const partnerReport = {
  totalUsers: 530,
  freeUsers: 380,
  proUsers: 150,
  monthlyRevenue: 5300,
  growth: "+12%",
};

export default function AdminReports() {
  const { toast } = useToast();

  const exportPDF = (title: string) => {
    toast({ title: "Exportando PDF", description: `Relatório "${title}" sendo gerado... (Simulado)` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Relatórios</h2>
        <p className="text-muted-foreground">Gere e exporte relatórios da plataforma</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {reports.map((r) => (
          <Card key={r.title}>
            <CardContent className="p-5 flex items-start justify-between">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <r.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => exportPDF(r.title)}>
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Crescimento Mensal</CardTitle>
            <Button size="sm" variant="outline" onClick={() => exportPDF("Crescimento")}>
              <Download className="h-4 w-4 mr-1" /> Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="novos" fill="hsl(160, 60%, 40%)" radius={[4, 4, 0, 0]} name="Novos" />
              <Bar dataKey="cancelados" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} name="Cancelados" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-5 w-5" /> Relatório Mensal para Sócios</CardTitle>
            <Button size="sm" onClick={() => exportPDF("Relatório Mensal Sócios")}>
              <Download className="h-4 w-4 mr-1" /> Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{partnerReport.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total Usuários</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{partnerReport.freeUsers}</p>
              <p className="text-xs text-muted-foreground">Gratuitos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">{partnerReport.proUsers}</p>
              <p className="text-xs text-muted-foreground">Pagantes</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold">R$ {partnerReport.monthlyRevenue.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-muted-foreground">Receita Mês</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold text-primary">{partnerReport.growth}</p>
              <p className="text-xs text-muted-foreground">Crescimento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
