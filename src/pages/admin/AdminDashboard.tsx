import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, TrendingUp, DollarSign, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalSubscriptions: 0,
    totalPlans: 0,
  });

  useEffect(() => {
    const fetch = async () => {
      const [profilesRes, subsRes, plansRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }),
        supabase.from("plans").select("id", { count: "exact", head: true }),
      ]);

      setMetrics({
        totalUsers: profilesRes.count || 0,
        totalSubscriptions: subsRes.count || 0,
        totalPlans: plansRes.count || 0,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  const hasData = metrics.totalUsers > 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const cards = [
    { label: "Total de Usuários", value: metrics.totalUsers, icon: Users },
    { label: "Assinaturas Ativas", value: metrics.totalSubscriptions, icon: CreditCard },
    { label: "Planos Cadastrados", value: metrics.totalPlans, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display">Dashboard da Plataforma</h2>
        <p className="text-muted-foreground">Visão geral do sistema Nexo</p>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">Nenhum dado disponível ainda.</h2>
            <p className="text-muted-foreground max-w-md">
              As métricas aparecerão aqui conforme usuários se cadastrarem e começarem a usar a plataforma.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((m) => (
            <Card key={m.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <m.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-sm text-muted-foreground">{m.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
