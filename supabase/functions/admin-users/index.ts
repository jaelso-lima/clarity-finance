import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, userId } = await req.json();

    if (!action) {
      return new Response(JSON.stringify({ error: "Ação é obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action !== "list" && !userId) {
      return new Response(JSON.stringify({ error: "userId é obrigatório para esta ação" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;

    switch (action) {
      case "delete": {
        // Delete user data first
        await supabaseAdmin.from("expenses").delete().eq("user_id", userId);
        await supabaseAdmin.from("incomes").delete().eq("user_id", userId);
        await supabaseAdmin.from("bills").delete().eq("user_id", userId);
        await supabaseAdmin.from("investments").delete().eq("user_id", userId);
        await supabaseAdmin.from("subscriptions").delete().eq("user_id", userId);
        await supabaseAdmin.from("profiles").delete().eq("id", userId);
        // Delete auth user
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) throw error;
        result = { message: "Usuário excluído com sucesso" };
        break;
      }
      case "block": {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          ban_duration: "876600h", // ~100 years
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
      case "list": {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
        if (error) throw error;
        
        // Get profiles for additional data
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
