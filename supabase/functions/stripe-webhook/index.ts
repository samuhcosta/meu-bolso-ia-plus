// @ts-nocheck - Este arquivo roda no Deno (Supabase Edge Functions), não no Node.js
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.16.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature', { status: 400 })
  }

  const body = await req.text()
  const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  
  let event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      endpointSecret ?? '',
      undefined,
      cryptoProvider
    )
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error(`❌ Webhook signature verification failed: ${errMsg}`)
    return new Response(`Webhook Error: ${errMsg}`, { status: 400 })
  }

  console.log(`🔔 Received event: ${event.type}`)

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId = session.subscription as string
        const customerId = session.customer as string
        const userId = session.client_reference_id
        
        if (!userId) {
          console.error('❌ No user ID (client_reference_id) in checkout session')
          break
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            plan_name: subscription.items.data[0].plan.nickname || 'Pro',
            billing_cycle: subscription.items.data[0].plan.interval === 'month' ? 'monthly' : 'annual',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'stripe_subscription_id' })

        if (error) throw error
        console.log(`✅ Subscription created/updated for user ${userId}`)
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_price_id: subscription.items.data[0].price.id,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) throw error
        console.log(`✅ Subscription ${subscription.id} updated: ${subscription.status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) throw error
        console.log(`✅ Subscription ${subscription.id} deleted`)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscriptionId = invoice.subscription as string
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId)

          if (error) throw error
          console.log(`✅ Invoice paid for subscription ${subscriptionId}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          const subscriptionId = invoice.subscription as string
          
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId)

          if (error) throw error
          console.log(`❌ Payment failed for subscription ${subscriptionId}`)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error(`❌ Error processing webhook: ${errMsg}`)
    return new Response(`Error: ${errMsg}`, { status: 500 })
  }
})
