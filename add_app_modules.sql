-- app_modules tablosu: Ana sayfada gösterilecek modüllerin görünürlük ayarlarını tutar.
CREATE TABLE IF NOT EXISTS public.app_modules (
  id text PRIMARY KEY,
  title text NOT NULL,
  is_visible boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) ayarları
ALTER TABLE public.app_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes modülleri okuyabilir"
    ON public.app_modules FOR SELECT
    USING (true);

CREATE POLICY "Adminler modülleri güncelleyebilir"
    ON public.app_modules FOR UPDATE
    USING (true) -- Test aşamasında herkes için açık bırakılıyor, gerekirse admin kontrolü eklenebilir.
    WITH CHECK (true);

CREATE POLICY "Adminler modül ekleyebilir"
    ON public.app_modules FOR INSERT
    WITH CHECK (true);

-- Mevcut modülleri ekle (zaten varsa bir şey yapmaz)
INSERT INTO public.app_modules (id, title, is_visible, display_order)
VALUES 
  ('review', 'Konu Tekrarı', true, 10),
  ('food_drink', 'Yiyecek/İçecek İsimleri (Yemek/İçmek)', true, 20),
  ('tabemasu_match', 'Tabemasu / Nomimasu Eşleştirme', true, 30),
  ('time_words', 'Sabah, Öğle, Akşam Kelimeleri', true, 40),
  ('role_play', 'Rol Play (Role Play)', true, 50),
  ('simple_verbs', 'Japonca Basit Fiiller', true, 60),
  ('tai_verbs', 'İstemek (-tai) Fiilleri', true, 70),
  ('sentence_builder', 'Cümle Kurma / Boşluk Doldurma', true, 80),
  ('verb_master_game', 'Oyun: Fiil Eşleştirme', true, 90),
  ('vocab_test', 'Kelime Testi (Japonca-Türkçe)', true, 100),
  ('live_game', 'Canlı Sınıf Quiz (Sınıf Oyunu)', true, 110)
ON CONFLICT (id) DO NOTHING;
