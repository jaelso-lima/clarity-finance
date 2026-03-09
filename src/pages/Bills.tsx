import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

function getDaysUntil(date: string) {
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function Bills() {
  const [bills, setBills] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nome: "", valor: "", vencimento: "" });
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchBills = async () => {
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .order("vencimento", { ascending: true });
    if (error) {
      toast({ title: "Erro ao carregar contas", description: error.message, variant: "destructive" });
    } else {
      setBills(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleAdd = async () => {
    if (!form.nome || !form.valor || !form.vencimento) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("bills").insert({
      user_id: user?.id,
      nome: form.nome,
      valor: parseFloat(form.valor),
      vencimento: form.vencimento,
      status: "pendente",
    });
    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
      return;
    }
    setForm({ nome: "", valor: "", vencimento: "" });
    setOpen(false);
    toast({ title: "Conta adicionada!" });
    fetchBills();
  };

  const togglePaid = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "pago" ? "pendente" : "pago";
    const { error } = await supabase.from("bills").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      return;
    }
    fetchBills();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("bills").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Conta removida" });
    fetchBills();
  };

  const totalPending = bills.filter((b) => b.status === "pendente").reduce((s, b) => s + Number(b.valor), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Contas a Pagar</h1>
          <p className="text-muted-foreground">
            Pendente: <span className="font-semibold text-warning">R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="h-4 w-4 mr-2" /> Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Nova Conta a Pagar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome da Conta *</Label>
                <Input placeholder="Ex: Energia Elétrica" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor *</Label>
                  <Input type="number" placeholder="0,00" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Vencimento *</Label>
                  <Input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full gradient-primary border-0">Adicionar Conta</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                  <TableHead>Nome</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((b) => {
                  const days = getDaysUntil(b.vencimento);
                  const isUrgent = b.status === "pendente" && days <= 3 && days >= 0;
                  const isOverdue = b.status === "pendente" && days < 0;
                  return (
                    <TableRow key={b.id} className={isOverdue ? "bg-destructive/5" : isUrgent ? "bg-warning/5" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {b.nome}
                          {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive" />}
                          {isUrgent && <Clock className="h-4 w-4 text-warning" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(b.vencimento).toLocaleDateString("pt-BR")}
                        {isOverdue && <span className="text-destructive text-xs ml-2">Vencida</span>}
                        {isUrgent && <span className="text-warning text-xs ml-2">Vence em {days} dia(s)</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={b.status === "pago" ? "default" : "secondary"} className={b.status === "pago" ? "bg-success text-success-foreground" : ""}>
                          {b.status === "pago" ? "Pago" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        R$ {Number(b.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => togglePaid(b.id, b.status)} title={b.status === "pago" ? "Marcar como pendente" : "Marcar como pago"}>
                            <CheckCircle2 className={`h-4 w-4 ${b.status === "pago" ? "text-success" : "text-muted-foreground"}`} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {bills.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhuma conta registrada.
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
