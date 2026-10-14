-- ==============================================================================
-- Up Speaking Placement Test System - Database Seeder
-- Reference: docs/TECHNICAL_SPEC.md (Section 12.2)
-- ==============================================================================

-- 1. Sample Students for Testing
INSERT INTO public.students (id, full_name, phone_number, target_level)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Budi Santoso', '081234567890', 'ELEMENTARY'),
  ('22222222-2222-2222-2222-222222222222', 'Siti Rahmawati', '089876543210', 'HIGH_SCHOOL')
ON CONFLICT (id) DO NOTHING;

-- 2. Bank Soal ELEMENTARY (SD) - 10 Butir Soal dengan 4 Opsi
-- Q1
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000001', 'ELEMENTARY', 'What is the color of the sun?', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000001', 'Yellow', true, 1),
  ('e1111111-0000-0000-0000-000000000001', 'Blue', false, 2),
  ('e1111111-0000-0000-0000-000000000001', 'Green', false, 3),
  ('e1111111-0000-0000-0000-000000000001', 'Purple', false, 4)
ON CONFLICT DO NOTHING;

-- Q2
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000002', 'ELEMENTARY', 'My sister ... an apple every morning.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000002', 'eat', false, 1),
  ('e1111111-0000-0000-0000-000000000002', 'eats', true, 2),
  ('e1111111-0000-0000-0000-000000000002', 'eating', false, 3),
  ('e1111111-0000-0000-0000-000000000002', 'ate', false, 4)
ON CONFLICT DO NOTHING;

-- Q3
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000003', 'ELEMENTARY', 'How many days are there in a week?', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000003', 'Five', false, 1),
  ('e1111111-0000-0000-0000-000000000003', 'Six', false, 2),
  ('e1111111-0000-0000-0000-000000000003', 'Seven', true, 3),
  ('e1111111-0000-0000-0000-000000000003', 'Eight', false, 4)
ON CONFLICT DO NOTHING;

-- Q4
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000004', 'ELEMENTARY', 'Where do you go to borrow books?', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000004', 'Hospital', false, 1),
  ('e1111111-0000-0000-0000-000000000004', 'Library', true, 2),
  ('e1111111-0000-0000-0000-000000000004', 'Cinema', false, 3),
  ('e1111111-0000-0000-0000-000000000004', 'Market', false, 4)
ON CONFLICT DO NOTHING;

-- Q5
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000005', 'ELEMENTARY', 'The elephant is ... than the cat.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000005', 'big', false, 1),
  ('e1111111-0000-0000-0000-000000000005', 'bigger', true, 2),
  ('e1111111-0000-0000-0000-000000000005', 'biggest', false, 3),
  ('e1111111-0000-0000-0000-000000000005', 'more big', false, 4)
ON CONFLICT DO NOTHING;

-- Q6
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000006', 'ELEMENTARY', 'Choose the correct greeting for 8:00 AM:', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000006', 'Good morning', true, 1),
  ('e1111111-0000-0000-0000-000000000006', 'Good afternoon', false, 2),
  ('e1111111-0000-0000-0000-000000000006', 'Good evening', false, 3),
  ('e1111111-0000-0000-0000-000000000006', 'Good night', false, 4)
ON CONFLICT DO NOTHING;

-- Q7
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000007', 'ELEMENTARY', 'They ... playing football in the field right now.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000007', 'is', false, 1),
  ('e1111111-0000-0000-0000-000000000007', 'am', false, 2),
  ('e1111111-0000-0000-0000-000000000007', 'are', true, 3),
  ('e1111111-0000-0000-0000-000000000007', 'be', false, 4)
ON CONFLICT DO NOTHING;

-- Q8
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000008', 'ELEMENTARY', 'What do birds use to fly?', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000008', 'Fins', false, 1),
  ('e1111111-0000-0000-0000-000000000008', 'Wings', true, 2),
  ('e1111111-0000-0000-0000-000000000008', 'Arms', false, 3),
  ('e1111111-0000-0000-0000-000000000008', 'Tails', false, 4)
ON CONFLICT DO NOTHING;

-- Q9
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000009', 'ELEMENTARY', 'This is my bag. That bag over there is ...', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000009', 'your', false, 1),
  ('e1111111-0000-0000-0000-000000000009', 'yours', true, 2),
  ('e1111111-0000-0000-0000-000000000009', 'you', false, 3),
  ('e1111111-0000-0000-0000-000000000009', 'yourself', false, 4)
ON CONFLICT DO NOTHING;

-- Q10
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000010', 'ELEMENTARY', 'Yesterday, I ... a new pencil case at the store.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000010', 'buy', false, 1),
  ('e1111111-0000-0000-0000-000000000010', 'bought', true, 2),
  ('e1111111-0000-0000-0000-000000000010', 'buys', false, 3),
  ('e1111111-0000-0000-0000-000000000010', 'buying', false, 4)
