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
    const { priceId, returnUrl } = await req.json()

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

    // Pass token explicitly to getUser
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError) {
      console.error("[checkout] Auth error:", userError.message)
      return new Response(
        JSON.stringify({ success: false, error: `Erro de autenticação: ${userError.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      )
    }

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "Usuário não encontrado. Faça login novamente." }),
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

    console.log(`[checkout] user=${user.email} price=${priceId}`)

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${returnUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}/plans`,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { userId: user.id },
    })

    console.log(`[checkout] session criado: ${session.id}`)

    return new Response(
      JSON.stringify({ success: true, url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[checkout] Erro:", message)
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    )
  }
})
