-- ==========================================
-- SUPABASE SCHEMA FOR NIHONGO APP
-- Includes all questions across all modules
-- ==========================================

-- 1. VERB MASTER GAME (constants.ts)
CREATE TABLE public.verbs (
  id text PRIMARY KEY,
  text text NOT NULL,
  romaji text
);

CREATE TABLE public.words (
  id text PRIMARY KEY,
  text text NOT NULL,
  romaji text,
  image text NOT NULL,
  category text,
  valid_verb_ids text[] NOT NULL DEFAULT '{}'
);

CREATE TABLE public.feedback_data (
  id text PRIMARY KEY,
  explanation text NOT NULL,
  example_sentence text NOT NULL,
  romaji_sentence text NOT NULL
);

-- 2. VOCABULARY MODULE
CREATE TABLE public.vocabulary_items (
  id text PRIMARY KEY,
  text text NOT NULL,
  romaji text NOT NULL,
  meaning text NOT NULL,
  image text NOT NULL,
  type text NOT NULL -- 'noun' or 'verb'
);

-- 3. TABEMASU MATCH MODULE
CREATE TABLE public.tabemasu_items (
  id text PRIMARY KEY,
  romaji text NOT NULL,
  text text NOT NULL,
  image text NOT NULL,
  action text NOT NULL -- 'tabemas' or 'nomimas'
);

-- 4. TIME WORDS MODULE
CREATE TABLE public.time_words (
  id text PRIMARY KEY,
  text text NOT NULL,
  romaji text NOT NULL,
  meaning text NOT NULL,
  image_url text NOT NULL,
  theme text NOT NULL,
  text_color text NOT NULL
);

-- 5. SIMPLE VERBS MODULE
CREATE TABLE public.simple_verbs (
  id text PRIMARY KEY,
  romaji text NOT NULL,
  hiragana text NOT NULL,
  meaning text NOT NULL,
  image_url text
);

-- 6. REVIEW MODULE
CREATE TABLE public.review_questions (
  id text PRIMARY KEY,
  term integer NOT NULL, -- 1 or 2
  type text NOT NULL, -- 'vocab', 'demo', or 'matching'
  romaji_question text NOT NULL,
  japanese_question text NOT NULL,
  turkish_meaning text NOT NULL,
  image text,
  correct_answer text,
  options jsonb, -- Array of {text: string, romaji: string}
  pairs jsonb -- Array of {left: string, right: string}
);

-- 7. TAI VERBS (-tai form want to do)
CREATE TABLE public.tai_verbs (
  id text PRIMARY KEY,
  text text NOT NULL,
  romaji text NOT NULL,
  meaning text NOT NULL,
  image text NOT NULL,
  theme text NOT NULL,
  text_color text NOT NULL
);

-- 8. SENTENCE BUILDER (Drag & Drop / Cümle Kurma)
CREATE TABLE public.sentences (
  id text PRIMARY KEY,
  turkish_meaning text NOT NULL,
  correct_words jsonb NOT NULL,
  distractors jsonb NOT NULL
);

-- Enable RLS and add public policies for all tables
ALTER TABLE public.verbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tabemasu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simple_verbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tai_verbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read verbs" ON public.verbs FOR SELECT USING (true);
CREATE POLICY "Allow public insert verbs" ON public.verbs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update verbs" ON public.verbs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete verbs" ON public.verbs FOR DELETE USING (true);

CREATE POLICY "Allow public read words" ON public.words FOR SELECT USING (true);
CREATE POLICY "Allow public insert words" ON public.words FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update words" ON public.words FOR UPDATE USING (true);
CREATE POLICY "Allow public delete words" ON public.words FOR DELETE USING (true);

CREATE POLICY "Allow public read feedback_data" ON public.feedback_data FOR SELECT USING (true);
CREATE POLICY "Allow public insert feedback_data" ON public.feedback_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update feedback_data" ON public.feedback_data FOR UPDATE USING (true);
CREATE POLICY "Allow public delete feedback_data" ON public.feedback_data FOR DELETE USING (true);

CREATE POLICY "Allow public all vocabulary_items" ON public.vocabulary_items FOR ALL USING (true);
CREATE POLICY "Allow public all tabemasu_items" ON public.tabemasu_items FOR ALL USING (true);
CREATE POLICY "Allow public all time_words" ON public.time_words FOR ALL USING (true);
CREATE POLICY "Allow public all simple_verbs" ON public.simple_verbs FOR ALL USING (true);
CREATE POLICY "Allow public all review_questions" ON public.review_questions FOR ALL USING (true);
CREATE POLICY "Allow public all tai_verbs" ON public.tai_verbs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all sentences" ON public.sentences FOR ALL USING (true) WITH CHECK (true);


