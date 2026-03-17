import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<{ subscription_balance: number; earnings_balance: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWallet = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("wallets").select("subscription_balance, earnings_balance").eq("user_id", user.id).single();
    if (data) {
      setWallet(data);
    } else {
      // Create wallet if not exists
      await supabase.from("wallets").insert({ user_id: user.id, subscription_balance: 0, earnings_balance: 0 });
      setWallet({ subscription_balance: 0, earnings_balance: 0 });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  return { wallet, loading, refreshWallet };
}
