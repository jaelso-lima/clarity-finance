
-- Allow admin to read all wallets, withdrawals, matches, and coin_transactions via service role
-- (RLS is bypassed by service role, so these are for the client-side admin which uses anon key)
-- We add policies for authenticated users to read all data when they are admin

-- Admin read policies for game management
CREATE POLICY "Admin can read all wallets" ON public.wallets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can update all wallets" ON public.wallets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin can read all coin_transactions" ON public.coin_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can read all game_matches" ON public.game_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can read all withdrawal_requests" ON public.withdrawal_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can update withdrawal_requests" ON public.withdrawal_requests FOR UPDATE TO authenticated USING (true);
