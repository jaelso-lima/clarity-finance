import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const tipos = ["Ações", "Criptomoedas", "Renda Fixa", "Fundos", "Outros"];

export default function Investments() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ tipo: "", descricao: "", valorInvestido: "", lucroPrejuizo: "", data: "" });
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchInvestments = async () => {
    const { data, error } = await supabase
      .from("investments")
      .select("*")
      .order("data", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar investimentos", description: error.message, variant: "destructive" });
    } else {
      setInvestments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleAdd = async () => {
    if (!form.tipo || !form.valorInvestido || !form.data) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("investments").insert({
      user_id: user?.id,
      tipo: form.tipo,
      descricao: form.descricao,
      valor_investido: parseFloat(form.valorInvestido),
      lucro_prejuizo: parseFloat(form.lucroPrejuizo || "0"),
      data: form.data,
    });
    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
      return;
    }
    setForm({ tipo: "", descricao: "", valorInvestido: "", lucroPrejuizo: "", data: "" });
    setOpen(false);
    toast({ title: "Investimento adicionado!" });
    fetchInvestments();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("investments").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Investimento removido" });
    fetchInvestments();
  };

  const totalInvested = investments.reduce((s, i) => s + Number(i.valor_investido), 0);
  const totalProfit = investments.reduce((s, i) => s + Number(i.lucro_prejuizo), 0);

  // Build chart data from real investments grouped by month
  const chartData = investments.reduce((acc: any[], inv) => {
    const month = new Date(inv.data).toLocaleDateString("pt-BR", { month: "short" });
    const existing = acc.find((a) => a.month === month);
    const val = Number(inv.valor_investido) + Number(inv.lucro_prejuizo);
    if (existing) {
      existing.total += val;
    } else {
      acc.push({ month, total: val });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Investimentos</h1>
          <p className="text-muted-foreground">
            Total investido: <span className="font-semibold">R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            {" · "}
            Lucro/Prejuízo: <span className={`font-semibold ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>
              R$ {totalProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="h-4 w-4 mr-2" /> Novo Investimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Registrar Investimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {tipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input placeholder="Ex: PETR4" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Investido *</Label>
                  <Input type="number" placeholder="0,00" value={form.valorInvestido} onChange={(e) => setForm({ ...form, valorInvestido: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Lucro/Prejuízo</Label>
                  <Input type="number" placeholder="0,00" value={form.lucroPrejuizo} onChange={(e) => setForm({ ...form, lucroPrejuizo: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full gradient-primary border-0">Adicionar Investimento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Evolução dos Investimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString("pt-BR")}`} />
                <Line type="monotone" dataKey="total" name="Total" stroke="hsl(160, 60%, 40%)" strokeWidth={2.5} dot={{ fill: "hsl(160, 60%, 40%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Investido</TableHead>
                  <TableHead className="text-right">Lucro/Prejuízo</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-sm">{new Date(inv.data).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="font-medium">{inv.descricao}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                        {inv.tipo}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      R$ {Number(inv.valor_investido).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={`flex items-center justify-end gap-1 ${Number(inv.lucro_prejuizo) >= 0 ? "text-success" : "text-destructive"}`}>
                        {Number(inv.lucro_prejuizo) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        R$ {Math.abs(Number(inv.lucro_prejuizo)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(inv.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {investments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum investimento registrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
