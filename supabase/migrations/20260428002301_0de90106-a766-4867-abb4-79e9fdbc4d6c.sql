-- ============ VIRTUAL CARDS ============
CREATE TABLE public.virtual_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_number TEXT NOT NULL,
  cvv TEXT NOT NULL,
  expiry TEXT NOT NULL,
  cardholder_name TEXT NOT NULL,
  frozen BOOLEAN NOT NULL DEFAULT false,
  monthly_limit NUMERIC(14,2) NOT NULL DEFAULT 100000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.virtual_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own cards" ON public.virtual_cards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own cards" ON public.virtual_cards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cards" ON public.virtual_cards FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cards" ON public.virtual_cards FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER virtual_cards_updated_at BEFORE UPDATE ON public.virtual_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SAVINGS GOALS ============
CREATE TABLE public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own goals" ON public.savings_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own goals" ON public.savings_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own goals" ON public.savings_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own goals" ON public.savings_goals FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER savings_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TUITION FEES ============
CREATE TABLE public.tuition_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  semester TEXT NOT NULL,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tuition_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tuition readable by signed in users" ON public.tuition_fees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tuition insertable by signed in users" ON public.tuition_fees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Tuition updatable by signed in users" ON public.tuition_fees FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Tuition deletable by signed in users" ON public.tuition_fees FOR DELETE TO authenticated USING (true);

CREATE TABLE public.tuition_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fee_id UUID NOT NULL REFERENCES public.tuition_fees(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, fee_id)
);
ALTER TABLE public.tuition_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own payments" ON public.tuition_payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own payments" ON public.tuition_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ SEED DEMO TUITION FEES ============
INSERT INTO public.tuition_fees (label, amount, semester, due_date) VALUES
('Tuition Fee', 285000.00, '2026 Spring', '2026-05-15'),
('Hostel Accommodation', 95000.00, '2026 Spring', '2026-05-15'),
('Library & Tech Levy', 18500.00, '2026 Spring', '2026-05-30'),
('ICT Support Fee', 12500.00, '2026 Spring', '2026-05-30'),
('Sports & Recreation', 8500.00, '2026 Spring', '2026-06-15');