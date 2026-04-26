-- app_modules tablosu: Ana sayfada gösterilecek modüllerin görünürlük ayarlarını tutar.
CREATE TABLE IF NOT EXISTS public.app_modules (
  id text PRIMARY KEY,
  title text NOT NULL,
  is_visible boolean DEFAULT true,
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
INSERT INTO public.app_modules (id, title, is_visible)
VALUES 
  ('review', 'Konu Tekrarı', true),
  ('food_drink', 'Yiyecek/İçecek İsimleri (Yemek/İçmek)', true),
  ('tabemasu_match', 'Tabemasu / Nomimasu Eşleştirme', true),
  ('time_words', 'Sabah, Öğle, Akşam Kelimeleri', true),
  ('role_play', 'Rol Play (Role Play)', true),
  ('simple_verbs', 'Japonca Basit Fiiller', true),
  ('tai_verbs', 'İstemek (-tai) Fiilleri', true),
  ('sentence_builder', 'Cümle Kurma / Boşluk Doldurma', true),
  ('verb_master_game', 'Oyun: Fiil Eşleştirme', true),
  ('vocab_test', 'Kelime Testi (Japonca-Türkçe)', true),
  ('live_game', 'Canlı Sınıf Quiz (Sınıf Oyunu)', true)
ON CONFLICT (id) DO NOTHING;
