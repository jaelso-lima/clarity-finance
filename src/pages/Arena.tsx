import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Trophy, Coins, Plus, Users, Clock, AlertTriangle, Bot } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TicTacToeGame from "@/components/games/TicTacToeGame";
import CheckersGame from "@/components/games/CheckersGame";
import { useWallet } from "@/hooks/useWallet";
import { BOT_USER_ID } from "@/lib/botAI";

export default function Arena() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { wallet, refreshWallet } = useWallet();
  const [matches, setMatches] = useState<any[]>([]);
  const [myMatches, setMyMatches] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [gameType, setGameType] = useState("tic_tac_toe");
  const [betAmount, setBetAmount] = useState("5");
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    if (!user) return;
    const [waitingRes, myRes] = await Promise.all([
      supabase.from("game_matches").select("*").eq("status", "waiting").neq("player1_id", user.id).order("created_at", { ascending: false }),
      supabase.from("game_matches").select("*").in("status", ["waiting", "playing"]).or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`).order("created_at", { ascending: false }),
    ]);
    setMatches(waitingRes.data || []);
    setMyMatches(myRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const totalBalance = (wallet?.subscription_balance || 0) + (wallet?.earnings_balance || 0);

  const handleCreate = async () => {
    const bet = parseFloat(betAmount);
    if (bet <= 0) { toast({ title: "Valor inválido", variant: "destructive" }); return; }
    if (bet > totalBalance) { toast({ title: "Saldo insuficiente", variant: "destructive" }); return; }

    const initialState = gameType === "tic_tac_toe"
      ? { board: Array(9).fill(null), currentPlayer: "X" }
      : { board: createInitialCheckersBoard(), currentPlayer: "red" };

    const { data, error } = await supabase.from("game_matches").insert({
      game_type: gameType,
      player1_id: user!.id,
      bet_amount: bet,
      game_state: initialState,
      status: "waiting",
    }).select().single();

    if (error) { toast({ title: "Erro ao criar partida", description: error.message, variant: "destructive" }); return; }

    // Debit coins
    await debitCoins(user!.id, bet, "game_entry", `Entrada na partida ${data.id}`);
    await refreshWallet();

    toast({ title: "Desafio criado!", description: "Aguardando oponente..." });
    setCreateOpen(false);
    fetchMatches();
  };

  const handleJoin = async (match: any) => {
    if (match.bet_amount > totalBalance) { toast({ title: "Saldo insuficiente", variant: "destructive" }); return; }

    const { error } = await supabase.from("game_matches").update({
      player2_id: user!.id,
      status: "playing",
      started_at: new Date().toISOString(),
    }).eq("id", match.id);

    if (error) { toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" }); return; }

    await debitCoins(user!.id, match.bet_amount, "game_entry", `Entrada na partida ${match.id}`);
    await refreshWallet();
    toast({ title: "Partida iniciada!" });
    fetchMatches();
  };

  const handleOpenMatch = (match: any) => setActiveMatch(match);

  const handleMatchEnd = async () => {
    setActiveMatch(null);
    await refreshWallet();
    fetchMatches();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Gamepad2 className="h-7 w-7 text-primary" /> Arena de Desafios
          </h1>
          <p className="text-muted-foreground">Desafie outros jogadores e ganhe coins</p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">{totalBalance.toFixed(0)} Coins</span>
            </div>
          </Card>
          <Button onClick={() => setCreateOpen(true)} className="gradient-primary border-0">
            <Plus className="h-4 w-4 mr-2" /> Criar Desafio
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Desafios utilizam coins do sistema. Taxa de 10% sobre o prêmio do vencedor. Abandono = derrota automática.
        </p>
      </div>

      {/* Active Match */}
      {activeMatch && (
        <Dialog open={!!activeMatch} onOpenChange={() => setActiveMatch(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                {activeMatch.game_type === "tic_tac_toe" ? "Jogo da Velha" : "Jogo de Dama"}
                <Badge variant="outline">{activeMatch.bet_amount} Coins</Badge>
              </DialogTitle>
            </DialogHeader>
            {activeMatch.game_type === "tic_tac_toe" ? (
              <TicTacToeGame match={activeMatch} userId={user!.id} onEnd={handleMatchEnd} />
            ) : (
              <CheckersGame match={activeMatch} userId={user!.id} onEnd={handleMatchEnd} />
            )}
          </DialogContent>
        </Dialog>
      )}

      <Tabs defaultValue="lobby">
        <TabsList>
          <TabsTrigger value="lobby">Lobby</TabsTrigger>
          <TabsTrigger value="my">Minhas Partidas</TabsTrigger>
        </TabsList>

        <TabsContent value="lobby" className="space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : matches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Gamepad2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum desafio disponível no momento.</p>
                <p className="text-sm">Crie um desafio e aguarde um oponente!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((m) => (
                <Card key={m.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {m.game_type === "tic_tac_toe" ? "Jogo da Velha" : "Dama"}
                      </Badge>
                      <span className="text-sm font-semibold text-warning flex items-center gap-1">
                        <Coins className="h-3 w-3" /> {m.bet_amount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" /> Aguardando oponente
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {new Date(m.created_at).toLocaleTimeString("pt-BR")}
                    </div>
                    <Button onClick={() => handleJoin(m)} className="w-full" size="sm">
                      Aceitar Desafio
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-4 mt-4">
          {myMatches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhuma partida ativa.
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myMatches.map((m) => (
                <Card key={m.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {m.game_type === "tic_tac_toe" ? "Jogo da Velha" : "Dama"}
                      </Badge>
                      <Badge variant={m.status === "playing" ? "default" : "secondary"}>
                        {m.status === "waiting" ? "Aguardando" : "Em jogo"}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold text-warning flex items-center gap-1">
                      <Coins className="h-3 w-3" /> {m.bet_amount} Coins
                    </span>
                    {m.status === "playing" && (
                      <Button onClick={() => handleOpenMatch(m)} className="w-full gradient-primary border-0" size="sm">
                        Continuar Partida
                      </Button>
                    )}
                    {m.status === "waiting" && (
                      <Button variant="outline" size="sm" className="w-full" onClick={async () => {
                        await supabase.from("game_matches").update({ status: "cancelled" }).eq("id", m.id);
                        // Refund
                        await creditCoins(user!.id, m.bet_amount, "game_entry", `Reembolso - partida cancelada`);
                        await refreshWallet();
                        fetchMatches();
                        toast({ title: "Desafio cancelado e coins reembolsados" });
                      }}>
                        Cancelar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Match Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Criar Desafio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jogo</label>
              <Select value={gameType} onValueChange={setGameType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tic_tac_toe">❌ Jogo da Velha</SelectItem>
                  <SelectItem value="checkers">🔴 Jogo de Dama</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor do Desafio (Coins)</label>
              <Input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} min="1" />
              <p className="text-xs text-muted-foreground">Seu saldo: {totalBalance.toFixed(0)} Coins</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
              <p>• Ambos os jogadores colocam o mesmo valor</p>
              <p>• Vencedor recebe o prêmio menos 10% de taxa</p>
              <p>• Abandono = derrota automática</p>
            </div>
            <Button onClick={handleCreate} className="w-full gradient-primary border-0">
              <Trophy className="h-4 w-4 mr-2" /> Criar Desafio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function createInitialCheckersBoard() {
  const board: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) board[r][c] = "black";
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) board[r][c] = "red";
    }
  }
  return board;
}

async function debitCoins(userId: string, amount: number, type: string, description: string) {
  // Prefer earnings first, then subscription
  const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", userId).single();
  if (!wallet) return;

  let fromEarnings = Math.min(wallet.earnings_balance, amount);
  let fromSub = amount - fromEarnings;

  await supabase.from("wallets").update({
    earnings_balance: wallet.earnings_balance - fromEarnings,
    subscription_balance: wallet.subscription_balance - fromSub,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);

  await supabase.from("coin_transactions").insert({
    user_id: userId, type, amount: -amount, balance_type: fromEarnings > 0 ? "earnings" : "subscription", description,
  });
}

async function creditCoins(userId: string, amount: number, type: string, description: string) {
  const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", userId).single();
  if (!wallet) {
    await supabase.from("wallets").insert({ user_id: userId, earnings_balance: amount });
  } else {
    await supabase.from("wallets").update({
      earnings_balance: wallet.earnings_balance + amount,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);
  }

  await supabase.from("coin_transactions").insert({
    user_id: userId, type, amount, balance_type: "earnings", description,
  });
}
