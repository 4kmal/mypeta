-- =============================================================
-- MyPeta Supabase: Seed Data
-- Run AFTER 01-create-tables.sql
--
-- Contains:
--   - 16 Malaysian states
--   - 20 system polls from data/polls.ts
-- =============================================================


-- =============================================================
-- States (16 Malaysian states & federal territories)
-- =============================================================
INSERT INTO public.states (id, name, display_order) VALUES
    ('perlis', 'Perlis', 1),
    ('kedah', 'Kedah', 2),
    ('penang', 'Pulau Pinang', 3),
    ('perak', 'Perak', 4),
    ('kelantan', 'Kelantan', 5),
    ('terengganu', 'Terengganu', 6),
    ('pahang', 'Pahang', 7),
    ('selangor', 'Selangor', 8),
    ('kualalumpur', 'Kuala Lumpur', 9),
    ('putrajaya', 'Putrajaya', 10),
    ('negerisembilan', 'Negeri Sembilan', 11),
    ('malacca', 'Melaka', 12),
    ('johor', 'Johor', 13),
    ('sabah', 'Sabah', 14),
    ('sarawak', 'Sarawak', 15),
    ('labuan', 'Labuan', 16)
ON CONFLICT (id) DO NOTHING;


-- =============================================================
-- System Polls (from data/polls.ts)
-- Each DO block: insert poll, then insert its options
-- =============================================================

-- Poll 1: Nasi Lemak
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'nasi-lemak-best') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('nasi-lemak-best', 'Is Nasi Lemak the best breakfast in the world?', 'The eternal debate about Malaysia''s national dish', 'food', true, true, '2025-12-31', '2024-01-15')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, absolutely!', '🇲🇾'),
            (v_poll_id, 1, 'No, there are better options', '🌍');
    END IF;
END $$;

-- Poll 2: Toll Abolishment
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'toll-abolishment') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('toll-abolishment', 'Should all highway tolls in Malaysia be abolished?', 'A hot topic affecting daily commuters', 'economy', true, true, '2025-06-30', '2024-01-14')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, abolish all tolls', '🚫'),
            (v_poll_id, 1, 'No, keep tolls for maintenance', '💰');
    END IF;
END $$;

-- Poll 3: Roti Canai vs Prata
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'roti-canai-vs-prata') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('roti-canai-vs-prata', 'Roti Canai or Roti Prata - which name is correct?', 'The naming controversy that divides a nation', 'food', true, true, '2024-01-13')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Roti Canai', '🇲🇾'),
            (v_poll_id, 1, 'Roti Prata', '🇸🇬');
    END IF;
END $$;

-- Poll 4: KL Traffic
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'kl-traffic') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('kl-traffic', 'Is KL traffic worse than Jakarta''s?', 'Battle of Southeast Asian traffic nightmares', 'social', true, true, '2024-01-12')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, KL is worse', '🚗'),
            (v_poll_id, 1, 'No, Jakarta wins', '🏙️');
    END IF;
END $$;

-- Poll 5: Bahasa Malaysia
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'bahasa-importance') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('bahasa-importance', 'Should Bahasa Malaysia be the primary language in all schools?', 'Education and language policy debate', 'politics', true, true, '2024-11-30', '2024-01-11')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, prioritize BM', '📚'),
            (v_poll_id, 1, 'No, maintain multilingual education', '🌐');
    END IF;
END $$;

-- Poll 6: Durian King
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'durian-king') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('durian-king', 'Is Musang King truly the best durian variety?', 'The thorny debate among durian lovers', 'food', true, true, '2024-01-10')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, Musang King is supreme', '👑'),
            (v_poll_id, 1, 'No, other varieties are better', '🌟');
    END IF;
END $$;

-- Poll 7: Public Transport
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'public-transport') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('public-transport', 'Will Malaysia ever have world-class public transport?', 'Hopes and dreams for better connectivity', 'economy', true, true, '2025-12-31', '2024-01-09')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, within 10 years', '🚄'),
            (v_poll_id, 1, 'No, unlikely to happen', '😔');
    END IF;
END $$;

-- Poll 8: Mamak 24/7
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'mamak-24-7') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('mamak-24-7', 'Should all mamak restaurants be 24/7?', 'Late night food culture preservation', 'culture', true, true, '2024-01-08')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, keep them 24/7', '🌙'),
            (v_poll_id, 1, 'No, workers need rest', '😴');
    END IF;
END $$;

