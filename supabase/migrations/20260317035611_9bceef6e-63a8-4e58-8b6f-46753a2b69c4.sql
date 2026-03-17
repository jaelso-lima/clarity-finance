
CREATE OR REPLACE FUNCTION public.get_arena_ranking()
RETURNS TABLE (
  player_id uuid,
  player_name text,
  avatar_url text,
  wins bigint,
  losses bigint,
  draws bigint,
  total_games bigint,
  coins_earned numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH player_stats AS (
    SELECT 
      p.id AS player_id,
      COALESCE(p.full_name, 'Jogador') AS player_name,
      p.avatar_url,
      COUNT(CASE WHEN gm.winner_id = p.id THEN 1 END) AS wins,
      COUNT(CASE WHEN gm.status = 'finished' AND gm.winner_id IS NOT NULL AND gm.winner_id != p.id THEN 1 END) AS losses,
      COUNT(CASE WHEN gm.status = 'finished' AND gm.winner_id IS NULL THEN 1 END) AS draws,
      COUNT(gm.id) AS total_games,
      COALESCE(SUM(CASE WHEN gm.winner_id = p.id THEN (gm.bet_amount * 2 - gm.platform_fee) ELSE 0 END), 0) AS coins_earned
    FROM profiles p
    JOIN game_matches gm ON (gm.player1_id = p.id OR gm.player2_id = p.id)
    WHERE gm.status = 'finished'
    GROUP BY p.id, p.full_name, p.avatar_url
    HAVING COUNT(gm.id) > 0
  )
  SELECT * FROM player_stats
  ORDER BY wins DESC, coins_earned DESC
  LIMIT 50;
$$;