-- ==========================================
-- INSERT DATA
-- ==========================================

-- 1. VERB MASTER (constants.ts)
INSERT INTO public.verbs (id, text, romaji) VALUES
('v1', '食べます', 'Tabemas'),
('v2', '飲みます', 'Nomimas'),
('v3', '聞きます', 'Kikimas'),
('v4', '見ます', 'Mimas'),
('v5', '作ります', 'Tsukurimas'),
('v6', '読みます', 'Yomimas'),
('v7', '買います', 'Kaimas'),
('v8', '寝ます', 'Nemas'),
('v9', '起きます', 'Okimas');

INSERT INTO public.words (id, text, romaji, image, category, valid_verb_ids) VALUES
('1', '本', 'Hon', '📚', 'object', ARRAY['v6', 'v7', 'v5']),
('2', 'パン', 'Pan', '🍞', 'object', ARRAY['v1', 'v5', 'v7']),
('3', 'すし', 'Sushi', '🍣', 'object', ARRAY['v1', 'v5', 'v7']),
('4', 'ケーキ', 'Keeki', '🍰', 'object', ARRAY['v1', 'v5', 'v7']),
('5', '肉', 'Niku', '🥩', 'object', ARRAY['v1', 'v5', 'v7']),
('6', '卵', 'Tamago', '🥚', 'object', ARRAY['v1', 'v5', 'v7']),
('7', 'ご飯', 'Gohan', '🍚', 'object', ARRAY['v1', 'v5']),
('8', '水', 'Mizu', '💧', 'object', ARRAY['v2', 'v7']),
('9', 'コーヒー', 'Koohii', '☕', 'object', ARRAY['v2', 'v5', 'v7']),
('10', 'コーラ', 'Koora', '🥤', 'object', ARRAY['v2', 'v7']),
('11', 'あさ', 'Asa', '🌅', 'time', ARRAY['v9']),
('13', 'よる', 'Yoru', '🌙', 'time', ARRAY['v8']),
('14', 'テレビ', 'Terebi', '📺', 'object', ARRAY['v4', 'v7']),
('15', '音楽', 'Ongaku', '🎵', 'object', ARRAY['v3', 'v5']),
('16', '映画', 'Eiga', '🎬', 'object', ARRAY['v4', 'v5']);

