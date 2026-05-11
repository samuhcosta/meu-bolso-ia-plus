// @ts-nocheck - Este arquivo roda no Deno (Supabase Edge Functions), não no Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import Stripe from "https://esm.sh/stripe@14.16.0?target=deno"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { reason } = await req.json()

    if (!reason || reason.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "O motivo do cancelamento é obrigatório." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    // Extract JWT token from Authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Sessão expirada. Faça login novamente." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    const token = authHeader.replace("Bearer ", "")

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Usuário não autenticado." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    // Buscar assinatura do usuário
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    )

    const { data: sub, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (subError || !sub) {
      return new Response(
        JSON.stringify({ success: false, error: "Nenhuma assinatura ativa encontrada." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    if (sub.status !== "active" && sub.status !== "trialing") {
      return new Response(
        JSON.stringify({ success: false, error: "Sua assinatura não está ativa no momento." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    if (!sub.stripe_subscription_id) {
      return new Response(
        JSON.stringify({ success: false, error: "ID da assinatura não encontrado no Stripe." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? ""
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Chave do Stripe não configurada no servidor." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Cancelar no Stripe (ao final do período vigente)
    const updatedSubscription = await stripe.subscriptions.update(
      sub.stripe_subscription_id,
      { cancel_at_period_end: true },
    )

    // Salvar motivo do cancelamento
    const { error: reasonError } = await supabaseAdmin
      .from("cancellation_reasons")
      .insert({
        user_id: user.id,
        subscription_id: sub.stripe_subscription_id,
        reason: reason.trim(),
      })

    if (reasonError) {
      console.error("[cancel] Erro ao salvar motivo:", reasonError.message)
    }

    // Atualizar subscription na DB
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sub.id)

    if (updateError) {
      console.error("[cancel] Erro ao atualizar subscription:", updateError.message)
    }

    const periodEnd = new Date(updatedSubscription.current_period_end * 1000)

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sua assinatura será cancelada ao final do período vigente.",
        current_period_end: periodEnd.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[cancel] Erro:", message)
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    )
  }
})
