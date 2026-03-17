import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, Wallet, ArrowDownToLine, ArrowUpFromLine, History, AlertTriangle, Loader2, ShoppingCart, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CoinPackages from "@/components/wallet/CoinPackages";
import WithdrawDialog from "@/components/wallet/WithdrawDialog";

export default function WalletPage() {
  const { user } = useAuth();
  const { wallet, loading, refreshWallet } = useWallet();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5 text-center">
            <Coins className="h-7 w-7 sm:h-8 sm:w-8 mx-auto text-warning mb-2" />
            <p className="text-sm text-muted-foreground">Saldo Total</p>
            <p className="text-2xl sm:text-3xl font-bold font-display">{loading ? "..." : totalBalance.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Coins</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-4 sm:p-5 text-center">
            <ArrowDownToLine className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground">Saldo Assinatura</p>
            <p className="text-xl sm:text-2xl font-bold font-display">{loading ? "..." : (wallet?.subscription_balance || 0).toFixed(0)}</p>
            <Badge variant="secondary" className="mt-1 text-[10px] sm:text-xs">Não sacável</Badge>
          </CardContent>
        </Card>
        <Card className="border-success/20">
          <CardContent className="p-4 sm:p-5 text-center">
            <ArrowUpFromLine className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-success mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground">Saldo de Ganhos</p>
            <p className="text-xl sm:text-2xl font-bold font-display text-success">{loading ? "..." : (wallet?.earnings_balance || 0).toFixed(0)}</p>
            <Badge variant="outline" className="mt-1 text-[10px] sm:text-xs border-success/30 text-success">Sacável</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Coin Packages */}
      <CoinPackages onPurchase={refreshWallet} />

      {/* Info */}
      <div className="flex items-start gap-3 rounded-lg border border-muted bg-muted/30 p-3">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Bônus de Boas-vindas:</strong> 5 Coins grátis (assinatura). Usáveis em desafios, <strong>não sacáveis</strong>.</p>
          <p><strong>Saldo Assinatura:</strong> Recebido com plano PRO. Expira no próximo ciclo.</p>
          <p><strong>Saldo de Ganhos:</strong> Obtido em desafios. Sacável com <strong>mínimo de 10 Coins</strong>.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => setWithdrawOpen(true)}
          className="gradient-primary border-0"
          disabled={!wallet || wallet.earnings_balance < 10}
        >
          <ArrowUpFromLine className="h-4 w-4 mr-2" /> Solicitar Saque
          {wallet && wallet.earnings_balance < 10 && (
            <span className="ml-2 text-xs opacity-75">(mín. 10 Coins)</span>
          )}
        </Button>
      </div>

      {/* Withdraw Dialog */}
      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        wallet={wallet}
        onSuccess={refreshWallet}
      />

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Solicitações de Saque</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="hidden sm:table-cell">PIX</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="text-sm">{new Date(w.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="font-semibold">{w.amount} Coins</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{w.pix_key}</TableCell>
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
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs sm:text-sm">{new Date(tx.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="hidden sm:table-cell"><Badge variant="outline" className="text-xs">{tx.balance_type === "subscription" ? "Assinatura" : "Ganhos"}</Badge></TableCell>
                  <TableCell className="text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">{tx.description || tx.type}</TableCell>
                  <TableCell className={`text-right font-semibold text-xs sm:text-sm ${tx.amount >= 0 ? "text-success" : "text-destructive"}`}>
                    {tx.amount >= 0 ? "+" : ""}{tx.amount}
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
