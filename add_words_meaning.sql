-- words tablosuna Türkçe anlam sütunu ekle
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS meaning text;

-- Mevcut kelimelerin anlamlarını doldur
UPDATE public.words SET meaning = 'Kitap' WHERE romaji = 'Hon';
UPDATE public.words SET meaning = 'Ekmek' WHERE romaji = 'Pan';
UPDATE public.words SET meaning = 'Suşi' WHERE romaji = 'Sushi';
UPDATE public.words SET meaning = 'Pasta' WHERE romaji = 'Keeki';
UPDATE public.words SET meaning = 'Et' WHERE romaji = 'Niku';
UPDATE public.words SET meaning = 'Yumurta' WHERE romaji = 'Tamago';
UPDATE public.words SET meaning = 'Yemek' WHERE romaji = 'Gohan';
UPDATE public.words SET meaning = 'Su' WHERE romaji = 'Mizu';
UPDATE public.words SET meaning = 'Kahve' WHERE romaji = 'Koohii';
UPDATE public.words SET meaning = 'Kola' WHERE romaji = 'Koora';
UPDATE public.words SET meaning = 'Oyun' WHERE romaji = 'Geemu';
UPDATE public.words SET meaning = 'Futbol' WHERE romaji = 'Sakkaa';
UPDATE public.words SET meaning = 'Müzik' WHERE romaji = 'Ongaku';
UPDATE public.words SET meaning = 'Film' WHERE romaji = 'Eiga';
UPDATE public.words SET meaning = 'Televizyon' WHERE romaji = 'Terebi';
UPDATE public.words SET meaning = 'Sabah' WHERE romaji = 'Asa';
UPDATE public.words SET meaning = 'Gece' WHERE romaji = 'Yoru';
UPDATE public.words SET meaning = 'Okul' WHERE romaji = 'Gakkoo';
UPDATE public.words SET meaning = 'Park' WHERE romaji = 'Kooen';
