
-- Fix permissive INSERT on promo_logs - restrict to authenticated users with their own user_id
DROP POLICY "Authenticated can insert promo logs" ON public.promo_logs;
CREATE POLICY "Authenticated can insert promo logs" ON public.promo_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = granted_by);
