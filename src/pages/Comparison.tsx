import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Comparison() {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const check = async () => {
      const [expRes, incRes] = await Promise.all([
        supabase.from("expenses").select("id", { count: "exact", head: true }),
        supabase.from("incomes").select("id", { count: "exact", head: true }),
      ]);
      setHasData((expRes.count || 0) > 0 && (incRes.count || 0) > 0);
      setLoading(false);
    };
    check();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Comparação Financeira</h1>
        <p className="text-muted-foreground">Compare seus gastos com a média dos usuários (100% anônimo)</p>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="p-10 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold">Dados insuficientes para comparação.</h2>
            <p className="text-muted-foreground max-w-md">
              Adicione suas receitas e despesas para comparar seus gastos com outros usuários da plataforma.
            </p>
            <Button asChild className="gradient-primary border-0 mt-2">
              <Link to="/movimentacoes"><Plus className="h-4 w-4 mr-2" /> Adicionar movimentação</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-muted-foreground">A comparação anônima estará disponível quando houver mais usuários na plataforma.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
