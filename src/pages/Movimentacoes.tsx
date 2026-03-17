import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Trash2, ArrowUpCircle, ArrowDownCircle,
  ShoppingBag, Car, Home, Gamepad2, GraduationCap, HeartPulse, MoreHorizontal, Briefcase, Coins,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const categoriasReceita = ["Salário", "Renda Extra", "Comissões", "Lucros", "Outros"];
const categoriasDespesa = ["Alimentação", "Transporte", "Moradia", "Lazer", "Educação", "Saúde", "Outros"];
const pagamentos = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Boleto"];

const categoryIcons: Record<string, any> = {
  "Alimentação": ShoppingBag, "Transporte": Car, "Moradia": Home,
  "Lazer": Gamepad2, "Educação": GraduationCap, "Saúde": HeartPulse,
  "Salário": Briefcase, "Renda Extra": Coins, "Comissões": Coins, "Lucros": Coins,
};

export default function Movimentacoes() {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIncome, setOpenIncome] = useState(false);
  const [openExpense, setOpenExpense] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ valor: "", categoria: "", descricao: "", data: "" });
  const [expenseForm, setExpenseForm] = useState({ valor: "", categoria: "", descricao: "", data: "", pagamento: "" });
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchAll = async () => {
    const [incRes, expRes] = await Promise.all([
      supabase.from("incomes").select("*").order("data", { ascending: false }),
      supabase.from("expenses").select("*").order("data", { ascending: false }),
    ]);
    setIncomes(incRes.data || []);
    setExpenses(expRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAddIncome = async () => {
    if (!incomeForm.valor || !incomeForm.categoria || !incomeForm.data) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("incomes").insert({
      user_id: user?.id, valor: parseFloat(incomeForm.valor),
      categoria: incomeForm.categoria, descricao: incomeForm.descricao, data: incomeForm.data,
    });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setIncomeForm({ valor: "", categoria: "", descricao: "", data: "" });
    setOpenIncome(false);
    toast({ title: "Receita adicionada!" });
    fetchAll();
  };

  const handleAddExpense = async () => {
    if (!expenseForm.valor || !expenseForm.categoria || !expenseForm.data) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" }); return;
    }
    const { error } = await supabase.from("expenses").insert({
      user_id: user?.id, valor: parseFloat(expenseForm.valor),
      categoria: expenseForm.categoria, descricao: expenseForm.descricao,
      data: expenseForm.data, pagamento: expenseForm.pagamento,
    });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    setExpenseForm({ valor: "", categoria: "", descricao: "", data: "", pagamento: "" });
    setOpenExpense(false);
    toast({ title: "Despesa adicionada!" });
    fetchAll();
  };

  const handleDelete = async (table: "incomes" | "expenses", id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast({ title: "Erro ao remover", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Removido" });
    fetchAll();
  };

  const totalIncome = incomes.reduce((s, i) => s + Number(i.valor), 0);
  const totalExpense = expenses.reduce((s, e) => s + Number(e.valor), 0);
  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  // Combine and sort all transactions
  const allTransactions = [
    ...incomes.map(i => ({ ...i, type: "income" as const })),
    ...expenses.map(e => ({ ...e, type: "expense" as const })),
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const incomeTransactions = allTransactions.filter(t => t.type === "income");
  const expenseTransactions = allTransactions.filter(t => t.type === "expense");

  const TransactionItem = ({ t }: { t: any }) => {
    const Icon = categoryIcons[t.categoria] || MoreHorizontal;
    const isIncome = t.type === "income";
    return (
      <div className="flex items-center gap-3 p-4">
        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${isIncome ? "bg-success/10" : "bg-destructive/10"}`}>
          <Icon className={`h-5 w-5 ${isIncome ? "text-success" : "text-destructive"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{t.descricao || t.categoria}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(t.data).toLocaleDateString("pt-BR")}
            {t.pagamento && ` · ${t.pagamento}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className={`font-semibold text-sm ${isIncome ? "text-success" : "text-destructive"}`}>
            {isIncome ? "+" : "-"}{fmt(Number(t.valor))}
          </p>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(isIncome ? "incomes" : "expenses", t.id)}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold">Extrato</h1>
        <p className="text-muted-foreground text-sm">Suas movimentações financeiras</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center">
          <p className="text-[11px] text-muted-foreground">Receitas</p>
          <p className="font-display text-base md:text-lg font-bold text-success">{fmt(totalIncome)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-[11px] text-muted-foreground">Despesas</p>
          <p className="font-display text-base md:text-lg font-bold text-destructive">{fmt(totalExpense)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-[11px] text-muted-foreground">Saldo</p>
          <p className={`font-display text-base md:text-lg font-bold ${totalIncome - totalExpense >= 0 ? "text-success" : "text-destructive"}`}>
            {fmt(totalIncome - totalExpense)}
          </p>
        </CardContent></Card>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Dialog open={openIncome} onOpenChange={setOpenIncome}>
          <DialogTrigger asChild>
            <Button className="flex-1 gradient-primary border-0 h-11"><ArrowUpCircle className="h-4 w-4 mr-2" /> Receita</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Nova Receita</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Valor *</Label><Input type="number" placeholder="0,00" value={incomeForm.valor} onChange={(e) => setIncomeForm({ ...incomeForm, valor: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Data *</Label><Input type="date" value={incomeForm.data} onChange={(e) => setIncomeForm({ ...incomeForm, data: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Categoria *</Label>
                <Select value={incomeForm.categoria} onValueChange={(v) => setIncomeForm({ ...incomeForm, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{categoriasReceita.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Descrição</Label><Input placeholder="Ex: Salário mensal" value={incomeForm.descricao} onChange={(e) => setIncomeForm({ ...incomeForm, descricao: e.target.value })} /></div>
              <Button onClick={handleAddIncome} className="w-full gradient-primary border-0 h-11">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={openExpense} onOpenChange={setOpenExpense}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 h-11"><ArrowDownCircle className="h-4 w-4 mr-2" /> Despesa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Nova Despesa</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Valor *</Label><Input type="number" placeholder="0,00" value={expenseForm.valor} onChange={(e) => setExpenseForm({ ...expenseForm, valor: e.target.value })} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Data *</Label><Input type="date" value={expenseForm.data} onChange={(e) => setExpenseForm({ ...expenseForm, data: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Categoria *</Label>
                <Select value={expenseForm.categoria} onValueChange={(v) => setExpenseForm({ ...expenseForm, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{categoriasDespesa.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Descrição</Label><Input placeholder="Ex: Supermercado" value={expenseForm.descricao} onChange={(e) => setExpenseForm({ ...expenseForm, descricao: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Pagamento</Label>
                <Select value={expenseForm.pagamento} onValueChange={(v) => setExpenseForm({ ...expenseForm, pagamento: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{pagamentos.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddExpense} className="w-full gradient-primary border-0 h-11">Adicionar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transactions List */}
      <Tabs defaultValue="todas">
        <TabsList className="w-full">
          <TabsTrigger value="todas" className="flex-1 text-xs">Todas</TabsTrigger>
          <TabsTrigger value="receitas" className="flex-1 text-xs">Receitas</TabsTrigger>
          <TabsTrigger value="despesas" className="flex-1 text-xs">Despesas</TabsTrigger>
        </TabsList>

        {[
          { value: "todas", data: allTransactions },
          { value: "receitas", data: incomeTransactions },
          { value: "despesas", data: expenseTransactions },
        ].map(({ value, data }) => (
          <TabsContent key={value} value={value} className="mt-3">
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {loading ? (
                  <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
                ) : data.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">Nenhuma movimentação registrada.</div>
                ) : (
                  data.map((t, i) => <TransactionItem key={`${t.id}-${i}`} t={t} />)
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
