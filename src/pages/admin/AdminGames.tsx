import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gamepad2, Coins, ArrowUpFromLine, CheckCircle, XCircle, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function AdminGames() {
  const [matches, setMatches] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ userId: "", amount: "", type: "earnings" });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [matchesRes, withdrawalsRes, walletsRes] = await Promise.all([
      supabase.from("game_matches").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("withdrawal_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("wallets").select("*").order("updated_at", { ascending: false }),
    ]);
    setMatches(matchesRes.data || []);
    setWithdrawals(withdrawalsRes.data || []);
    setWallets(walletsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleWithdrawalAction = async (id: string, action: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      const withdrawal = withdrawals.find(w => w.id === id);
      
      await supabase.from("withdrawal_requests").update({
        status: action,
        reviewed_at: new Date().toISOString(),
      }).eq("id", id);

      // If rejected, refund coins
      if (action === "rejected" && withdrawal) {
        const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", withdrawal.user_id).single();
        if (wallet) {
          await supabase.from("wallets").update({
            earnings_balance: wallet.earnings_balance + withdrawal.amount,
            updated_at: new Date().toISOString(),
          }).eq("user_id", withdrawal.user_id);
        }
        await supabase.from("coin_transactions").insert({
          user_id: withdrawal.user_id, type: "admin_adjust", amount: withdrawal.amount, balance_type: "earnings",
          description: "Saque recusado - reembolso",
        });
      }

      toast({ title: action === "approved" ? "Saque aprovado!" : "Saque recusado e coins reembolsados" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdjust = async () => {
    const amount = parseFloat(adjustForm.amount);
    if (!adjustForm.userId || !amount) { toast({ title: "Preencha os campos", variant: "destructive" }); return; }

    const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", adjustForm.userId).single();
    if (!wallet) { toast({ title: "Carteira não encontrada", variant: "destructive" }); return; }

    const field = adjustForm.type === "subscription" ? "subscription_balance" : "earnings_balance";
    const currentVal = adjustForm.type === "subscription" ? wallet.subscription_balance : wallet.earnings_balance;

    await supabase.from("wallets").update({
      [field]: currentVal + amount,
      updated_at: new Date().toISOString(),
    }).eq("user_id", adjustForm.userId);

    await supabase.from("coin_transactions").insert({
      user_id: adjustForm.userId, type: "admin_adjust", amount, balance_type: adjustForm.type,
      description: `Ajuste manual pelo admin`,
    });

    toast({ title: "Saldo ajustado!" });
    setAdjustOpen(false);
    setAdjustForm({ userId: "", amount: "", type: "earnings" });
    fetchData();
  };

  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display flex items-center gap-2">
            <Gamepad2 className="h-6 w-6" /> Controle de Jogos & Coins
          </h2>
          <p className="text-muted-foreground">Gerencie partidas, saldos e saques</p>
        </div>
        <Button variant="outline" onClick={() => setAdjustOpen(true)}>
          <Coins className="h-4 w-4 mr-2" /> Ajustar Saldo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Partidas Totais</p>
            <p className="text-2xl font-bold">{matches.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Carteiras Ativas</p>
            <p className="text-2xl font-bold">{wallets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Saques Pendentes</p>
            <p className="text-2xl font-bold text-warning">{pendingWithdrawals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Taxas Coletadas</p>
            <p className="text-2xl font-bold text-success">
              {matches.reduce((s, m) => s + (m.platform_fee || 0), 0).toFixed(0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="withdrawals">
        <TabsList>
          <TabsTrigger value="withdrawals">
            Saques {pendingWithdrawals.length > 0 && <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">{pendingWithdrawals.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="matches">Partidas</TabsTrigger>
          <TabsTrigger value="wallets">Carteiras</TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>PIX</TableHead>
                    <TableHead>Titular</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="text-sm">{new Date(w.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-xs font-mono">{w.user_id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-semibold">{w.amount} Coins</TableCell>
                      <TableCell className="text-xs">{w.pix_key}</TableCell>
                      <TableCell>{w.holder_name}</TableCell>
                      <TableCell>
                        <Badge variant={w.status === "approved" ? "default" : w.status === "rejected" ? "destructive" : "secondary"}>
                          {w.status === "pending" ? "Pendente" : w.status === "approved" ? "Aprovado" : "Recusado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {w.status === "pending" && (
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => handleWithdrawalAction(w.id, "approved")} disabled={!!actionLoading}>
                              {actionLoading === w.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-success" />}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleWithdrawalAction(w.id, "rejected")} disabled={!!actionLoading}>
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {withdrawals.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum saque registrado.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Jogo</TableHead>
                    <TableHead>Coins</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.slice(0, 50).map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">{new Date(m.created_at).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell><Badge variant="outline">{m.game_type === "tic_tac_toe" ? "Velha" : "Dama"}</Badge></TableCell>
                      <TableCell className="font-semibold">{m.bet_amount * 2}</TableCell>
                      <TableCell className="text-success">{m.platform_fee || 0}</TableCell>
                      <TableCell>
                        <Badge variant={m.status === "finished" ? "default" : m.status === "playing" ? "secondary" : "outline"}>
                          {m.status === "finished" ? "Finalizada" : m.status === "playing" ? "Em jogo" : m.status === "waiting" ? "Aguardando" : "Cancelada"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {matches.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma partida registrada.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallets" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário ID</TableHead>
                    <TableHead className="text-right">Assinatura</TableHead>
                    <TableHead className="text-right">Ganhos</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="text-xs font-mono">{w.user_id.slice(0, 12)}...</TableCell>
                      <TableCell className="text-right">{w.subscription_balance}</TableCell>
                      <TableCell className="text-right text-success">{w.earnings_balance}</TableCell>
                      <TableCell className="text-right font-semibold">{w.subscription_balance + w.earnings_balance}</TableCell>
                    </TableRow>
                  ))}
                  {wallets.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhuma carteira encontrada.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Adjust Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Ajustar Saldo de Coins</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={adjustForm.userId} onChange={(e) => setAdjustForm({ ...adjustForm, userId: e.target.value })} placeholder="UUID do usuário" />
            </div>
            <div className="space-y-2">
              <Label>Valor (positivo para adicionar, negativo para remover)</Label>
              <Input type="number" value={adjustForm.amount} onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Saldo</Label>
              <select className="w-full rounded-md border p-2 text-sm" value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}>
                <option value="earnings">Ganhos (sacável)</option>
                <option value="subscription">Assinatura (não sacável)</option>
              </select>
            </div>
            <Button onClick={handleAdjust} className="w-full gradient-primary border-0">Aplicar Ajuste</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
