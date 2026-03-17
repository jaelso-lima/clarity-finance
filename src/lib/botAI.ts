// Bot AI for Tic-Tac-Toe (Minimax) and Checkers (smart heuristic)

const BOT_USER_ID = "bot-ai-specialist";

// ==================== TIC-TAC-TOE AI ====================

function tttCheckWinner(b: (string | null)[]): string | null {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a, bb, c] of lines) {
    if (b[a] && b[a] === b[bb] && b[a] === b[c]) return b[a];
  }
  return b.every(Boolean) ? "draw" : null;
}

function minimax(board: (string | null)[], isMax: boolean, botSymbol: string, depth = 0): number {
  const opponent = botSymbol === "X" ? "O" : "X";
  const winner = tttCheckWinner(board);
  if (winner === botSymbol) return 10 - depth;
  if (winner === opponent) return depth - 10;
  if (winner === "draw") return 0;

  const scores: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] !== null) continue;
    const newBoard = [...board];
    newBoard[i] = isMax ? botSymbol : opponent;
    scores.push(minimax(newBoard, !isMax, botSymbol, depth + 1));
  }
  return isMax ? Math.max(...scores) : Math.min(...scores);
}

export function getBotTicTacToeMove(board: (string | null)[], botSymbol: string): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  const opponent = botSymbol === "X" ? "O" : "X";

  for (let i = 0; i < 9; i++) {
    if (board[i] !== null) continue;
    const newBoard = [...board];
    newBoard[i] = botSymbol;
    const score = minimax(newBoard, false, botSymbol, 0);
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }
  return bestMove;
}

// ==================== CHECKERS AI ====================

type Piece = string | null;

function getValidMovesForPiece(row: number, col: number, board: Piece[][], color: string): { moves: [number, number][]; captures: [number, number][] } {
  const piece = board[row][col];
  if (!piece) return { moves: [], captures: [] };

  const isKing = piece.endsWith("-king");
  const directions: [number, number][] = [];
  if (piece.startsWith("red") || isKing) directions.push([-1, -1], [-1, 1]);
  if (piece.startsWith("black") || isKing) directions.push([1, -1], [1, 1]);

  const moves: [number, number][] = [];
  const captures: [number, number][] = [];

  for (const [dr, dc] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) continue;

    if (board[nr][nc] === null) {
      moves.push([nr, nc]);
    } else if (!board[nr][nc]!.startsWith(color)) {
      const jr = nr + dr;
      const jc = nc + dc;
      if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8 && board[jr][jc] === null) {
        captures.push([jr, jc]);
      }
    }
  }

  return { moves, captures };
}

function getAllMoves(board: Piece[][], color: string): { from: [number, number]; to: [number, number]; isCapture: boolean }[] {
  const allMoves: { from: [number, number]; to: [number, number]; isCapture: boolean }[] = [];
  let hasCapture = false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (!board[r][c]?.startsWith(color)) continue;
      const { moves, captures } = getValidMovesForPiece(r, c, board, color);
      if (captures.length > 0) hasCapture = true;
      for (const [tr, tc] of captures) {
        allMoves.push({ from: [r, c], to: [tr, tc], isCapture: true });
      }
      for (const [tr, tc] of moves) {
        allMoves.push({ from: [r, c], to: [tr, tc], isCapture: false });
      }
    }
  }

  // Mandatory capture
  if (hasCapture) return allMoves.filter(m => m.isCapture);
  return allMoves;
}

function evaluateBoard(board: Piece[][], botColor: string): number {
  const opponent = botColor === "red" ? "black" : "red";
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      if (p.startsWith(botColor)) {
        score += p.endsWith("-king") ? 5 : 3;
        // Positional bonus: center control
        if (c >= 2 && c <= 5 && r >= 2 && r <= 5) score += 1;
        // Advance bonus
        if (botColor === "red") score += (7 - r) * 0.3;
        else score += r * 0.3;
      } else if (p.startsWith(opponent)) {
        score -= p.endsWith("-king") ? 5 : 3;
        if (c >= 2 && c <= 5 && r >= 2 && r <= 5) score -= 1;
      }
    }
  }
  return score;
}

function simulateMove(board: Piece[][], from: [number, number], to: [number, number]): Piece[][] {
  const newBoard = board.map(r => [...r]);
  const piece = newBoard[from[0]][from[1]];
  newBoard[to[0]][to[1]] = piece;
  newBoard[from[0]][from[1]] = null;

  // Capture
  if (Math.abs(to[0] - from[0]) === 2) {
    const dr = Math.sign(to[0] - from[0]);
    const dc = Math.sign(to[1] - from[1]);
    newBoard[from[0] + dr][from[1] + dc] = null;
  }

  // Promotion
  if (piece === "red" && to[0] === 0) newBoard[to[0]][to[1]] = "red-king";
  if (piece === "black" && to[0] === 7) newBoard[to[0]][to[1]] = "black-king";

  return newBoard;
}

export function getBotCheckersMove(board: Piece[][], botColor: string): { from: [number, number]; to: [number, number] } | null {
  const moves = getAllMoves(board, botColor);
  if (moves.length === 0) return null;

  // Evaluate each move and pick the best
  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    const newBoard = simulateMove(board, move.from, move.to);
    let score = evaluateBoard(newBoard, botColor);

    // Bonus for captures
    if (move.isCapture) score += 3;

    // Look one step ahead for opponent
    const opponent = botColor === "red" ? "black" : "red";
    const oppMoves = getAllMoves(newBoard, opponent);
    if (oppMoves.length > 0) {
      let worstOpp = Infinity;
      for (const om of oppMoves.slice(0, 5)) { // limit search
        const afterOpp = simulateMove(newBoard, om.from, om.to);
        const oppScore = evaluateBoard(afterOpp, botColor);
        worstOpp = Math.min(worstOpp, oppScore);
      }
      score = (score + worstOpp) / 2;
    }

    // Add slight randomness to avoid predictability
    score += Math.random() * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export { BOT_USER_ID };
