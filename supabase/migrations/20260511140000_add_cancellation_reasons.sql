CREATE TABLE IF NOT EXISTS public.cancellation_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id TEXT,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cancellation_reasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cancellation reasons"
    ON public.cancellation_reasons
    FOR SELECT
    USING (auth.uid() = user_id);
