import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getBotTicTacToeMove } from "@/lib/botAI";

interface TicTacToeGameProps {
  match: any;
  userId: string;
  onEnd: () => void;
}

export default function TicTacToeGame({ match, userId, onEnd }: TicTacToeGameProps) {
  const [gameState, setGameState] = useState(match.game_state);
  const [chatMsg, setChatMsg] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>(match.chat_messages || []);
  const { toast } = useToast();
  const botThinking = useRef(false);

  const isBot = gameState.isBot === true;
  const isPlayer1 = match.player1_id === userId;
  const mySymbol = isPlayer1 ? "X" : "O";
  const botSymbol = mySymbol === "X" ? "O" : "X";
  const isMyTurn = gameState.currentPlayer === mySymbol;
  const board: (string | null)[] = gameState.board || Array(9).fill(null);

  // Poll for updates (only for non-bot games)
  useEffect(() => {
    if (isBot) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from("game_matches").select("game_state, status, winner_id, chat_messages").eq("id", match.id).single();
      if (data) {
        setGameState(data.game_state);
        setChatMessages((data.chat_messages as any[]) || []);
        if (data.status === "finished") {
          const won = data.winner_id === userId;
          toast({ title: won ? "🏆 Você venceu!" : data.winner_id ? "Você perdeu!" : "Empate!" });
          onEnd();
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [match.id, userId, onEnd, toast, isBot]);

  // Bot auto-play
  useEffect(() => {
    if (!isBot || isMyTurn || gameState.winner || botThinking.current) return;

    botThinking.current = true;
    const timer = setTimeout(async () => {
      const moveIndex = getBotTicTacToeMove(board, botSymbol);
      if (moveIndex === -1) { botThinking.current = false; return; }

      const newBoard = [...board];
      newBoard[moveIndex] = botSymbol;
      const winner = checkWinner(newBoard);
      const nextPlayer = mySymbol;

      const newState = { board: newBoard, currentPlayer: nextPlayer, winner, isBot: true };

      if (winner) {
        await finishGame(newState, winner === "draw" ? null : winner === botSymbol ? "bot" : userId);
      } else {
        await supabase.from("game_matches").update({ game_state: newState }).eq("id", match.id);
        setGameState(newState);
      }
      botThinking.current = false;
    }, 800 + Math.random() * 700); // Simulate thinking

    return () => clearTimeout(timer);
  }, [gameState, isBot, isMyTurn]);

  const checkWinner = (b: (string | null)[]) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, bb, c] of lines) {
      if (b[a] && b[a] === b[bb] && b[a] === b[c]) return b[a];
    }
    return b.every(Boolean) ? "draw" : null;
  };

  const finishGame = async (newState: any, winner: string | null) => {
    const winnerId = winner === "bot" ? null : winner === "draw" ? null : userId;
    const totalPot = match.bet_amount * 2;

    if (isBot) {
      // Bot game: if player wins, credit prize; if bot wins, player loses
      if (winner === mySymbol) {
        // Player wins vs bot - credit earnings (minus fee)
        const fee = totalPot * 0.1;
        const prize = match.bet_amount * 2 - fee; // total pot minus fee
        await supabase.from("game_matches").update({
          game_state: newState, status: "finished", winner_id: userId,
          platform_fee: fee, finished_at: new Date().toISOString(),
        }).eq("id", match.id);

        const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", userId).single();
        if (wallet) {
          await supabase.from("wallets").update({
            earnings_balance: wallet.earnings_balance + prize,
            updated_at: new Date().toISOString(),
          }).eq("user_id", userId);
        }
        await supabase.from("coin_transactions").insert({
          user_id: userId, type: "game_win", amount: prize, balance_type: "earnings",
          description: `Vitória vs Bot - Jogo da Velha (${match.bet_amount} coins)`, reference_id: match.id,
        });
        toast({ title: "🏆 Você venceu contra o Bot!" });
      } else if (winner === "draw") {
        // Refund player
        const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", userId).single();
        if (wallet) {
          await supabase.from("wallets").update({
            earnings_balance: wallet.earnings_balance + match.bet_amount,
            updated_at: new Date().toISOString(),
          }).eq("user_id", userId);
        }
        await supabase.from("coin_transactions").insert({
          user_id: userId, type: "game_refund", amount: match.bet_amount, balance_type: "earnings",
          description: `Empate vs Bot - reembolso`, reference_id: match.id,
        });
        await supabase.from("game_matches").update({
          game_state: newState, status: "finished", winner_id: null,
          finished_at: new Date().toISOString(),
        }).eq("id", match.id);
        toast({ title: "Empate! Coins reembolsados." });
      } else {
        // Bot wins - player loses entry
        await supabase.from("game_matches").update({
          game_state: newState, status: "finished", winner_id: null,
          finished_at: new Date().toISOString(),
        }).eq("id", match.id);
        toast({ title: "🤖 O Bot venceu! Tente novamente." });
      }
      onEnd();
      return;
    }

    // Normal PvP logic
    const fee = winnerId ? totalPot * 0.1 : 0;
    const prize = totalPot - fee;
    await supabase.from("game_matches").update({
      game_state: newState, status: "finished", winner_id: winnerId,
      platform_fee: fee, finished_at: new Date().toISOString(),
    }).eq("id", match.id);

    if (winnerId) {
      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", winnerId).single();
      if (wallet) {
        await supabase.from("wallets").update({
          earnings_balance: wallet.earnings_balance + prize,
          updated_at: new Date().toISOString(),
        }).eq("user_id", winnerId);
      }
      await supabase.from("coin_transactions").insert({
        user_id: winnerId, type: "game_win", amount: prize, balance_type: "earnings",
        description: `Vitória - Jogo da Velha (${match.bet_amount} coins)`, reference_id: match.id,
      });
    } else {
      for (const pid of [match.player1_id, match.player2_id]) {
        const { data: w } = await supabase.from("wallets").select("*").eq("user_id", pid).single();
        if (w) {
          await supabase.from("wallets").update({
            earnings_balance: w.earnings_balance + match.bet_amount,
            updated_at: new Date().toISOString(),
          }).eq("user_id", pid);
        }
        await supabase.from("coin_transactions").insert({
          user_id: pid, type: "game_win", amount: match.bet_amount, balance_type: "earnings",
          description: `Empate - reembolso`, reference_id: match.id,
        });
      }
    }
    toast({ title: winnerId ? "🏆 Você venceu!" : "Empate!" });
    onEnd();
  };

  const handleMove = async (index: number) => {
    if (!isMyTurn || board[index] || gameState.winner) return;

    const newBoard = [...board];
    newBoard[index] = mySymbol;
    const winner = checkWinner(newBoard);
    const nextPlayer = mySymbol === "X" ? "O" : "X";

    const newState = { board: newBoard, currentPlayer: nextPlayer, winner, ...(isBot ? { isBot: true } : {}) };

    if (winner) {
      await finishGame(newState, winner === "draw" ? "draw" : mySymbol);
    } else {
      await supabase.from("game_matches").update({ game_state: newState }).eq("id", match.id);
      setGameState(newState);
    }
  };

  const handleChat = async () => {
    if (!chatMsg.trim() || chatMsg.length > 100) return;
    if (chatMsg.includes("http") || chatMsg.includes("www.")) {
      toast({ title: "Links não são permitidos", variant: "destructive" });
      return;
    }
    const newMessages = [...chatMessages, { userId, text: chatMsg.trim(), time: Date.now() }];
    await supabase.from("game_matches").update({ chat_messages: newMessages }).eq("id", match.id);
    setChatMessages(newMessages);
    setChatMsg("");
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        {isBot && (
          <Badge className="mb-2 bg-warning/20 text-warning border-warning/30">
            <Bot className="h-3 w-3 mr-1" /> vs Bot Especialista
          </Badge>
        )}
        <p className="text-sm text-muted-foreground">
          Você é <strong>{mySymbol}</strong> · {isMyTurn ? "Sua vez!" : isBot ? "Bot pensando..." : "Vez do oponente..."}
        </p>
        <Badge variant="outline" className="mt-1">{isBot ? match.bet_amount : match.bet_amount * 2} Coins em jogo</Badge>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 max-w-[280px] mx-auto">
        {board.map((cell: string | null, i: number) => (
          <button
            key={i}
            onClick={() => handleMove(i)}
            disabled={!isMyTurn || !!cell}
            className={`h-20 w-full rounded-lg border-2 text-3xl font-bold transition-all ${
              cell === "X" ? "border-primary bg-primary/10 text-primary" :
              cell === "O" ? "border-destructive bg-destructive/10 text-destructive" :
              isMyTurn ? "border-border hover:border-primary/50 hover:bg-accent cursor-pointer" :
              "border-border opacity-60"
            }`}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Chat - hidden for bot games */}
      {!isBot && (
        <div className="border rounded-lg">
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Chat da partida</span>
          </div>
          <div className="max-h-32 overflow-y-auto p-3 space-y-1">
            {chatMessages.map((msg: any, i: number) => (
              <div key={i} className={`text-xs ${msg.userId === userId ? "text-right text-primary" : "text-left text-muted-foreground"}`}>
                <span className="inline-block rounded-lg bg-muted/50 px-2 py-1">{msg.text}</span>
              </div>
            ))}
            {chatMessages.length === 0 && <p className="text-xs text-center text-muted-foreground">Sem mensagens</p>}
          </div>
          <div className="flex gap-2 p-2 border-t">
            <Input
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder="Mensagem curta..."
              maxLength={100}
              className="text-xs h-8"
              onKeyDown={(e) => e.key === "Enter" && handleChat()}
            />
            <Button size="sm" variant="ghost" onClick={handleChat} className="h-8 w-8 p-0">
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
