import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coins, Wallet, ArrowDownToLine, ArrowUpFromLine, History, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function WalletPage() {
  const { user } = useAuth();
  const { wallet, loading, refreshWallet } = useWallet();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", pixKey: "", pixType: "cpf", holderName: "", bankName: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("coin_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("withdrawal_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]).then(([txRes, wdRes]) => {
      setTransactions(txRes.data || []);
      setWithdrawals(wdRes.data || []);
    });
  }, [user]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawForm.amount);
    if (!amount || amount < 10) { toast({ title: "Mínimo para saque: 10 Coins", variant: "destructive" }); return; }
    if (!wallet || amount > wallet.earnings_balance) { toast({ title: "Saldo de ganhos insuficiente", variant: "destructive" }); return; }
    if (!withdrawForm.pixKey || !withdrawForm.holderName) { toast({ title: "Preencha todos os campos", variant: "destructive" }); return; }

    setSubmitting(true);
    try {
      // Debit earnings
      await supabase.from("wallets").update({
        earnings_balance: wallet.earnings_balance - amount,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user!.id);

      const { error } = await supabase.from("withdrawal_requests").insert({
        user_id: user!.id,
        amount,
        pix_key: withdrawForm.pixKey,
        pix_type: withdrawForm.pixType,
        holder_name: withdrawForm.holderName,
        bank_name: withdrawForm.bankName,
      });
      if (error) throw error;

      await supabase.from("coin_transactions").insert({
        user_id: user!.id, type: "withdrawal", amount: -amount, balance_type: "earnings",
        description: `Solicitação de saque - ${amount} Coins`,
      });

      toast({ title: "Saque solicitado!", description: "Aguarde a aprovação do administrador." });
      setWithdrawOpen(false);
      setWithdrawForm({ amount: "", pixKey: "", pixType: "cpf", holderName: "", bankName: "" });
      await refreshWallet();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const totalBalance = (wallet?.subscription_balance || 0) + (wallet?.earnings_balance || 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Wallet className="h-7 w-7 text-primary" /> Minha Carteira
        </h1>
        <p className="text-muted-foreground">Gerencie seus Coins e saques</p>
      </div>

      {/* Balances */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <Coins className="h-8 w-8 mx-auto text-warning mb-2" />
            <p className="text-sm text-muted-foreground">Saldo Total</p>
            <p className="text-3xl font-bold font-display">{loading ? "..." : totalBalance.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Coins</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-5 text-center">
            <ArrowDownToLine className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Saldo Assinatura</p>
            <p className="text-2xl font-bold font-display">{loading ? "..." : (wallet?.subscription_balance || 0).toFixed(0)}</p>
            <Badge variant="secondary" className="mt-1 text-xs">Não sacável · Expira mensalmente</Badge>
          </CardContent>
        </Card>
        <Card className="border-success/20">
          <CardContent className="p-5 text-center">
            <ArrowUpFromLine className="h-6 w-6 mx-auto text-success mb-2" />
            <p className="text-sm text-muted-foreground">Saldo de Ganhos</p>
            <p className="text-2xl font-bold font-display text-success">{loading ? "..." : (wallet?.earnings_balance || 0).toFixed(0)}</p>
            <Badge variant="outline" className="mt-1 text-xs border-success/30 text-success">Sacável</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 rounded-lg border border-muted bg-muted/30 p-3">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Saldo Assinatura:</strong> Recebido mensalmente com o plano PRO. Não pode ser sacado e expira no próximo ciclo.</p>
          <p><strong>Saldo de Ganhos:</strong> Obtido em desafios e atividades. Pode ser acumulado e sacado.</p>
          <p><strong>Mínimo para saque:</strong> 10 Coins. Aprovação manual pelo admin.</p>
        </div>
      </div>

      <Button onClick={() => setWithdrawOpen(true)} className="gradient-primary border-0">
        <ArrowUpFromLine className="h-4 w-4 mr-2" /> Solicitar Saque
      </Button>

      {/* Withdrawal dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Solicitar Saque</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Valor (Coins) *</Label>
              <Input type="number" value={withdrawForm.amount} onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} min="10" />
              <p className="text-xs text-muted-foreground">Disponível para saque: {wallet?.earnings_balance?.toFixed(0) || 0} Coins</p>
            </div>
            <div className="space-y-2">
              <Label>Nome do titular *</Label>
              <Input value={withdrawForm.holderName} onChange={(e) => setWithdrawForm({ ...withdrawForm, holderName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de chave PIX</Label>
                <Select value={withdrawForm.pixType} onValueChange={(v) => setWithdrawForm({ ...withdrawForm, pixType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="random">Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chave PIX *</Label>
                <Input value={withdrawForm.pixKey} onChange={(e) => setWithdrawForm({ ...withdrawForm, pixKey: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Banco (opcional)</Label>
              <Input value={withdrawForm.bankName} onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })} />
            </div>
            <Button onClick={handleWithdraw} className="w-full gradient-primary border-0" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4 mr-2" />}
              Solicitar Saque
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Solicitações de Saque</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>PIX</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>{new Date(w.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="font-semibold">{w.amount} Coins</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{w.pix_key}</TableCell>
                    <TableCell>
                      <Badge variant={w.status === "approved" ? "default" : w.status === "rejected" ? "destructive" : "secondary"}>
                        {w.status === "pending" ? "Pendente" : w.status === "approved" ? "Aprovado" : "Recusado"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" /> Histórico de Transações</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm">{new Date(tx.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{tx.balance_type === "subscription" ? "Assinatura" : "Ganhos"}</Badge></TableCell>
                  <TableCell className="text-sm">{tx.description || tx.type}</TableCell>
                  <TableCell className={`text-right font-semibold ${tx.amount >= 0 ? "text-success" : "text-destructive"}`}>
                    {tx.amount >= 0 ? "+" : ""}{tx.amount} Coins
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhuma transação registrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
