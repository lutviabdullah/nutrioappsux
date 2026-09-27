CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Nutrio User',
  university TEXT NOT NULL DEFAULT '',
  faculty TEXT NOT NULL DEFAULT '',
  semester SMALLINT CHECK (semester IS NULL OR semester BETWEEN 1 AND 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL DEFAULT 'Nutrisi',
  summary TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT '',
  icon VARCHAR(40) NOT NULL DEFAULT 'book-open',
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_education_published_order
  ON public.education(sort_order, title)
  WHERE is_published;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.education TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

DROP POLICY IF EXISTS education_read_published ON public.education;
CREATE POLICY education_read_published
  ON public.education FOR SELECT
  TO anon, authenticated
  USING (is_published);

DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
CREATE POLICY profiles_read_own
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_education_updated_at ON public.education;
CREATE TRIGGER trg_education_updated_at
BEFORE UPDATE ON public.education
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.education (slug, title, category, summary, action, icon, sort_order)
VALUES
  ('piring-seimbang', 'Piring seimbang', 'Nutrisi', 'Isi piring dengan karbohidrat kompleks, protein, sayur, buah, dan lemak baik agar energi lebih stabil.', 'Target cepat: setengah piring sayur dan buah, lalu lengkapi dengan protein serta sumber karbohidrat.', 'utensils', 1),
  ('protein-rendah-jejak', 'Protein rendah jejak', 'Keberlanjutan', 'Tempe, tahu, kacang merah, edamame, dan telur bisa membantu memenuhi protein tanpa emisi setinggi daging merah.', 'Mulai dari 2-3 kali makan berbasis protein nabati per minggu.', 'leaf', 2),
  ('porsi-anti-mubazir', 'Porsi anti mubazir', 'Kebiasaan', 'Mengambil porsi sesuai lapar, membawa kotak makan, dan menghabiskan sisa makanan membantu menekan sampah pangan.', 'Pilih porsi kecil dulu, tambah bila masih lapar.', 'recycle', 3)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  summary = EXCLUDED.summary,
  action = EXCLUDED.action,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_published = TRUE,
  updated_at = NOW();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'education'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.education;
    END IF;
  END IF;
END;
$$;