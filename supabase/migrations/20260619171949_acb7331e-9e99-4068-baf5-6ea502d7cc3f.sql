
-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  firm_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own profile" ON public.profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ CLIENTS ============
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  gstin TEXT,
  phone TEXT,
  email TEXT,
  business_type TEXT NOT NULL DEFAULT 'Proprietorship',
  compliances TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX clients_user_id_idx ON public.clients(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own clients" ON public.clients FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ COMPLIANCES ============
CREATE TABLE public.compliances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  compliance_type TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX compliances_user_id_idx ON public.compliances(user_id);
CREATE INDEX compliances_due_date_idx ON public.compliances(due_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliances TO authenticated;
GRANT ALL ON public.compliances TO service_role;
ALTER TABLE public.compliances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own compliances" ON public.compliances FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ NOTIFICATION PREFERENCES ============
CREATE TABLE public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  days_before INTEGER NOT NULL DEFAULT 7,
  daily_digest_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own prefs" ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ REMINDER LOG ============
CREATE TABLE public.reminder_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  compliance_id UUID NOT NULL REFERENCES public.compliances(id) ON DELETE CASCADE,
  reminder_for DATE NOT NULL,
  kind TEXT NOT NULL DEFAULT 'deadline',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, compliance_id, reminder_for, kind)
);
CREATE INDEX reminder_log_user_idx ON public.reminder_log(user_id);
GRANT SELECT ON public.reminder_log TO authenticated;
GRANT ALL ON public.reminder_log TO service_role;
ALTER TABLE public.reminder_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own reminder log" ON public.reminder_log FOR SELECT
  USING (auth.uid() = user_id);

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_compliances_updated BEFORE UPDATE ON public.compliances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_prefs_updated BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Auto-create profile + prefs on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  INSERT INTO public.notification_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
