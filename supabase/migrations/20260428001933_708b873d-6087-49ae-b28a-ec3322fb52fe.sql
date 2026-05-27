-- ============ TIMESTAMP TRIGGER FUNCTION ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles readable by everyone signed in"
  ON public.profiles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ STUDENTS ============
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  matric TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level IN (100, 200, 300, 400)),
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'frozen')),
  last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students readable by signed in users"
  ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students insertable by signed in users"
  ON public.students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Students updatable by signed in users"
  ON public.students FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Students deletable by signed in users"
  ON public.students FOR DELETE TO authenticated USING (true);

CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_students_user_id ON public.students(user_id);

-- ============ TRANSACTIONS ============
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  channel TEXT NOT NULL,
  note TEXT,
  flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  refunded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transactions readable by signed in users"
  ON public.transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Transactions insertable by signed in users"
  ON public.transactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Transactions updatable by signed in users"
  ON public.transactions FOR UPDATE TO authenticated USING (true);

CREATE INDEX idx_transactions_student_id ON public.transactions(student_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_flagged ON public.transactions(flagged) WHERE flagged = true;

-- ============ BENEFICIARIES ============
CREATE TABLE public.beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nickname TEXT,
  full_name TEXT NOT NULL,
  bank TEXT NOT NULL,
  account_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own beneficiaries"
  ON public.beneficiaries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own beneficiaries"
  ON public.beneficiaries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own beneficiaries"
  ON public.beneficiaries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own beneficiaries"
  ON public.beneficiaries FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_beneficiaries_user_id ON public.beneficiaries(user_id);

-- ============ ANNOUNCEMENTS ============
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('all', 'flagged', 'frozen')),
  recipients_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements readable by signed in users"
  ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Announcements insertable by signed in users"
  ON public.announcements FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_announcements_created_at ON public.announcements(created_at DESC);

-- ============ AUDIT LOG ============
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  target TEXT,
  actor UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit log readable by signed in users"
  ON public.audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Audit log insertable by signed in users"
  ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- ============ SEED 25 DEMO STUDENTS ============
INSERT INTO public.students (name, matric, email, department, level, balance, status, last_active) VALUES
('Adaeze Okafor',    'LMU/21/1042', 'adaeze.okafor@lmu.edu.ng',    'Computer Science', 300, 124500.00, 'active',  now() - interval '12 minutes'),
('Tunde Adeyemi',    'LMU/22/1188', 'tunde.adeyemi@lmu.edu.ng',    'Economics',        200,  48750.50, 'active',  now() - interval '2 hours'),
('Chioma Eze',       'LMU/20/1003', 'chioma.eze@lmu.edu.ng',       'Mass Comm',        400, 215300.00, 'active',  now() - interval '5 minutes'),
('Bola Balogun',     'LMU/23/1421', 'bola.balogun@lmu.edu.ng',     'Accounting',       100,  18200.75, 'active',  now() - interval '1 hour'),
('Ifeoma Nwosu',     'LMU/21/1067', 'ifeoma.nwosu@lmu.edu.ng',     'Architecture',     300,  92000.00, 'flagged', now() - interval '40 minutes'),
('Kunle Olatunji',   'LMU/22/1209', 'kunle.olatunji@lmu.edu.ng',   'Law',              200, 156800.00, 'active',  now() - interval '3 hours'),
('Zainab Mohammed',  'LMU/24/1502', 'zainab.mohammed@lmu.edu.ng',  'Biochemistry',     100,   8400.00, 'active',  now() - interval '15 minutes'),
('Emeka Obi',        'LMU/20/1011', 'emeka.obi@lmu.edu.ng',        'Industrial Chem',  400, 187200.50, 'active',  now() - interval '8 hours'),
('Funke Adesina',    'LMU/22/1255', 'funke.adesina@lmu.edu.ng',    'Computer Science', 200,  64300.00, 'active',  now() - interval '25 minutes'),
('Yusuf Ibrahim',    'LMU/21/1098', 'yusuf.ibrahim@lmu.edu.ng',    'Economics',        300, 102400.25, 'frozen',  now() - interval '2 days'),
('Ngozi Lawal',      'LMU/23/1389', 'ngozi.lawal@lmu.edu.ng',      'Mass Comm',        100,  22150.00, 'active',  now() - interval '1 hour'),
('Seun Yakubu',      'LMU/20/1024', 'seun.yakubu@lmu.edu.ng',      'Accounting',       400, 198750.00, 'active',  now() - interval '6 hours'),
('Aisha Adebayo',    'LMU/22/1276', 'aisha.adebayo@lmu.edu.ng',    'Architecture',     200,  73900.50, 'active',  now() - interval '50 minutes'),
('Chuka Bello',      'LMU/21/1054', 'chuka.bello@lmu.edu.ng',      'Law',              300, 145600.00, 'flagged', now() - interval '20 minutes'),
('Tola Ogunleye',    'LMU/24/1488', 'tola.ogunleye@lmu.edu.ng',    'Biochemistry',     100,  11800.00, 'active',  now() - interval '4 hours'),
('Hauwa Akin',       'LMU/22/1231', 'hauwa.akin@lmu.edu.ng',       'Industrial Chem',  200,  56700.75, 'active',  now() - interval '90 minutes'),
('Bayo Adeyemi',     'LMU/20/1019', 'bayo.adeyemi@lmu.edu.ng',     'Computer Science', 400, 224500.00, 'active',  now() - interval '10 hours'),
('Lola Okafor',      'LMU/23/1402', 'lola.okafor@lmu.edu.ng',      'Economics',        100,  16800.00, 'active',  now() - interval '35 minutes'),
('Kemi Eze',         'LMU/22/1264', 'kemi.eze@lmu.edu.ng',         'Mass Comm',        200,  87300.00, 'active',  now() - interval '5 hours'),
('Ibrahim Bello',    'LMU/21/1077', 'ibrahim.bello@lmu.edu.ng',    'Accounting',       300, 134500.50, 'active',  now() - interval '45 minutes'),
('Adaeze Lawal',     'LMU/24/1517', 'adaeze.lawal@lmu.edu.ng',     'Architecture',     100,  19200.00, 'frozen',  now() - interval '3 days'),
('Tunde Yakubu',     'LMU/20/1036', 'tunde.yakubu@lmu.edu.ng',     'Law',              400, 176800.00, 'active',  now() - interval '7 hours'),
('Chioma Adebayo',   'LMU/22/1248', 'chioma.adebayo@lmu.edu.ng',   'Biochemistry',     200,  62400.25, 'active',  now() - interval '55 minutes'),
('Bola Bello',       'LMU/21/1085', 'bola.bello@lmu.edu.ng',       'Industrial Chem',  300, 118700.00, 'active',  now() - interval '15 hours'),
('Ifeoma Akin',      'LMU/23/1415', 'ifeoma.akin@lmu.edu.ng',      'Computer Science', 100,  24300.00, 'active',  now() - interval '30 minutes');