INSERT INTO public.feedback_data (id, explanation, example_sentence, romaji_sentence) VALUES
('1-v6', 'Harika! Kitap okunur.', '本を読みます。', 'Hon o yomimasu.'),
('1-v7', 'Doğru! Kitapçıdan kitap alınır.', '本を買います。', 'Hon o kaimasu.'),
('1-v5', 'Evet, kitap yazılabilir veya yapılabilir.', '本を作ります。', 'Hon o tsukurimasu.'),
('2-v1', 'Süper! Ekmek yenir.', 'パンを食べます。', 'Pan o tabemasu.'),
('2-v7', 'Doğru! Fırından ekmek alınır.', 'パンを買います。', 'Pan o kaimasu.'),
('2-v5', 'Evet, ekmek yapabilirsiniz.', 'パンを作ります。', 'Pan o tsukurimasu.'),
('3-v1', 'Lezzetli! Suşi yenir.', 'すしを食べます。', 'Sushi o tabemasu.'),
('3-v7', 'Doğru! Marketten suşi alınır.', 'すしを買います。', 'Sushi o kaimasu.'),
('3-v5', 'Harika! Evde suşi yapılır.', 'すしを作ります。', 'Sushi o tsukurimasu.'),
('4-v1', 'Nefis! Pasta yenir.', 'ケーキを食べます。', 'Keeki o tabemasu.'),
('4-v7', 'Doğru! Pastaneden pasta alınır.', 'ケーキを買います。', 'Keeki o kaimasu.'),
('4-v5', 'Evet, doğum günü için pasta yapılır.', 'ケーキを作ります。', 'Keeki o tsukurimasu.'),
('5-v1', 'Güzel! Et yenir.', '肉を食べます。', 'Niku o tabemasu.'),
('5-v7', 'Doğru! Kasaptan et alınır.', '肉を買います。', 'Niku o kaimasu.'),
('5-v5', 'Evet, et yemeği yapılır.', '肉料理を作ります。', 'Niku ryouri o tsukurimasu.'),
('6-v1', 'Doğru! Yumurta yenir.', '卵を食べます。', 'Tamago o tabemasu.'),
('6-v7', 'Evet, marketten yumurta alınır.', '卵を買います。', 'Tamago o kaimasu.'),
('6-v5', 'Doğru, yumurtalı yemek yapılır.', '卵料理を作ります。', 'Tamago ryouri o tsukurimasu.'),
('7-v1', 'Afiyet olsun! Yemek yenir.', 'ご飯を食べます。', 'Gohan o tabemasu.'),
('7-v5', 'Evet, yemek yapılır.', 'ご飯を作ります。', 'Gohan o tsukurimasu.'),
('8-v2', 'Çok sağlıklı! Su içilir.', '水を飲みます。', 'Mizu o nomimasu.'),
('8-v7', 'Doğru! Bakkaldan su alınır.', '水を買います。', 'Mizu o kaimasu.'),
('9-v2', 'Harika! Kahve içilir.', 'コーヒーを飲みます。', 'Koohii o nomimasu.'),
('9-v5', 'Evet, kahve demlenir/yapılır.', 'コーヒーを作ります。', 'Koohii o tsukurimasu.'),
('9-v7', 'Doğru! Kahve satın alınır.', 'コーヒーを買います。', 'Koohii o kaimasu.'),
('10-v2', 'Serinletici! Kola içilir.', 'コーラを飲みます。', 'Koora o nomimasu.'),
('10-v7', 'Evet, kola satın alınır.', 'コーラを買います。', 'Koora o kaimasu.'),
('11-v9', 'Günaydın! Sabah uyanılır.', 'あさ、起きます。', 'Asa, okimasu.'),
('13-v8', 'İyi geceler! Gece uyunur.', 'よる、寝ます。', 'Yoru, nemasu.'),
('14-v4', 'Doğru! Televizyon izlenir.', 'テレビを見ます。', 'Terebi o mimasu.'),
('14-v7', 'Evet, elektronik mağazasından TV alınır.', 'テレビを買います。', 'Terebi o kaimasu.'),
('15-v3', 'Çok güzel! Müzik dinlenir.', '音楽を聞きます。', 'Ongaku o kikimasu.'),
('15-v5', 'Harika! Müzik/Şarkı yapılır.', '音楽を作ります。', 'Ongaku o tsukurimasu.'),
('16-v4', 'İyi seyirler! Film izlenir.', '映画を見ます。', 'Eiga o mimasu.'),
('16-v5', 'Evet, film çekilir/yapılır.', '映画を作ります。', 'Eiga o tsukurimasu.');

