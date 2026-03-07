import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  valor: number;
  categoria: string;
  descricao: string;
  data: string;
  pagamento: string;
}

const categorias = [
  "Alimentação", "Transporte", "Moradia", "Lazer", "Educação", "Saúde", "Outros",
];
const pagamentos = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Boleto"];

const mockExpenses: Expense[] = [
  { id: "1", valor: 250, categoria: "Alimentação", descricao: "Supermercado", data: "2025-06-01", pagamento: "Cartão de Débito" },
  { id: "2", valor: 89.9, categoria: "Transporte", descricao: "Combustível", data: "2025-06-03", pagamento: "PIX" },
  { id: "3", valor: 1200, categoria: "Moradia", descricao: "Aluguel", data: "2025-06-05", pagamento: "Boleto" },
  { id: "4", valor: 150, categoria: "Lazer", descricao: "Cinema e jantar", data: "2025-06-08", pagamento: "Cartão de Crédito" },
];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ valor: "", categoria: "", descricao: "", data: "", pagamento: "" });
  const { toast } = useToast();

  const handleAdd = () => {
    if (!form.valor || !form.categoria || !form.data) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    const newExpense: Expense = {
      id: Date.now().toString(),
      valor: parseFloat(form.valor),
      categoria: form.categoria,
      descricao: form.descricao,
      data: form.data,
      pagamento: form.pagamento,
    };
    setExpenses([newExpense, ...expenses]);
    setForm({ valor: "", categoria: "", descricao: "", data: "", pagamento: "" });
    setOpen(false);
    toast({ title: "Despesa adicionada com sucesso!" });
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
    toast({ title: "Despesa removida" });
  };

  const total = expenses.reduce((sum, e) => sum + e.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Despesas</h1>
          <p className="text-muted-foreground">
            Total: <span className="font-semibold text-destructive">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="h-4 w-4 mr-2" /> Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Registrar Despesa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input type="number" placeholder="0,00" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Data *</Label>
                  <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input placeholder="Ex: Supermercado" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={form.pagamento} onValueChange={(v) => setForm({ ...form, pagamento: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {pagamentos.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full gradient-primary border-0">Adicionar Despesa</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
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
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {e.categoria}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.pagamento}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">
                    R$ {e.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {expenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhuma despesa registrada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