ON CONFLICT DO NOTHING;


-- 3. Bank Soal HIGH SCHOOL (SMP/SMA) - 10 Butir Soal dengan 4 Opsi
-- Q1
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000001', 'HIGH_SCHOOL', 'If it rains tomorrow, we ... the outdoor workshop.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000001', 'cancel', false, 1),
  ('c1111111-0000-0000-0000-000000000001', 'will cancel', true, 2),
  ('c1111111-0000-0000-0000-000000000001', 'would cancel', false, 3),
  ('c1111111-0000-0000-0000-000000000001', 'had cancelled', false, 4)
ON CONFLICT DO NOTHING;

-- Q2
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000002', 'HIGH_SCHOOL', 'The research paper ... by the professor before the symposium began.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000002', 'had been reviewed', true, 1),
  ('c1111111-0000-0000-0000-000000000002', 'has reviewed', false, 2),
  ('c1111111-0000-0000-0000-000000000002', 'was reviewing', false, 3),
  ('c1111111-0000-0000-0000-000000000002', 'reviews', false, 4)
ON CONFLICT DO NOTHING;

-- Q3
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000003', 'HIGH_SCHOOL', 'Despite the heavy rain, the students continued their community service. The word "Despite" means ...', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000003', 'Because of', false, 1),
  ('c1111111-0000-0000-0000-000000000003', 'In spite of', true, 2),
  ('c1111111-0000-0000-0000-000000000003', 'Therefore', false, 3),
  ('c1111111-0000-0000-0000-000000000003', 'Moreover', false, 4)
ON CONFLICT DO NOTHING;

-- Q4
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000004', 'HIGH_SCHOOL', 'Neither the teacher nor the students ... satisfied with the sudden schedule change.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000004', 'was', false, 1),
  ('c1111111-0000-0000-0000-000000000004', 'were', true, 2),
  ('c1111111-0000-0000-0000-000000000004', 'is', false, 3),
  ('c1111111-0000-0000-0000-000000000004', 'be', false, 4)
ON CONFLICT DO NOTHING;

-- Q5
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000005', 'HIGH_SCHOOL', 'She has lived in Jakarta ... more than a decade.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000005', 'since', false, 1),
  ('c1111111-0000-0000-0000-000000000005', 'for', true, 2),
  ('c1111111-0000-0000-0000-000000000005', 'during', false, 3),
  ('c1111111-0000-0000-0000-000000000005', 'from', false, 4)
ON CONFLICT DO NOTHING;

-- Q6
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000006', 'HIGH_SCHOOL', 'The scientist ... discovery revolutionized renewable energy was awarded the Nobel Prize.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000006', 'who', false, 1),
  ('c1111111-0000-0000-0000-000000000006', 'whom', false, 2),
  ('c1111111-0000-0000-0000-000000000006', 'whose', true, 3),
  ('c1111111-0000-0000-0000-000000000006', 'which', false, 4)
ON CONFLICT DO NOTHING;

-- Q7
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000007', 'HIGH_SCHOOL', 'You should avoid ... unnecessary risks when conducting chemical experiments.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000007', 'take', false, 1),
  ('c1111111-0000-0000-0000-000000000007', 'to take', false, 2),
  ('c1111111-0000-0000-0000-000000000007', 'taking', true, 3),
  ('c1111111-0000-0000-0000-000000000007', 'taken', false, 4)
ON CONFLICT DO NOTHING;

-- Q8
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000008', 'HIGH_SCHOOL', 'Had they known about the traffic jam, they ... an alternative route.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000008', 'would take', false, 1),
  ('c1111111-0000-0000-0000-000000000008', 'would have taken', true, 2),
  ('c1111111-0000-0000-0000-000000000008', 'will take', false, 3),
  ('c1111111-0000-0000-0000-000000000008', 'had taken', false, 4)
ON CONFLICT DO NOTHING;

-- Q9
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000009', 'HIGH_SCHOOL', 'The term "meticulous" is closest in meaning to:', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000009', 'Careful and precise', true, 1),
  ('c1111111-0000-0000-0000-000000000009', 'Fast and energetic', false, 2),
  ('c1111111-0000-0000-0000-000000000009', 'Careless and sloppy', false, 3),
  ('c1111111-0000-0000-0000-000000000009', 'Hesitant and doubtful', false, 4)
ON CONFLICT DO NOTHING;

-- Q10
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000010', 'HIGH_SCHOOL', 'Not only ... the English debate championship, but they also won the best speaker award.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000010', 'they won', false, 1),
  ('c1111111-0000-0000-0000-000000000010', 'did they win', true, 2),
  ('c1111111-0000-0000-0000-000000000010', 'they have won', false, 3),
  ('c1111111-0000-0000-0000-000000000010', 'won they', false, 4)
ON CONFLICT DO NOTHING;