-- 2. VOCABULARY MODULE (VocabularyModule.tsx)
INSERT INTO public.vocabulary_items (id, text, romaji, meaning, image, type) VALUES
('1', 'パン', 'Pan', 'Ekmek', '🍞', 'noun'),
('2', 'すし', 'Sushi', 'Suşi', '🍣', 'noun'),
('3', 'ケーキ', 'Keeki', 'Pasta/Kek', '🍰', 'noun'),
('4', '肉', 'Niku', 'Et', '🥩', 'noun'),
('5', '卵', 'Tamago', 'Yumurta', '🥚', 'noun'),
('6', 'ご飯', 'Gohan', 'Pirinç Pilavı / Yemek', '🍚', 'noun'),
('7', '水', 'Mizu', 'Su', '💧', 'noun'),
('8', 'コーヒー', 'Koohii', 'Kahve', '☕', 'noun'),
('9', 'コーラ', 'Koora', 'Kola', '🥤', 'noun'),
('10', '食べます', 'Tabemas', 'Yemek (Fiil)', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/tabemasu.jpg', 'verb'),
('11', '飲みます', 'Nomimas', 'İçmek (Fiil)', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/nomimasu.jpg', 'verb');

-- 3. TABEMASU MATCH
INSERT INTO public.tabemasu_items (id, romaji, text, image, action) VALUES
('1', 'Pan', 'パン', '🍞', 'tabemas'),
('2', 'Sushi', 'すし', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/tabemasu.jpg', 'tabemas'),
('3', 'Keeki', 'ケーキ', '🍰', 'tabemas'),
('4', 'Niku', '肉', '🥩', 'tabemas'),
('5', 'Tamago', '卵', '🥚', 'tabemas'),
('6', 'Gohan', 'ご飯', '🍚', 'tabemas'),
('7', 'Mizu', '水', '💧', 'nomimas'),
('8', 'Koohii', 'コーヒー', '☕', 'nomimas'),
('9', 'Koora', 'コーラ', '🥤', 'nomimas');

-- 4. TIME WORDS
INSERT INTO public.time_words (id, text, romaji, meaning, image_url, theme, text_color) VALUES
('1', 'あさ', 'Asa', 'Sabah', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/asa.jpg', 'bg-gradient-to-br from-orange-300 to-rose-400', 'text-orange-900'),
('2', 'ひる', 'Hiru', 'Öğle', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/hiru.jpg', 'bg-gradient-to-br from-sky-300 to-blue-400', 'text-blue-900'),
('3', 'よる', 'Yoru', 'Akşam / Gece', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/yoru.jpg', 'bg-gradient-to-br from-indigo-500 to-purple-800', 'text-white');

-- 5. SIMPLE VERBS
INSERT INTO public.simple_verbs (id, romaji, hiragana, meaning, image_url) VALUES
('1', 'Kikimas', 'ききます', 'Dinlemek', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/kikimasu.jpg'),
('2', 'Mimas', 'みます', 'İzlemek / Görmek', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/mimasu.jpg'),
('3', 'Tsukurimas', 'つくります', 'Yapmak (Yemek vb.)', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/tsukurimasu.jpg'),
('4', 'Yomimas', 'よみます', 'Okumak', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/yomimasu.jpg'),
('5', 'Kaimas', 'かいます', 'Satın Almak', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/kaimasu.jpg'),
('6', 'Nemas', 'ねます', 'Uyumak', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/nemasu.jpg'),
('7', 'Okimas', 'おきます', 'Uyanmak', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/okimasu.jpg');

-- 6. REVIEW QUESTIONS
INSERT INTO public.review_questions (id, term, type, romaji_question, japanese_question, turkish_meaning, image, correct_answer, options, pairs) VALUES
('q1', 1, 'vocab', 'Kore wa nan desu ka?', 'これは何ですか？', 'Bu nedir?', '📚', '本', '[{"text": "本", "romaji": "Hon"}, {"text": "ノート", "romaji": "Nooto"}, {"text": "鉛筆", "romaji": "Enpitsu"}, {"text": "携帯", "romaji": "Keitai"}]'::jsonb, null),
('q2', 1, 'vocab', 'Kore wa nan desu ka?', 'これは何ですか？', 'Bu nedir?', '📓', 'ノート', '[{"text": "本", "romaji": "Hon"}, {"text": "ノート", "romaji": "Nooto"}, {"text": "鉛筆", "romaji": "Enpitsu"}, {"text": "携帯", "romaji": "Keitai"}]'::jsonb, null),
('q3', 1, 'vocab', 'Kore wa nan desu ka?', 'これは何ですか？', 'Bu nedir?', '✏️', '鉛筆', '[{"text": "本", "romaji": "Hon"}, {"text": "ノート", "romaji": "Nooto"}, {"text": "鉛筆", "romaji": "Enpitsu"}, {"text": "携帯", "romaji": "Keitai"}]'::jsonb, null),
('q4', 1, 'vocab', 'Kore wa nan desu ka?', 'これは何ですか？', 'Bu nedir?', '📱', '携帯', '[{"text": "本", "romaji": "Hon"}, {"text": "ノート", "romaji": "Nooto"}, {"text": "鉛筆", "romaji": "Enpitsu"}, {"text": "携帯", "romaji": "Keitai"}]'::jsonb, null),
('q5', 1, 'demo', 'Dore desu ka?', 'どれですか？', 'Doğru işaret zamirini seçiniz.', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/kore.jpg', 'これ', '[{"text": "これ", "romaji": "Kore"}, {"text": "それ", "romaji": "Sore"}, {"text": "あれ", "romaji": "Are"}]'::jsonb, null),
('q6', 1, 'demo', 'Dore desu ka?', 'どれですか？', 'Doğru işaret zamirini seçiniz.', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/sore.jpg', 'それ', '[{"text": "これ", "romaji": "Kore"}, {"text": "それ", "romaji": "Sore"}, {"text": "あれ", "romaji": "Are"}]'::jsonb, null),
('q7', 1, 'demo', 'Dore desu ka?', 'どれですか？', 'Doğru işaret zamirini seçiniz.', 'https://raw.githubusercontent.com/isenbuqa/staj-dersi-img/refs/heads/main/are.jpg', 'あれ', '[{"text": "これ", "romaji": "Kore"}, {"text": "それ", "romaji": "Sore"}, {"text": "あれ", "romaji": "Are"}]'::jsonb, null),
('t2_q1', 2, 'vocab', 'Japoncanın kaç alfabesi vardır?', '日本語にはいくつの文字がありますか？', 'Japoncanın kaç alfabesi vardır?', '🔤', '3', '[{"text": "1", "romaji": "1"}, {"text": "2", "romaji": "2"}, {"text": "3", "romaji": "3"}, {"text": "4", "romaji": "4"}]'::jsonb, null),
('t2_q2', 2, 'vocab', 'Aşağıdakilerden hangisi Japon alfabesindendir?', '次のうち、日本の文字はどれですか？', 'Aşağıdakilerden hangisi Japon alfabesindendir?', 'あ', 'Hiragana', '[{"text": "Kiril", "romaji": "Kiril"}, {"text": "Latin", "romaji": "Latin"}, {"text": "Hiragana", "romaji": "Hiragana"}, {"text": "Arap", "romaji": "Arap"}]'::jsonb, null),
('t2_q3', 2, 'vocab', 'Japonya''nın başkenti neresidir?', '日本の首都はどこですか？', 'Japonya''nın başkenti neresidir?', '🗼', 'Tokyo', '[{"text": "Kyoto", "romaji": "Kyoto"}, {"text": "Osaka", "romaji": "Osaka"}, {"text": "Tokyo", "romaji": "Tokyo"}, {"text": "Sapporo", "romaji": "Sapporo"}]'::jsonb, null),
('t2_q4', 2, 'vocab', 'Japon kiraz çiçeklerine ne denir?', '日本の桜は何と呼ばれますか？', 'Japon kiraz çiçeklerine ne denir?', '🌸', 'Sakura', '[{"text": "Sakura", "romaji": "Sakura"}, {"text": "Bonsai", "romaji": "Bonsai"}, {"text": "Origami", "romaji": "Origami"}, {"text": "Sushi", "romaji": "Sushi"}]'::jsonb, null),
('t2_q5', 2, 'vocab', 'Japon bayrağı hangisidir?', '日本の国旗はどれですか？', 'Japon bayrağı hangisidir?', '🎌', '🇯🇵', '[{"text": "🇯🇵", "romaji": "Japonya"}, {"text": "🇰🇷", "romaji": "Güney Kore"}, {"text": "🇨🇳", "romaji": "Çin"}, {"text": "🇹🇷", "romaji": "Türkiye"}]'::jsonb, null),
('t2_q6', 2, 'vocab', 'Japonya''nın en yüksek dağının adı nedir?', '日本で一番高い山の名前は何ですか？', 'Japonya''nın en yüksek dağının adı nedir?', '🗻', 'Fuji', '[{"text": "Fuji", "romaji": "Fuji"}, {"text": "Everest", "romaji": "Everest"}, {"text": "Ağrı", "romaji": "Ağrı"}, {"text": "Kilimanjaro", "romaji": "Kilimanjaro"}]'::jsonb, null),
('t2_q7', 2, 'vocab', 'お土産 ne demektir?', 'お土産', 'Omiyage ne demektir?', '🎁', 'Hediyelik eşya', '[{"text": "Hediyelik eşya", "romaji": "Hediyelik eşya"}, {"text": "Araba", "romaji": "Araba"}, {"text": "Ev", "romaji": "Ev"}, {"text": "Okul", "romaji": "Okul"}]'::jsonb, null),
('t2_q8', 2, 'vocab', 'お辞儀 ne demektir?', 'お辞儀', 'Ojigi ne demektir?', '🙇', 'Selamlaşma', '[{"text": "Selamlaşma", "romaji": "Selamlaşma"}, {"text": "Koşma", "romaji": "Koşma"}, {"text": "Yüzme", "romaji": "Yüzme"}, {"text": "Uyumak", "romaji": "Uyumak"}]'::jsonb, null),
('t2_q9', 2, 'matching', 'Eşleştirme', 'マッチング', 'Aşağıdakileri türkçe karşılıkları ile eşleştir.', null, null, null, '[{"left": "Ohayoo gozaimas", "right": "Günaydın"}, {"left": "Oyasuminasai", "right": "İyi geceler"}, {"left": "Konnichiwa", "right": "İyi günler / Merhaba"}, {"left": "Konbanwa", "right": "İyi akşamlar"}, {"left": "Sayoonara", "right": "Hoşça kal"}, {"left": "Arigatoo gozaimas", "right": "Teşekkür ederim"}, {"left": "Gomennasai", "right": "Özür dilerim"}, {"left": "Sumimasen", "right": "Afedersiniz"}]'::jsonb);

-- 7. SENTENCE BUILDER
INSERT INTO public.sentences (id, turkish_meaning, correct_words, distractors) VALUES
('s1', 'Oyun oynamak istiyorum.', '[{"romaji": "Geemu", "hiragana": "ゲーム"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Shitai", "hiragana": "したい"}]'::jsonb, '[{"romaji": "Sakkaa", "hiragana": "サッカー"}, {"romaji": "Kaitai", "hiragana": "かいたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s2', 'Futbol oynamak istiyorum.', '[{"romaji": "Sakkaa", "hiragana": "サッカー"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Shitai", "hiragana": "したい"}]'::jsonb, '[{"romaji": "Geemu", "hiragana": "ゲーム"}, {"romaji": "Gakkoo", "hiragana": "がっこう"}, {"romaji": "de", "hiragana": "で"}]'::jsonb),
('s3', 'Kola içmek istiyorum.', '[{"romaji": "Koora", "hiragana": "コーラ"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Nomitai", "hiragana": "のみたい"}]'::jsonb, '[{"romaji": "Mizu", "hiragana": "みず"}, {"romaji": "Tabetai", "hiragana": "たべたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s4', 'Su içmek istiyorum.', '[{"romaji": "Mizu", "hiragana": "みず"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Nomitai", "hiragana": "のみたい"}]'::jsonb, '[{"romaji": "Koohii", "hiragana": "コーヒー"}, {"romaji": "Mitai", "hiragana": "みたい"}, {"romaji": "ga", "hiragana": "が"}]'::jsonb),
('s5', 'Kahve içmek istiyorum.', '[{"romaji": "Koohii", "hiragana": "コーヒー"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Nomitai", "hiragana": "のみたい"}]'::jsonb, '[{"romaji": "Koora", "hiragana": "コーラ"}, {"romaji": "Shitai", "hiragana": "したい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s6', 'Kitap okumak istiyorum.', '[{"romaji": "Hon", "hiragana": "ほん"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Yomitai", "hiragana": "よみたい"}]'::jsonb, '[{"romaji": "Eiga", "hiragana": "えいが"}, {"romaji": "Kikitai", "hiragana": "ききたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s7', 'Gece uyumak istiyorum.', '[{"romaji": "Yoru", "hiragana": "よる"}, {"romaji": "Netai", "hiragana": "ねたい"}]'::jsonb, '[{"romaji": "Asa", "hiragana": "あさ"}, {"romaji": "Ikitai", "hiragana": "いきたい"}, {"romaji": "o", "hiragana": "を"}]'::jsonb),
('s8', 'Sabah uyumak istiyorum.', '[{"romaji": "Asa", "hiragana": "あさ"}, {"romaji": "Netai", "hiragana": "ねたい"}]'::jsonb, '[{"romaji": "Yoru", "hiragana": "よる"}, {"romaji": "Mitai", "hiragana": "みたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s9', 'Okula gitmek istiyorum.', '[{"romaji": "Gakkoo", "hiragana": "がっこう"}, {"romaji": "ni", "hiragana": "に"}, {"romaji": "Ikitai", "hiragana": "いきたい"}]'::jsonb, '[{"romaji": "Kooen", "hiragana": "こうえん"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Shitai", "hiragana": "したい"}]'::jsonb),
('s10', 'Parka gitmek istiyorum.', '[{"romaji": "Kooen", "hiragana": "こうえん"}, {"romaji": "ni", "hiragana": "に"}, {"romaji": "Ikitai", "hiragana": "いきたい"}]'::jsonb, '[{"romaji": "Gakkoo", "hiragana": "がっこう"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tabetai", "hiragana": "たべたい"}]'::jsonb),
('s11', 'Müzik dinlemek istiyorum.', '[{"romaji": "Ongaku", "hiragana": "おんがく"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Kikitai", "hiragana": "ききたい"}]'::jsonb, '[{"romaji": "Terebi", "hiragana": "テレビ"}, {"romaji": "Mitai", "hiragana": "みたい"}, {"romaji": "ga", "hiragana": "が"}]'::jsonb),
('s12', 'Kitap satın almak istiyorum.', '[{"romaji": "Hon", "hiragana": "ほん"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Kaitai", "hiragana": "かいたい"}]'::jsonb, '[{"romaji": "Pan", "hiragana": "パン"}, {"romaji": "Yomitai", "hiragana": "よみたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s13', 'Kola satın almak istiyorum.', '[{"romaji": "Koora", "hiragana": "コーラ"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Kaitai", "hiragana": "かいたい"}]'::jsonb, '[{"romaji": "Mizu", "hiragana": "みず"}, {"romaji": "Nomitai", "hiragana": "のみたい"}, {"romaji": "ga", "hiragana": "が"}]'::jsonb),
('s14', 'Televizyon satın almak istiyorum.', '[{"romaji": "Terebi", "hiragana": "テレビ"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Kaitai", "hiragana": "かいたい"}]'::jsonb, '[{"romaji": "Eiga", "hiragana": "えいが"}, {"romaji": "Mitai", "hiragana": "みたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s15', 'Ekmek satın almak istiyorum.', '[{"romaji": "Pan", "hiragana": "パン"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Kaitai", "hiragana": "かいたい"}]'::jsonb, '[{"romaji": "Keeki", "hiragana": "ケーキ"}, {"romaji": "Tabetai", "hiragana": "たべたい"}, {"romaji": "ga", "hiragana": "が"}]'::jsonb),
('s16', 'Suşi satın almak istiyorum.', '[{"romaji": "Sushi", "hiragana": "すし"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Kaitai", "hiragana": "かいたい"}]'::jsonb, '[{"romaji": "Niku", "hiragana": "にく"}, {"romaji": "Tsukuritai", "hiragana": "つくりたい"}, {"romaji": "de", "hiragana": "で"}]'::jsonb),
('s17', 'Pasta satın almak istiyorum.', '[{"romaji": "Keeki", "hiragana": "ケーキ"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Kaitai", "hiragana": "かいたい"}]'::jsonb, '[{"romaji": "Tamago", "hiragana": "たまご"}, {"romaji": "Tabetai", "hiragana": "たべたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s18', 'Et satın almak istiyorum.', '[{"romaji": "Niku", "hiragana": "にく"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Kaitai", "hiragana": "かいたい"}]'::jsonb, '[{"romaji": "Gohan", "hiragana": "ごはん"}, {"romaji": "Nomitai", "hiragana": "のみたい"}, {"romaji": "ga", "hiragana": "が"}]'::jsonb),
('s19', 'Yumurta satın almak istiyorum.', '[{"romaji": "Tamago", "hiragana": "たまご"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Kaitai", "hiragana": "かいたい"}]'::jsonb, '[{"romaji": "Sushi", "hiragana": "すし"}, {"romaji": "Kikitai", "hiragana": "ききたい"}, {"romaji": "de", "hiragana": "で"}]'::jsonb),
('s20', 'Su satın almak istiyorum.', '[{"romaji": "Mizu", "hiragana": "みず"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Kaitai", "hiragana": "かいたい"}]'::jsonb, '[{"romaji": "Koohii", "hiragana": "コーヒー"}, {"romaji": "Shitai", "hiragana": "したい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s21', 'Kahve satın almak istiyorum.', '[{"romaji": "Koohii", "hiragana": "コーヒー"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Kaitai", "hiragana": "かいたい"}]'::jsonb, '[{"romaji": "Koora", "hiragana": "コーラ"}, {"romaji": "Nomitai", "hiragana": "のみたい"}, {"romaji": "ga", "hiragana": "が"}]'::jsonb),
('s22', 'Televizyon izlemek istiyorum.', '[{"romaji": "Terebi", "hiragana": "テレビ"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Mitai", "hiragana": "みたい"}]'::jsonb, '[{"romaji": "Ongaku", "hiragana": "おんがく"}, {"romaji": "Kikitai", "hiragana": "ききたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s23', 'Film izlemek istiyorum.', '[{"romaji": "Eiga", "hiragana": "えいが"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Mitai", "hiragana": "みたい"}]'::jsonb, '[{"romaji": "Terebi", "hiragana": "テレビ"}, {"romaji": "Kaitai", "hiragana": "かいたい"}, {"romaji": "ga", "hiragana": "が"}]'::jsonb),
('s24', 'Müzik yapmak istiyorum.', '[{"romaji": "Ongaku", "hiragana": "おんがく"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tsukuritai", "hiragana": "つくりたい"}]'::jsonb, '[{"romaji": "Eiga", "hiragana": "えいが"}, {"romaji": "Kikitai", "hiragana": "ききたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s25', 'Film yapmak istiyorum.', '[{"romaji": "Eiga", "hiragana": "えいが"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tsukuritai", "hiragana": "つくりたい"}]'::jsonb, '[{"romaji": "Ongaku", "hiragana": "おんがく"}, {"romaji": "Mitai", "hiragana": "みたい"}, {"romaji": "ga", "hiragana": "が"}]'::jsonb),
('s26', 'Ekmek yapmak istiyorum.', '[{"romaji": "Pan", "hiragana": "パン"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tsukuritai", "hiragana": "つくりたい"}]'::jsonb, '[{"romaji": "Keeki", "hiragana": "ケーキ"}, {"romaji": "Tabetai", "hiragana": "たべたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s27', 'Suşi yapmak istiyorum.', '[{"romaji": "Sushi", "hiragana": "すし"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tsukuritai", "hiragana": "つくりたい"}]'::jsonb, '[{"romaji": "Gohan", "hiragana": "ごはん"}, {"romaji": "Kaitai", "hiragana": "かいたい"}, {"romaji": "ga", "hiragana": "が"}]'::jsonb),
('s28', 'Pasta yapmak istiyorum.', '[{"romaji": "Keeki", "hiragana": "ケーキ"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tsukuritai", "hiragana": "つくりたい"}]'::jsonb, '[{"romaji": "Pan", "hiragana": "パン"}, {"romaji": "Tabetai", "hiragana": "たべたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s29', 'Yemek yapmak istiyorum.', '[{"romaji": "Gohan", "hiragana": "ごはん"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tsukuritai", "hiragana": "つくりたい"}]'::jsonb, '[{"romaji": "Niku", "hiragana": "にく"}, {"romaji": "Nomitai", "hiragana": "のみたい"}, {"romaji": "ga", "hiragana": "が"}]'::jsonb),
('s30', 'Kahve yapmak istiyorum.', '[{"romaji": "Koohii", "hiragana": "コーヒー"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tsukuritai", "hiragana": "つくりたい"}]'::jsonb, '[{"romaji": "Mizu", "hiragana": "みず"}, {"romaji": "Kaitai", "hiragana": "かいたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s31', 'Ekmek yemek istiyorum.', '[{"romaji": "Pan", "hiragana": "パン"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tabetai", "hiragana": "たべたい"}]'::jsonb, '[{"romaji": "Keeki", "hiragana": "ケーキ"}, {"romaji": "Tsukuritai", "hiragana": "つくりたい"}, {"romaji": "de", "hiragana": "で"}]'::jsonb),
('s32', 'Suşi yemek istiyorum.', '[{"romaji": "Sushi", "hiragana": "すし"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tabetai", "hiragana": "たべたい"}]'::jsonb, '[{"romaji": "Gohan", "hiragana": "ごはん"}, {"romaji": "Kaitai", "hiragana": "かいたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s33', 'Pasta yemek istiyorum.', '[{"romaji": "Keeki", "hiragana": "ケーキ"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tabetai", "hiragana": "たべたい"}]'::jsonb, '[{"romaji": "Pan", "hiragana": "パン"}, {"romaji": "Tsukuritai", "hiragana": "つくりたい"}, {"romaji": "ga", "hiragana": "が"}]'::jsonb),
('s34', 'Et yemek istiyorum.', '[{"romaji": "Niku", "hiragana": "にく"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tabetai", "hiragana": "たべたい"}]'::jsonb, '[{"romaji": "Tamago", "hiragana": "たまご"}, {"romaji": "Kaitai", "hiragana": "かいたい"}, {"romaji": "de", "hiragana": "で"}]'::jsonb),
('s35', 'Yumurta yemek istiyorum.', '[{"romaji": "Tamago", "hiragana": "たまご"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tabetai", "hiragana": "たべたい"}]'::jsonb, '[{"romaji": "Niku", "hiragana": "にく"}, {"romaji": "Tsukuritai", "hiragana": "つくりたい"}, {"romaji": "ni", "hiragana": "に"}]'::jsonb),
('s36', 'Yemek yemek istiyorum.', '[{"romaji": "Gohan", "hiragana": "ごはん"}, {"romaji": "o", "hiragana": "を"}, {"romaji": "Tabetai", "hiragana": "たべたい"}]'::jsonb, '[{"romaji": "Sushi", "hiragana": "すし"}, {"romaji": "Kaitai", "hiragana": "かいたい"}, {"romaji": "ga", "hiragana": "が"}]'::jsonb);


-- ==========================================
-- 8. KAHOOT CLONE (Live Multiplayer Game)
-- ==========================================

CREATE TABLE public.game_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'waiting', -- waiting, playing, finished
  current_question_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  score int DEFAULT 0,
  joined_at timestamptz DEFAULT now()
);

ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all game_rooms" ON public.game_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all game_players" ON public.game_players FOR ALL USING (true) WITH CHECK (true);

-- Canlı yayınları devreye alıyoruz (Supabase Realtime WebSockets)
begin;
  -- supabase_realtime yayınına tabloları eklemek (eğer yayın zaten varsa ignore eder, yoksalar ekler)
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.game_rooms;
alter publication supabase_realtime add table public.game_players;
