import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpFromLine, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet: { subscription_balance: number; earnings_balance: number } | null;
  onSuccess: () => Promise<void>;
}

export default function WithdrawDialog({ open, onOpenChange, wallet, onSuccess }: WithdrawDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ amount: "", pixKey: "", pixType: "cpf", holderName: "", bankName: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleWithdraw = async () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount < 10) { toast({ title: "Mínimo para saque: 10 Coins", variant: "destructive" }); return; }
    if (!wallet || amount > wallet.earnings_balance) { toast({ title: "Saldo de ganhos insuficiente", variant: "destructive" }); return; }
    if (!form.pixKey || !form.holderName) { toast({ title: "Preencha todos os campos", variant: "destructive" }); return; }

    setSubmitting(true);
    try {
      await supabase.from("wallets").update({
        earnings_balance: wallet.earnings_balance - amount,
        updated_at: new Date().toISOString(),
      }).eq("user_id", user!.id);

      const { error } = await supabase.from("withdrawal_requests").insert({
        user_id: user!.id,
        amount,
        pix_key: form.pixKey,
        pix_type: form.pixType,
        holder_name: form.holderName,
        bank_name: form.bankName,
      });
      if (error) throw error;

      await supabase.from("coin_transactions").insert({
        user_id: user!.id, type: "withdrawal", amount: -amount, balance_type: "earnings",
        description: `Solicitação de saque - ${amount} Coins`,
      });

      toast({ title: "Saque solicitado!", description: "Aguarde a aprovação do administrador." });
      onOpenChange(false);
      setForm({ amount: "", pixKey: "", pixType: "cpf", holderName: "", bankName: "" });
      await onSuccess();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display">Solicitar Saque</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Valor (Coins) *</Label>
            <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} min="10" />
            <p className="text-xs text-muted-foreground">Disponível: {wallet?.earnings_balance?.toFixed(0) || 0} Coins</p>
          </div>
          <div className="space-y-2">
            <Label>Nome do titular *</Label>
            <Input value={form.holderName} onChange={(e) => setForm({ ...form, holderName: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo PIX</Label>
              <Select value={form.pixType} onValueChange={(v) => setForm({ ...form, pixType: v })}>
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
              <Input value={form.pixKey} onChange={(e) => setForm({ ...form, pixKey: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Banco (opcional)</Label>
            <Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
          </div>
          <Button onClick={handleWithdraw} className="w-full gradient-primary border-0" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4 mr-2" />}
            Solicitar Saque
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
