import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Coins, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RankingPlayer {
  player_id: string;
  player_name: string;
  avatar_url: string | null;
  wins: number;
  losses: number;
  draws: number;
  total_games: number;
  coins_earned: number;
}

export default function ArenaRanking() {
  const [ranking, setRanking] = useState<RankingPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase.rpc("get_arena_ranking");
      if (!error && data) {
        setRanking(data as RankingPlayer[]);
      }
      setLoading(false);
    };
    fetchRanking();
  }, []);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{index + 1}</span>;
  };

  const getWinRate = (wins: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (ranking.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma partida finalizada ainda.</p>
          <p className="text-sm">Jogue desafios para aparecer no ranking!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="font-display flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-warning" />
          Ranking da Arena
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {ranking.map((player, index) => {
            const winRate = getWinRate(player.wins, player.total_games);
            return (
              <div
                key={player.player_id}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  index === 0 ? "bg-yellow-500/5" : index === 1 ? "bg-gray-400/5" : index === 2 ? "bg-amber-700/5" : ""
                }`}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index)}
                </div>

                <Avatar className="h-9 w-9">
                  <AvatarImage src={player.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {player.player_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{player.player_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5 text-success">
                      <TrendingUp className="h-3 w-3" /> {player.wins}
                    </span>
                    <span className="flex items-center gap-0.5 text-destructive">
                      <TrendingDown className="h-3 w-3" /> {player.losses}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Minus className="h-3 w-3" /> {player.draws}
                    </span>
                    <span className="text-muted-foreground/60">·</span>
                    <span>{winRate}% vitória</span>
                  </div>
                </div>

                <Badge variant="outline" className="shrink-0 gap-1 text-warning border-warning/30">
                  <Coins className="h-3 w-3" />
                  {player.coins_earned.toFixed(0)}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