-- Poll 9: SG Water Price
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'sg-water-price') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('sg-water-price', 'Should Malaysia increase water price to Singapore?', 'The long-standing water agreement controversy', 'politics', true, true, '2024-12-31', '2024-01-07')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, increase the price', '💧'),
            (v_poll_id, 1, 'No, honor the agreement', '🤝');
    END IF;
END $$;

-- Poll 10: Chili Sauce Debate
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'chili-sauce-debate') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('chili-sauce-debate', 'Which is better: Sambal or Chili Sauce?', 'The condiment that defines your identity', 'food', true, true, '2024-01-06')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Sambal all the way', '🌶️'),
            (v_poll_id, 1, 'Chili sauce is superior', '🍅');
    END IF;
END $$;

-- Poll 11: MRT Coverage
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'mrt-coverage') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('mrt-coverage', 'Should MRT lines reach all states by 2030?', 'Infrastructure expansion dreams', 'economy', true, true, '2025-06-30', '2024-01-05')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, connect all states', '🚇'),
            (v_poll_id, 1, 'No, focus on major cities first', '🏙️');
    END IF;
END $$;

-- Poll 12: Teh Tarik vs Kopi O
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'teh-tarik-vs-kopi') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('teh-tarik-vs-kopi', 'Teh Tarik or Kopi O - which represents Malaysia better?', 'The beverage identity crisis', 'culture', true, true, '2024-01-04')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Teh Tarik', '🍵'),
            (v_poll_id, 1, 'Kopi O', '☕');
    END IF;
END $$;

-- Poll 13: GST Return
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'gst-return') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('gst-return', 'Should GST (Goods and Services Tax) be reintroduced?', 'The taxation system debate', 'politics', true, true, '2024-12-31', '2024-01-03')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, bring back GST', '💳'),
            (v_poll_id, 1, 'No, keep SST', '🚫');
    END IF;
END $$;

-- Poll 14: Weekend Friday
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'weekend-friday') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('weekend-friday', 'Should the weekend be Friday-Saturday nationwide?', 'Work-life balance and religious harmony', 'social', true, true, '2024-01-02')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, align with Middle East', '🕌'),
            (v_poll_id, 1, 'No, keep Saturday-Sunday', '📅');
    END IF;
END $$;

-- Poll 15: Char Kuey Teow
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'char-kuey-teow') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('char-kuey-teow', 'Does Penang have the best Char Kuey Teow in Malaysia?', 'Regional food supremacy battle', 'food', true, true, '2024-08-31', '2024-01-01')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, Penang is #1', '🏝️'),
            (v_poll_id, 1, 'No, other states are better', '🍜');
    END IF;
END $$;

-- Poll 16: English Proficiency
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'english-proficiency') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('english-proficiency', 'Is declining English proficiency a national crisis?', 'Language skills and global competitiveness', 'social', true, true, '2023-12-31')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, it''s a crisis', '⚠️'),
            (v_poll_id, 1, 'No, it''s exaggerated', '✅');
    END IF;
END $$;

-- Poll 17: Anwar PM
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'anwar-pm') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('anwar-pm', 'Will Anwar Ibrahim serve a full term as PM?', 'Political stability predictions', 'politics', true, true, '2024-12-31', '2023-12-30')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, full 5 years', '🗳️'),
            (v_poll_id, 1, 'No, coalition will collapse', '💥');
    END IF;
END $$;

-- Poll 18: Proton Future
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'proton-future') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('proton-future', 'Can Proton compete globally with EVs?', 'National automotive industry future', 'economy', true, true, '2023-12-29')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, Proton can compete', '🚗'),
            (v_poll_id, 1, 'No, too far behind', '⚡');
    END IF;
END $$;

-- Poll 19: Malaysia World Cup
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'malaysia-world-cup') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('malaysia-world-cup', 'Will Malaysia qualify for FIFA World Cup by 2050?', 'Football dreams and national pride', 'culture', true, true, '2024-12-31', '2023-12-28')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, we can make it!', '⚽'),
            (v_poll_id, 1, 'No, unrealistic dream', '🎯');
    END IF;
END $$;

-- Poll 20: Cinema Seat Kicking
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'cinema-seat-kicking') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('cinema-seat-kicking', 'Is seat-kicking at cinemas Malaysia''s #1 social problem?', 'The etiquette issue that unites all Malaysians', 'social', true, true, '2023-12-27')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, it''s a plague', '😤'),
            (v_poll_id, 1, 'No, there are bigger issues', '🤷');
    END IF;
END $$;
