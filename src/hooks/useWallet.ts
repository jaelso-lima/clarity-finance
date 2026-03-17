import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const FREE_WELCOME_COINS = 5;

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<{ subscription_balance: number; earnings_balance: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWallet = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("wallets").select("subscription_balance, earnings_balance").eq("user_id", user.id).single();
    if (data) {
      // Check if welcome bonus was already given
      if (data.subscription_balance === 0 && data.earnings_balance === 0) {
        const { data: bonusTx } = await supabase.from("coin_transactions")
          .select("id")
          .eq("user_id", user.id)
          .eq("type", "subscription_credit")
          .eq("description", "Bônus de boas-vindas — 5 Coins grátis")
          .limit(1);
        if (!bonusTx || bonusTx.length === 0) {
          // Credit welcome bonus to existing wallet
          await supabase.from("wallets").update({
            subscription_balance: FREE_WELCOME_COINS,
            updated_at: new Date().toISOString(),
          }).eq("user_id", user.id);
          await supabase.from("coin_transactions").insert({
            user_id: user.id,
            type: "subscription_credit",
            amount: FREE_WELCOME_COINS,
            balance_type: "subscription",
            description: "Bônus de boas-vindas — 5 Coins grátis",
          });
          setWallet({ subscription_balance: FREE_WELCOME_COINS, earnings_balance: 0 });
          setLoading(false);
          return;
        }
      }
      setWallet(data);
    } else {
      // Create wallet with 5 free subscription coins (non-withdrawable)
      const newWallet = { user_id: user.id, subscription_balance: FREE_WELCOME_COINS, earnings_balance: 0 };
      await supabase.from("wallets").insert(newWallet);
      await supabase.from("coin_transactions").insert({
        user_id: user.id,
        type: "subscription_credit",
        amount: FREE_WELCOME_COINS,
        balance_type: "subscription",
        description: "Bônus de boas-vindas — 5 Coins grátis",
      });
      setWallet({ subscription_balance: FREE_WELCOME_COINS, earnings_balance: 0 });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  return { wallet, loading, refreshWallet };
}
