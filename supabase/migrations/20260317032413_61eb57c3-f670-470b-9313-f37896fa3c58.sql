
-- Wallets: each user has subscription_balance and earnings_balance
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  subscription_balance numeric NOT NULL DEFAULT 0,
  earnings_balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON public.wallets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Coin transactions log
CREATE TABLE public.coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL, -- 'subscription_credit', 'game_entry', 'game_win', 'purchase', 'withdrawal', 'admin_adjust'
  amount numeric NOT NULL,
  balance_type text NOT NULL DEFAULT 'earnings', -- 'subscription' or 'earnings'
  description text,
  reference_id uuid, -- links to game_matches or withdrawal_requests
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions" ON public.coin_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.coin_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Game matches
CREATE TABLE public.game_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type text NOT NULL, -- 'tic_tac_toe', 'checkers'
  player1_id uuid NOT NULL,
  player2_id uuid,
  bet_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'waiting', -- 'waiting', 'playing', 'finished', 'cancelled', 'abandoned'
  winner_id uuid,
  game_state jsonb NOT NULL DEFAULT '{}',
  platform_fee numeric NOT NULL DEFAULT 0,
  chat_messages jsonb NOT NULL DEFAULT '[]',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.game_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read matches they participate in" ON public.game_matches FOR SELECT TO authenticated USING (auth.uid() = player1_id OR auth.uid() = player2_id);
CREATE POLICY "Authenticated can create matches" ON public.game_matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = player1_id);
CREATE POLICY "Players can update their matches" ON public.game_matches FOR UPDATE TO authenticated USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Also allow reading waiting matches (lobby)
CREATE POLICY "Anyone can see waiting matches" ON public.game_matches FOR SELECT TO authenticated USING (status = 'waiting');

-- Withdrawal requests
CREATE TABLE public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  pix_key text NOT NULL,
  pix_type text NOT NULL DEFAULT 'cpf', -- 'cpf', 'email', 'phone', 'random'
  bank_name text,
  holder_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own withdrawals" ON public.withdrawal_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create withdrawals" ON public.withdrawal_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
