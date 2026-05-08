-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    plan_name TEXT,
    billing_cycle TEXT, -- 'monthly' or 'annual'
    status TEXT, -- 'active', 'canceled', 'incomplete', 'unpaid', 'trialing', 'past_due'
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Only service role (via Edge Functions) should be able to insert/update/delete 
-- but we can add a policy for safety if needed. 
-- For now, we'll rely on the service_role key used in Edge Functions.

-- Trigger for updated_at
CREATE TRIGGER trg_subscriptions_updated 
    BEFORE UPDATE ON public.subscriptions 
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
