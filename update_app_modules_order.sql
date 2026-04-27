-- Eğer tabloyu zaten oluşturduysanız sadece bu dosyayı çalıştırarak "Sıralama" özelliğini ekleyebilirsiniz.
ALTER TABLE public.app_modules ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Mevcut veriler için geçici sıralama değerleri atayabilirsiniz (isteğe bağlı)
UPDATE public.app_modules SET display_order = 10 WHERE id = 'review';
UPDATE public.app_modules SET display_order = 20 WHERE id = 'food_drink';
UPDATE public.app_modules SET display_order = 30 WHERE id = 'tabemasu_match';
UPDATE public.app_modules SET display_order = 40 WHERE id = 'time_words';
UPDATE public.app_modules SET display_order = 50 WHERE id = 'role_play';
UPDATE public.app_modules SET display_order = 60 WHERE id = 'simple_verbs';
UPDATE public.app_modules SET display_order = 70 WHERE id = 'tai_verbs';
UPDATE public.app_modules SET display_order = 80 WHERE id = 'sentence_builder';
UPDATE public.app_modules SET display_order = 90 WHERE id = 'verb_master_game';
UPDATE public.app_modules SET display_order = 100 WHERE id = 'vocab_test';
UPDATE public.app_modules SET display_order = 110 WHERE id = 'live_game';
