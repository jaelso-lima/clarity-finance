import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IncomeItem {
  id: string;
  valor: number;
  categoria: string;
  descricao: string;
  data: string;
}

const categorias = ["Salário", "Renda Extra", "Comissões", "Lucros", "Outros"];

const mockIncome: IncomeItem[] = [
  { id: "1", valor: 8500, categoria: "Salário", descricao: "Salário mensal", data: "2025-06-05" },
  { id: "2", valor: 2500, categoria: "Renda Extra", descricao: "Freelance design", data: "2025-06-10" },
  { id: "3", valor: 1300, categoria: "Comissões", descricao: "Comissão vendas", data: "2025-06-15" },
];

export default function Income() {
  const [income, setIncome] = useState<IncomeItem[]>(mockIncome);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ valor: "", categoria: "", descricao: "", data: "" });
  const { toast } = useToast();

  const handleAdd = () => {
    if (!form.valor || !form.categoria || !form.data) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    const item: IncomeItem = {
      id: Date.now().toString(),
      valor: parseFloat(form.valor),
      categoria: form.categoria,
      descricao: form.descricao,
      data: form.data,
    };
    setIncome([item, ...income]);
    setForm({ valor: "", categoria: "", descricao: "", data: "" });
    setOpen(false);
    toast({ title: "Receita adicionada com sucesso!" });
  };

  const handleDelete = (id: string) => {
    setIncome(income.filter((i) => i.id !== id));
    toast({ title: "Receita removida" });
  };

  const total = income.reduce((sum, i) => sum + i.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Receitas</h1>
          <p className="text-muted-foreground">
            Total: <span className="font-semibold text-success">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="h-4 w-4 mr-2" /> Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Registrar Receita</DialogTitle>
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
                <Input placeholder="Ex: Salário mensal" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <Button onClick={handleAdd} className="w-full gradient-primary border-0">Adicionar Receita</Button>
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
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {income.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="text-sm">{new Date(i.data).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="font-medium">{i.descricao}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                      {i.categoria}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-success">
                    R$ {i.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {income.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhuma receita registrada ainda.
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
