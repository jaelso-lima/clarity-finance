import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PRO_MONTHLY_COINS = 19;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Reset ALL subscription_balance to 0 (monthly expiry)
    const { data: wallets } = await supabase
      .from("wallets")
      .select("id, user_id, subscription_balance")
      .gt("subscription_balance", 0);

    let expired = 0;
    let credited = 0;

    if (wallets && wallets.length > 0) {
      for (const w of wallets) {
        await supabase
          .from("wallets")
          .update({ subscription_balance: 0, updated_at: new Date().toISOString() })
          .eq("id", w.id);

        await supabase.from("coin_transactions").insert({
          user_id: w.user_id,
          type: "subscription_expiry",
          amount: -w.subscription_balance,
          balance_type: "subscription",
          description: `Expiração mensal — ${w.subscription_balance} Coins de assinatura expirados`,
        });
        expired++;
      }
    }

    // 2. Credit PRO users with new subscription coins
    const { data: activeSubscriptions } = await supabase
      .from("subscriptions")
      .select("user_id, plan_id")
      .eq("status", "active")
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      // Get PRO plan IDs (price > 0)
      const { data: proPlans } = await supabase
        .from("plans")
        .select("id")
        .gt("price", 0)
        .eq("is_active", true);

      const proPlanIds = new Set((proPlans || []).map((p) => p.id));

      for (const sub of activeSubscriptions) {
        if (!proPlanIds.has(sub.plan_id)) continue;

        // Credit subscription coins
        await supabase
          .from("wallets")
          .update({
            subscription_balance: PRO_MONTHLY_COINS,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", sub.user_id);

        await supabase.from("coin_transactions").insert({
          user_id: sub.user_id,
          type: "subscription_credit",
          amount: PRO_MONTHLY_COINS,
          balance_type: "subscription",
          description: `Crédito mensal PRO — ${PRO_MONTHLY_COINS} Coins`,
        });
        credited++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired_wallets: expired,
        credited_pro_users: credited,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
