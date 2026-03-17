import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, userId, email, planId, duration, reason, planType } = await req.json();

    if (!action) {
      return new Response(JSON.stringify({ error: "Ação é obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action !== "list" && action !== "grant-plan" && !userId) {
      return new Response(JSON.stringify({ error: "userId é obrigatório para esta ação" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;

    switch (action) {
      case "delete": {
        await supabaseAdmin.from("expenses").delete().eq("user_id", userId);
        await supabaseAdmin.from("incomes").delete().eq("user_id", userId);
        await supabaseAdmin.from("bills").delete().eq("user_id", userId);
        await supabaseAdmin.from("investments").delete().eq("user_id", userId);
        await supabaseAdmin.from("subscriptions").delete().eq("user_id", userId);
        await supabaseAdmin.from("profiles").delete().eq("id", userId);
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) throw error;
        result = { message: "Usuário excluído com sucesso" };
        break;
      }
      case "block": {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          ban_duration: "876600h",
        });
        if (error) throw error;
        result = { message: "Usuário bloqueado com sucesso" };
        break;
      }
      case "unblock": {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          ban_duration: "none",
        });
        if (error) throw error;
        result = { message: "Usuário desbloqueado com sucesso" };
        break;
      }
      case "grant-plan": {
        // Grant a plan to a user by email
        if (!email || !planId || !duration || !reason) {
          return new Response(JSON.stringify({ error: "email, planId, duration e reason são obrigatórios" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Find user by email
        const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        if (listErr) throw listErr;
        const targetUser = usersData.users.find((u) => u.email === email);
        if (!targetUser) {
          return new Response(JSON.stringify({ error: "Usuário não encontrado com esse email" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Calculate expiration
        const now = new Date();
        const durationDays = parseInt(duration);
        const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        // Deactivate existing active subscriptions
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "expired" })
          .eq("user_id", targetUser.id)
          .eq("status", "active");

        // Create new subscription
        const { error: subErr } = await supabaseAdmin.from("subscriptions").insert({
          user_id: targetUser.id,
          plan_id: planId,
          status: "active",
          starts_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          reason: reason,
          granted_by: userId || null,
        });
        if (subErr) throw subErr;

        result = { message: `Plano concedido para ${email} por ${durationDays} dias` };
        break;
      }
      case "list": {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
        if (error) throw error;

        const { data: profiles } = await supabaseAdmin.from("profiles").select("*");
        const { data: subs } = await supabaseAdmin.from("subscriptions").select("*, plans(name)").eq("status", "active");

        const users = data.users.map((u) => {
          const profile = profiles?.find((p) => p.id === u.id);
          const sub = subs?.find((s) => s.user_id === u.id);
          return {
            id: u.id,
            name: profile?.full_name || u.user_metadata?.full_name || "Sem nome",
            email: u.email || "",
            plan: sub ? (sub as any).plans?.name || "PRO" : "Free",
            planGranted: sub?.reason ? true : false,
            status: u.banned_until ? "bloqueado" : "ativo",
            joined: u.created_at,
            avatar_url: profile?.avatar_url,
          };
        });
        result = { users };
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Ação inválida" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
