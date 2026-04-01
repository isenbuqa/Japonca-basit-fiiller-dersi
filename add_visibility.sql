-- Bütün tablolara is_visible sütunu ekleniyor (varsayılan: true = görünür)
ALTER TABLE public.verbs ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE public.vocabulary_items ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE public.tabemasu_items ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE public.time_words ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE public.simple_verbs ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE public.tai_verbs ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE public.sentences ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE public.review_questions ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
