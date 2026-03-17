import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getBotCheckersMove } from "@/lib/botAI";

interface CheckersGameProps {
  match: any;
  userId: string;
  onEnd: () => void;
}

type Piece = string | null;

export default function CheckersGame({ match, userId, onEnd }: CheckersGameProps) {
  const [gameState, setGameState] = useState<any>(match.game_state);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [forcedPiece, setForcedPiece] = useState<[number, number] | null>(null); // locked during chain capture
  const [chatMsg, setChatMsg] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>(match.chat_messages || []);
  const { toast } = useToast();
  const botThinking = useRef(false);

  const isBot = gameState.isBot === true;
  const isPlayer1 = match.player1_id === userId;
  const myColor = isPlayer1 ? "red" : "black";
  const botColor = myColor === "red" ? "black" : "red";
  const isMyTurn = gameState.currentPlayer === myColor;
  const board: Piece[][] = gameState.board || [];

  // Poll for updates (PvP only)
  useEffect(() => {
    if (isBot) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from("game_matches").select("game_state, status, winner_id, chat_messages").eq("id", match.id).single();
      if (data) {
        setGameState(data.game_state);
        setChatMessages((data.chat_messages as any[]) || []);
        if (data.status === "finished") {
          const won = data.winner_id === userId;
          toast({ title: won ? "🏆 Você venceu!" : "Você perdeu!" });
          onEnd();
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [match.id, userId, onEnd, toast, isBot]);

  // Bot auto-play
  useEffect(() => {
    if (!isBot || isMyTurn || botThinking.current) return;

    botThinking.current = true;
    const timer = setTimeout(async () => {
      const move = getBotCheckersMove(board, botColor);
      if (!move) {
        // Bot has no moves - player wins
        await finishBotGame("player_wins");
        botThinking.current = false;
        return;
      }

      const newBoard = board.map(r => [...r]);
      const piece = newBoard[move.from[0]][move.from[1]];
      newBoard[move.to[0]][move.to[1]] = piece;
      newBoard[move.from[0]][move.from[1]] = null;

      // Capture: walk diagonal to find captured piece
      const dr = Math.sign(move.to[0] - move.from[0]);
      const dc = Math.sign(move.to[1] - move.from[1]);
      const distance = Math.abs(move.to[0] - move.from[0]);
      let isCapture = false;
      for (let step = 1; step < distance; step++) {
        const mr = move.from[0] + dr * step;
        const mc = move.from[1] + dc * step;
        if (newBoard[mr][mc] !== null) {
          newBoard[mr][mc] = null;
          isCapture = true;
          break;
        }
      }

      // Promotion
      if (piece === "red" && move.to[0] === 0) newBoard[move.to[0]][move.to[1]] = "red-king";
      if (piece === "black" && move.to[0] === 7) newBoard[move.to[0]][move.to[1]] = "black-king";

      let canContinue = false;
      if (isCapture) {
        const { captures } = getValidMoves(move.to[0], move.to[1], newBoard);
        canContinue = captures.length > 0;
      }

      const nextPlayer = canContinue ? botColor : myColor;

      // Check win
      const playerPieces = newBoard.flat().filter(p => p?.startsWith(myColor)).length;
      if (playerPieces === 0 || (!canContinue && !checkHasMoves(newBoard, myColor))) {
        const newState = { board: newBoard, currentPlayer: nextPlayer, isBot: true };
        await finishBotGame("bot_wins", newState);
        botThinking.current = false;
        return;
      }

      const newState = { board: newBoard, currentPlayer: nextPlayer, isBot: true };
      await supabase.from("game_matches").update({ game_state: newState }).eq("id", match.id);
      setGameState(newState);
      botThinking.current = false;

      // If bot can continue capturing, trigger another move
      if (canContinue) {
        botThinking.current = false; // Will re-trigger the effect
      }
    }, 1000 + Math.random() * 800);

    return () => clearTimeout(timer);
  }, [gameState, isBot, isMyTurn]);

  const finishBotGame = async (result: "player_wins" | "bot_wins" | "draw", newState?: any) => {
    const state = newState || gameState;
    if (result === "player_wins") {
      const fee = match.bet_amount * 2 * 0.1;
      const prize = match.bet_amount * 2 - fee;
      await supabase.from("game_matches").update({
        game_state: state, status: "finished", winner_id: userId,
        platform_fee: fee, finished_at: new Date().toISOString(),
      }).eq("id", match.id);
      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", userId).single();
      if (wallet) {
        await supabase.from("wallets").update({
          earnings_balance: wallet.earnings_balance + prize, updated_at: new Date().toISOString(),
        }).eq("user_id", userId);
      }
      await supabase.from("coin_transactions").insert({
        user_id: userId, type: "game_win", amount: prize, balance_type: "earnings",
        description: `Vitória vs Bot - Dama (${match.bet_amount} coins)`, reference_id: match.id,
      });
      toast({ title: "🏆 Você venceu contra o Bot!" });
    } else if (result === "bot_wins") {
      await supabase.from("game_matches").update({
        game_state: state, status: "finished", winner_id: null,
        finished_at: new Date().toISOString(),
      }).eq("id", match.id);
      toast({ title: "🤖 O Bot venceu! Tente novamente." });
    }
    onEnd();
  };

  const isOwnPiece = (piece: Piece) => piece?.startsWith(myColor);
  const isOpponent = (piece: Piece) => piece !== null && !piece.startsWith(myColor);
  const isKing = (piece: Piece) => piece?.endsWith("-king");

  const getValidMoves = useCallback((row: number, col: number, b: Piece[][]): { moves: [number, number][]; captures: [number, number][] } => {
    const piece = b[row][col];
    if (!piece) return { moves: [], captures: [] };

    const pieceIsKing = piece.endsWith("-king");
    const directions: [number, number][] = [];
    if (piece.startsWith("red") || pieceIsKing) directions.push([-1, -1], [-1, 1]);
    if (piece.startsWith("black") || pieceIsKing) directions.push([1, -1], [1, 1]);

    const moves: [number, number][] = [];
    const captures: [number, number][] = [];

    for (const [dr, dc] of directions) {
      if (pieceIsKing) {
        // King moves multiple squares like a bishop
        let nr = row + dr;
        let nc = col + dc;
        let foundOpponent: [number, number] | null = null;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (b[nr][nc] === null) {
            if (foundOpponent) {
              captures.push([nr, nc]);
            } else {
              moves.push([nr, nc]);
            }
          } else if (isOpponent(b[nr][nc]) && !foundOpponent) {
            foundOpponent = [nr, nc];
          } else {
            break; // blocked by own piece or second opponent
          }
          nr += dr;
          nc += dc;
        }
      } else {
        // Normal piece moves 1 square
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (b[nr][nc] === null) {
            moves.push([nr, nc]);
          } else if (isOpponent(b[nr][nc])) {
            const jr = nr + dr;
            const jc = nc + dc;
            if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && b[jr][jc] === null) {
              captures.push([jr, jc]);
            }
          }
        }
      }
    }

    return { moves, captures };
  }, [myColor]);

  const hasAnyCapture = useCallback((b: Piece[][], color: string) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (b[r][c]?.startsWith(color)) {
          const { captures } = getValidMoves(r, c, b);
          if (captures.length > 0) return true;
        }
      }
    }
    return false;
  }, [getValidMoves]);

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn) return;

    const piece = board[row][col];

    if (selectedCell) {
      const isValidMove = possibleMoves.some(([mr, mc]) => mr === row && mc === col);
      if (isValidMove) {
        const [sr, sc] = selectedCell;
        makeMove(sr, sc, row, col);
        return;
      }
    }

    // If forced to continue chain capture, can't select another piece
    if (forcedPiece) return;

    if (isOwnPiece(piece)) {
      setSelectedCell([row, col]);
      const { moves, captures } = getValidMoves(row, col, board);
      const mustCapture = hasAnyCapture(board, myColor);
      setPossibleMoves(mustCapture ? captures : (captures.length > 0 ? captures : moves));
    } else {
      setSelectedCell(null);
      setPossibleMoves([]);
    }
  };

  const makeMove = async (fromR: number, fromC: number, toR: number, toC: number) => {
    const newBoard = board.map(r => [...r]);
    const piece = newBoard[fromR][fromC];
    newBoard[toR][toC] = piece;
    newBoard[fromR][fromC] = null;

    const dr = Math.sign(toR - fromR);
    const dc = Math.sign(toC - fromC);
    const distance = Math.abs(toR - fromR);
    // Remove captured piece (walk along diagonal to find it)
    let isCapture = false;
    for (let step = 1; step < distance; step++) {
      const mr = fromR + dr * step;
      const mc = fromC + dc * step;
      if (newBoard[mr][mc] && !newBoard[mr][mc]!.startsWith(myColor)) {
        newBoard[mr][mc] = null;
        isCapture = true;
        break;
      }
    }

    if (piece === "red" && toR === 0) newBoard[toR][toC] = "red-king";
    if (piece === "black" && toR === 7) newBoard[toR][toC] = "black-king";

    let canContinue = false;
    if (isCapture) {
      const { captures } = getValidMoves(toR, toC, newBoard);
      canContinue = captures.length > 0;
    }

    const opponent = myColor === "red" ? "black" : "red";
    const nextPlayer = canContinue ? myColor : opponent;

    const opponentPieces = newBoard.flat().filter(p => p?.startsWith(opponent)).length;
    const opponentHasMoves = !canContinue && checkHasMoves(newBoard, opponent);

    if (opponentPieces === 0 || !opponentHasMoves) {
      if (isBot) {
        const newState = { board: newBoard, currentPlayer: nextPlayer, isBot: true };
        await finishBotGame("player_wins", newState);
      } else {
        // PvP win logic
        const totalPot = match.bet_amount * 2;
        const fee = totalPot * 0.1;
        const prize = totalPot - fee;
        await supabase.from("game_matches").update({
          game_state: { board: newBoard, currentPlayer: nextPlayer },
          status: "finished", winner_id: userId, platform_fee: fee,
          finished_at: new Date().toISOString(),
        }).eq("id", match.id);
        const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", userId).single();
        if (wallet) {
          await supabase.from("wallets").update({
            earnings_balance: wallet.earnings_balance + prize, updated_at: new Date().toISOString(),
          }).eq("user_id", userId);
        }
        await supabase.from("coin_transactions").insert({
          user_id: userId, type: "game_win", amount: prize, balance_type: "earnings",
          description: `Vitória - Dama (${match.bet_amount} coins)`, reference_id: match.id,
        });
        toast({ title: "🏆 Você venceu!" });
        onEnd();
      }
    } else {
      const newState = { board: newBoard, currentPlayer: nextPlayer, ...(isBot ? { isBot: true } : {}) };
      await supabase.from("game_matches").update({ game_state: newState }).eq("id", match.id);
      setGameState(newState);
    }

    setSelectedCell(canContinue ? [toR, toC] : null);
    setPossibleMoves(canContinue ? getValidMoves(toR, toC, newBoard).captures : []);
  };

  function checkHasMoves(b: Piece[][], color: string) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (b[r][c]?.startsWith(color)) {
          const { moves, captures } = getValidMoves(r, c, b);
          if (moves.length > 0 || captures.length > 0) return true;
        }
      }
    }
    return false;
  }

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

  const getPieceDisplay = (piece: Piece) => {
    if (!piece) return null;
    const isK = piece.endsWith("-king");
    const isRed = piece.startsWith("red");
    return (
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
        isRed ? "bg-destructive text-destructive-foreground" : "bg-foreground text-background"
      } ${isK ? "ring-2 ring-warning" : ""}`}>
        {isK ? "♛" : "●"}
      </div>
    );
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
          Você é <strong className={myColor === "red" ? "text-destructive" : ""}>{myColor === "red" ? "Vermelho" : "Preto"}</strong>
          {" · "}{isMyTurn ? "Sua vez!" : isBot ? "Bot pensando..." : "Vez do oponente..."}
        </p>
        <Badge variant="outline" className="mt-1">{isBot ? match.bet_amount : match.bet_amount * 2} Coins em jogo</Badge>
      </div>

      {/* Board */}
      <div className="mx-auto w-fit">
        <div className="grid grid-cols-8 gap-0 border-2 border-foreground/20 rounded-lg overflow-hidden">
          {board.map((row: Piece[], r: number) =>
            row.map((cell: Piece, c: number) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isPossible = possibleMoves.some(([mr, mc]) => mr === r && mc === c);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => isDark && handleCellClick(r, c)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all ${
                    isDark ? "bg-amber-800/70 dark:bg-amber-900/60" : "bg-amber-100 dark:bg-amber-200/20"
                  } ${isSelected ? "ring-2 ring-inset ring-primary" : ""} ${
                    isPossible ? "ring-2 ring-inset ring-success bg-success/20" : ""
                  } ${isDark && isMyTurn ? "cursor-pointer hover:brightness-110" : ""}`}
                >
                  {getPieceDisplay(cell)}
                  {isPossible && !cell && <div className="w-3 h-3 rounded-full bg-success/60" />}
                </button>
              );
            })
          )}
        </div>
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
