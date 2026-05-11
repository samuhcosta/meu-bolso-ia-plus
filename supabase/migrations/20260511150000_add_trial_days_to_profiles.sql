-- Add trial_days column to profiles
ALTER TABLE public.profiles
ADD COLUMN trial_days INTEGER NOT NULL DEFAULT 5;

-- Update existing profiles that don't have trial_days set
UPDATE public.profiles SET trial_days = 5 WHERE trial_days IS NULL;

-- Update the handle_new_user function to set trial_days
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, whatsapp, trial_days)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'whatsapp',
    5
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
