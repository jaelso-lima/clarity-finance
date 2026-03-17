import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const categoriasReceita = ["Salário", "Renda Extra", "Comissões", "Lucros", "Outros"];
const categoriasDespesa = ["Alimentação", "Transporte", "Moradia", "Lazer", "Educação", "Saúde", "Outros"];
const pagamentos = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Boleto"];

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
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
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
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
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
    toast({ title: "Removido com sucesso" });
    fetchAll();
  };

  const totalIncome = incomes.reduce((s, i) => s + Number(i.valor), 0);
  const totalExpense = expenses.reduce((s, e) => s + Number(e.valor), 0);
  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Movimentações Financeiras</h1>
        <p className="text-muted-foreground">Gerencie suas receitas e despesas em um só lugar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Receitas</p>
            <p className="font-display text-xl font-bold text-success">{fmt(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Despesas</p>
            <p className="font-display text-xl font-bold text-destructive">{fmt(totalExpense)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className={`font-display text-xl font-bold ${totalIncome - totalExpense >= 0 ? "text-success" : "text-destructive"}`}>
              {fmt(totalIncome - totalExpense)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="receitas">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="receitas" className="gap-2">
              <ArrowUpCircle className="h-4 w-4" /> Receitas
            </TabsTrigger>
            <TabsTrigger value="despesas" className="gap-2">
              <ArrowDownCircle className="h-4 w-4" /> Despesas
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Dialog open={openIncome} onOpenChange={setOpenIncome}>
              <DialogTrigger asChild>
                <Button className="gradient-primary border-0" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Receita
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display">Registrar Receita</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor *</Label>
                      <Input type="number" placeholder="0,00" value={incomeForm.valor} onChange={(e) => setIncomeForm({ ...incomeForm, valor: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data *</Label>
                      <Input type="date" value={incomeForm.data} onChange={(e) => setIncomeForm({ ...incomeForm, data: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select value={incomeForm.categoria} onValueChange={(v) => setIncomeForm({ ...incomeForm, categoria: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {categoriasReceita.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input placeholder="Ex: Salário mensal" value={incomeForm.descricao} onChange={(e) => setIncomeForm({ ...incomeForm, descricao: e.target.value })} />
                  </div>
                  <Button onClick={handleAddIncome} className="w-full gradient-primary border-0">Adicionar Receita</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={openExpense} onOpenChange={setOpenExpense}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Despesa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display">Registrar Despesa</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor *</Label>
                      <Input type="number" placeholder="0,00" value={expenseForm.valor} onChange={(e) => setExpenseForm({ ...expenseForm, valor: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data *</Label>
                      <Input type="date" value={expenseForm.data} onChange={(e) => setExpenseForm({ ...expenseForm, data: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select value={expenseForm.categoria} onValueChange={(v) => setExpenseForm({ ...expenseForm, categoria: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {categoriasDespesa.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input placeholder="Ex: Supermercado" value={expenseForm.descricao} onChange={(e) => setExpenseForm({ ...expenseForm, descricao: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Forma de Pagamento</Label>
                    <Select value={expenseForm.pagamento} onValueChange={(v) => setExpenseForm({ ...expenseForm, pagamento: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {pagamentos.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddExpense} className="w-full gradient-primary border-0">Adicionar Despesa</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="receitas" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-16" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomes.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="text-sm">{new Date(i.data).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="font-medium">{i.descricao}</TableCell>
                        <TableCell>
                          <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">{i.categoria}</span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-success">{fmt(Number(i.valor))}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete("incomes", i.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {incomes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma receita registrada ainda.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="despesas" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-16" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-sm">{new Date(e.data).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell className="font-medium">{e.descricao}</TableCell>
                        <TableCell>
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{e.categoria}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{e.pagamento}</TableCell>
                        <TableCell className="text-right font-semibold text-destructive">{fmt(Number(e.valor))}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete("expenses", e.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {expenses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma despesa registrada ainda.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
