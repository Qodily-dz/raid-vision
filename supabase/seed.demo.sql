-- =============================================================================
-- Demo content -- OPTIONAL
-- =============================================================================
-- This file is NOT a migration and is never applied by `supabase db push`.
-- It exists so the one-page portfolio has something to show before you add your
-- own work. Run it once from the Supabase SQL editor, after the migration has
-- been applied.
--
-- Nothing here references uploaded media: projects are text-only and gallery
-- items are Instagram permalinks, so there are no broken images. Replace this
-- with your real work as soon as you are ready -- the cleanup note is at the
-- bottom.
--
-- Every statement is idempotent, so running it twice is harmless.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Site settings: fills the hero statement, the About section and the contact
-- channels, which are all empty on a fresh install.
-- -----------------------------------------------------------------------------
update raid_db.site_settings
set
  owner_name = 'Raid',
  tagline_i18n = '{"en":"Filmmaker / Editor / Colourist","fr":"Cin%C3%A9aste / Monteur / %C3%89talonneur","ar":"مصور · مونتير · مدوّن ألوان"}'::jsonb,
  short_intro_i18n = '{"en":"Post-production for films that need to feel lived in, not just watched.","fr":"Post-production pour des films qui doivent se vivre, pas seulement se regarder.","ar":"مونتاج ما بعد الإنتاج لأفلام تُعاش ولا تُشاهد فحسب."}'::jsonb,
  bio_i18n = '{"en":"I edit documentary, commercial and social work.\n\nMost of my projects arrive as a hundred hours of rushes and a sentence about what the film is supposed to feel like. The job is to find that sentence in the footage and build everything else around it: structure first, then pace, then the grade that holds it together.","fr":"Je monte des documentaires, des films publicitaires et des contenus sociaux.\n\nLa plupart de mes projets arrivent sous forme de cent heures de rushes et d''une phrase sur ce que le film doit faire ressentir. Le travail consiste à retrouver cette phrase dans la pellicule et à bâtir le reste autour : la structure d''abord, puis le rythme, puis l''étalonnage qui tient l''ensemble.","ar":"أعمل على مونتاج الأعمال الوثائقية والإعلانية ووسائل التواصل.\n\nمعظم مشاريعي تصل على شكل مئة ساعة من اللقطات الخام وجملة واحدة عن الإحساس الذي يجب أن يثِّره الفيلم. مهمتي هي العثور على تلك الجملة داخل الصورة وبناء كل شيء حولها: البنية أولًا، ثم الإيقاع، ثم التدريج اللوني الذي يجمعها."}'::jsonb,
  location_i18n = '{"en":"Algiers, Algeria","fr":"Alger, Algérie","ar":"الجزائر العاصمة، الجزائر"}'::jsonb,
  email = 'hello@raidvision.studio',
  phone = '+213 555 00 00 00',
  availability_status = 'available',
  seo_title_i18n = '{"en":"Raid VISION — Filmmaker, Editor, Colourist","fr":"Raid VISION — Court métrage, montage et étalonnage","ar":"ريد فيجن — تصوير ومونتاج وتدريج لوني"}'::jsonb,
  seo_description_i18n = '{"en":"Documentary, commercial and social post-production. Editing, colour grading and motion design.","fr":"Post-production documentaire, publicitaire et sociale. Montage, étalonnage et design graphique.","ar":"مونتاج ما بعد الإنتاج للوثائقيات والإعلانات ووسائل التواصل. مونتاج وتدريج لوني وتصميم حركي."}'::jsonb
where singleton;

-- -----------------------------------------------------------------------------
-- Services: one row per service, in landing-page order.
-- -----------------------------------------------------------------------------
insert into raid_db.services (
  slug, name_i18n, short_description_i18n, description_i18n,
  price_type, price, max_price, currency, unit_i18n, featured, sort_order
)
values
  (
    'documentary-editing',
    '{"en":"Documentary editing","fr":"Montage documentaire","ar":"مونتاج وثائقي"}'::jsonb,
    '{"en":"Story-first edits for long-form and archival work.","fr":"Des montages qui servent d''abord l''histoire, y compris avec des archives.","ar":"مونتاج يخدم القصة أولًا، حتى مع المواد الأرشيفية."}'::jsonb,
    '{"en":"Assembly, structure and a full offline pass with you in the room. Includes subtitles, mix preparation and a delivery-ready master.","fr":"Montage, structure et une passe complète hors ligne en votre présence. Sous-titres, préparation du mix et master final.","ar":"تجميع وبنية وتمرير كامل دون اتصال معك. يشمل الترجمة وتجهيز الصوت والنسخة النهائية."}'::jsonb,
    'from', 45000, null, 'DZD', '{}'::jsonb, true, 1
  ),
  (
    'commercial-edit',
    '{"en":"Commercial & brand edit","fr":"Film publicitaire et marque","ar":"مونتاج إعلانات وعلامة تجارية"}'::jsonb,
    '{"en":"Fast turnarounds that still feel considered.","fr":"Des délais courts qui restent soignés.","ar":"مدة تسليم قصيرة دون أن يشعر المشاهد بالاستعجال."}'::jsonb,
    '{"en":"Broadcast-safe finishing, versions for every placement, and clean exports for social cut-downs.","fr":"Finition broadcast, versions pour chaque diffusion et exports propres pour les formats sociaux.","ar":"تشديد مناسب للبث، ونسخ لكل منصة، وتصديرات نظيفة للنسخ الاجتماعية."}'::jsonb,
    'fixed', 65000, null, 'DZD', '{}'::jsonb, true, 2
  ),
  (
    'colour-grading',
    '{"en":"Colour grading","fr":"Étalonnage","ar":"تدريج لوني"}'::jsonb,
    '{"en":"A grade that carries the whole film, not just the shot.","fr":"Un étalonnage qui porte tout le film, pas seulement le plan.","ar":"تدريج يحمل الفيلم كله، لا اللقطة وحدها."}'::jsonb,
    '{"en":"Primary, secondary and film emulation. Delivered in Rec.709, HDR or a custom show LUT.","fr":"Étalonnage primaire, secondaire et émulation argentique. Livrable en Rec.709, HDR ou show LUT sur mesure.","ar":"تدريج أساسي وثانوي ومحاكاة أفلام. يُسلَّم بـ Rec.709 أو HDR أو show LUT مخصص."}'::jsonb,
    'hourly', 4500, null, 'DZD', '{"en":"hour","fr":"heure","ar":"ساعة"}'::jsonb, false, 3
  ),
  (
    'film-production',
    '{"en":"Production & cinematography","fr":"Production et cinématographie","ar":"إنتاج وتصوير سينمائي"}'::jsonb,
    '{"en":"Small crews, documentary style, light where it matters.","fr":"Petites équipes, style documentaire, de la lumière où il faut.","ar":"طاقم صغير، أسلوب وثائقي، وإضاءة في مكانها."}'::jsonb,
    '{"en":"Direction, camera, sound and lighting for interviews and short work.","fr":"Direction, caméra, son et lumière pour interviews et courts métrages.","ar":"إخراج وتصوير وصوت وإضاءة للمقابلات والأعمال القصيرة."}'::jsonb,
    'daily', 30000, null, 'DZD', '{"en":"day","fr":"journée","ar":"يوم"}'::jsonb, false, 4
  ),
  (
    'motion-design',
    '{"en":"Motion design & titles","fr":"Design graphique et génériques","ar":"تصميم حركي وعناوين"}'::jsonb,
    '{"en":"Titles that belong to the film, not a template pack.","fr":"Des génériques qui appartiennent au film, pas à un kit.","ar":"عناوين تنتمي إلى الفيلم، لا إلى قالب جاهز."}'::jsonb,
    '{"en":"Typography, kinetic text and graphics built to your grade and language mix.","fr":"Typographie, texte animé et graphismes adaptés à votre étalonnage et à vos langues.","ar":"طباعة ونص متحرك ورسوم مبنية على تدريجك ولغاتك."}'::jsonb,
    'range', 20000, 50000, 'DZD', '{}'::jsonb, true, 5
  ),
  (
    'vertical-social',
    '{"en":"Vertical & social edits","fr":"Formats verticaux et sociaux","ar":"مونتاج عمودي ووسائل التواصل"}'::jsonb,
    '{"en":"Cut-downs that hold attention without shouting.","fr":"Des formats courts qui retiennent sans crier.","ar":"نسخ قصيرة تحافظ على الانتباه دون صراخ."}'::jsonb,
    '{"en":"Reframing, captions and pacing for vertical delivery. Volume work welcome.","fr":"Recadrage, sous-titres et rythme pour le vertical. Volumes bienvenus.","ar":"إعادة تأطير وترجمة وإيقاع للتسليم العمودي. الترحيب بالكميات الكبيرة."}'::jsonb,
    'from', 8000, null, 'DZD', '{}'::jsonb, false, 6
  )
on conflict (slug) do update set
  name_i18n = excluded.name_i18n,
  short_description_i18n = excluded.short_description_i18n,
  description_i18n = excluded.description_i18n,
  price_type = excluded.price_type,
  price = excluded.price,
  max_price = excluded.max_price,
  currency = excluded.currency,
  unit_i18n = excluded.unit_i18n,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- Projects: published and featured, so the landing page leads with work.
-- Text-only; attach cover media from the admin once you have real files.
-- -----------------------------------------------------------------------------
insert into raid_db.projects (
  slug, title_i18n, summary_i18n, client_name, year,
  status, featured, sort_order, published_at,
  seo_title_i18n, seo_description_i18n
)
values
  (
    'salt-and-silk',
    '{"en":"Salt and Silk","fr":"Sel et Soie","ar":"ملح وحرير"}'::jsonb,
    '{"en":"A short about the last weaver in a coastal town, cut from eleven hours of archive.","fr":"Un court métrage sur la dernière tisserande d''une ville côtière, monté sur onze heures d''archives.","ar":"عمل قصير عن آخر نسيجة في مدينة ساحلية، مُركَّب من إحدى عشرة ساعة من المواد الأرشيفية."}'::jsonb,
    'Self-initiated', 2025, 'published', true, 1, now(),
    '{"en":"Salt and Silk — short film","fr":"Sel et Soie — court métrage","ar":"ملح وحرير — فيلم قصير"}'::jsonb,
    '{"en":"Documentary short edited from eleven hours of archival footage.","fr":"Court documentaire monté sur onze heures d''archives.","ar":"فيلم وثائقي قصير مُركَّب من إحدى عشرة ساعة من المواد الأرشيفية."}'::jsonb
  ),
  (
    'night-shift',
    '{"en":"Night Shift","fr":"Équipe de nuit","ar":"الوردية الليلية"}'::jsonb,
    '{"en":"Thirty seconds of a city that only exists between midnight and four.","fr":"Trente secondes d''une ville qui n''existe qu''entre minuit et quatre heures.","ar":"ثلاثون ثانية من مدينة لا توجد إلا بين منتصف الليل والرابعة."}'::jsonb,
    'Studio Meridian', 2025, 'published', true, 2, now(),
    '{"en":"Night Shift — commercial","fr":"Équipe de nuit — film publicitaire","ar":"الوردية الليلية — إعلان"}'::jsonb,
    '{"en":"Broadcast commercial for Studio Meridian.","fr":"Film publicitaire pour Studio Meridian.","ar":"إعلان تلفزيوني لـ Studio Meridian."}'::jsonb
  ),
  (
    'the-quiet-hour',
    '{"en":"The Quiet Hour","fr":"L''heure calme","ar":"الساعة الهادئة"}'::jsonb,
    '{"en":"A feature-length essay on waiting, assembled over two years of patient coverage.","fr":"Un essai long sur l''attente, monté sur deux ans de prises patientes.","ar":"مقال طويل عن الانتظار، جُمِع على مدى عامين من التصوير."}'::jsonb,
    'Algeria Film Fund', 2024, 'published', true, 3, now(),
    '{"en":"The Quiet Hour — feature essay","fr":"L''heure calme — essai long","ar":"الساعة الهادئة — فيلم طويل"}'::jsonb,
    '{"en":"Feature-length essay film on waiting.","fr":"Film essai long sur l''attente.","ar":"فيلم طويل عن الانتظار."}'::jsonb
  ),
  (
    'concrete-garden',
    '{"en":"Concrete Garden","fr":"Jardin de béton","ar":"حديقة إسمنتية"}'::jsonb,
    '{"en":"Vertical-first campaign cut for three placements from one shoot day.","fr":"Campagne pensée pour le vertical, déclinée en trois formats depuis une journée de tournage.","ar":"حملة صُممت للعمودي، وُزّعت على ثلاث منصات من يوم تصوير واحد."}'::jsonb,
    'Cercle Studio', 2024, 'published', true, 4, now(),
    '{"en":"Concrete Garden — social campaign","fr":"Jardin de béton — campagne sociale","ar":"حديقة إسمنتية — حملة اجتماعية"}'::jsonb,
    '{"en":"Social campaign edited from a single shoot day.","fr":"Campagne sociale montée sur une journée de tournage.","ar":"حملة اجتماعية مُركَّبة من يوم تصوير واحد."}'::jsonb
  ),
  (
    'low-tide',
    '{"en":"Low Tide","fr":"Marée basse","ar":"مدّ منخفض"}'::jsonb,
    '{"en":"Graded to hold detail in skin and sky at the same time.","fr":"Étalonné pour tenir le détail de la peau et du ciel en même temps.","ar":"مُدرَّج للحفاظ على تفاصيل البشرة والسماء في آن واحد."}'::jsonb,
    'Self-initiated', 2023, 'published', false, 5, now(),
    '{"en":"Low Tide — graded study","fr":"Marée basse — étude étalonnée","ar":"مدّ منخفض — دراسة ملوّنة"}'::jsonb,
    '{"en":"A colour grading study in skin tones.","fr":"Une étude d''étalonnage sur les carnations.","ar":"دراسة في تدريج درجات البشرة."}'::jsonb
  ),
  (
    'letters-home',
    '{"en":"Letters Home","fr":"Lettres à la maison","ar":"رسائل إلى البيت"}'::jsonb,
    '{"en":"Titles and kinetic text for a series of six episodes.","fr":"Génériques et texte animé pour une série de six épisodes.","ar":"عناوين ونص متحرك لمسلسل من ست حلقات."}'::jsonb,
    'Algeria Film Fund', 2023, 'published', false, 6, now(),
    '{"en":"Letters Home — title design","fr":"Lettres à la maison — design de génériques","ar":"رسائل إلى البيت — تصميم عناوين"}'::jsonb,
    '{"en":"Title design for a six-part documentary series.","fr":"Design de génériques pour une série documentaire de six épisodes.","ar":"تصميم عناوين لمسلسل وثائقي من ست حلقات."}'::jsonb
  )
on conflict (slug) do update set
  title_i18n = excluded.title_i18n,
  summary_i18n = excluded.summary_i18n,
  client_name = excluded.client_name,
  year = excluded.year,
  status = excluded.status,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  published_at = excluded.published_at,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- Gallery: Instagram items only. Images and video need real uploads, and
-- `gallery_items_source_check` requires a storage path for those, so seeding
-- them here would only produce broken frames.
--
-- There is no natural key on this table, so the placeholder permalinks are
-- cleared first to keep re-runs from stacking up duplicates.
-- -----------------------------------------------------------------------------
delete from raid_db.gallery_items
where instagram_url = 'https://www.instagram.com/p/XXXXXXXX/';

insert into raid_db.gallery_items (
  item_type, title_i18n, caption_i18n, instagram_url, featured, published, sort_order
)
values
  (
    'instagram',
    '{"en":"Night Shift — grade test","fr":"Équipe de nuit — essai étalonnage","ar":"الوردية الليلية — تجربة تدريج"}'::jsonb,
    '{"en":"Skin tones under sodium light.","fr":"Les carnations sous lumière sodium.","ar":"درجات البشرة تحت ضوء الصوديوم."}'::jsonb,
    'https://www.instagram.com/p/XXXXXXXX/', true, true, 1
  ),
  (
    'instagram',
    '{"en":"Salt and Silk — select","fr":"Sel et Soie — sélection","ar":"ملح وحرير — مختارات"}'::jsonb,
    '{"en":"A frame that held the whole sequence.","fr":"Un plan qui portait toute la séquence.","ar":"لقطة حملت المشهد بأكمله."}'::jsonb,
    'https://www.instagram.com/p/XXXXXXXX/', true, true, 2
  ),
  (
    'instagram',
    '{"en":"Concrete Garden — vertical cut","fr":"Jardin de béton — format vertical","ar":"حديقة إسمنتية — نسخة عمودية"}'::jsonb,
    '{"en":"Reframed for a nine-by-sixteen cut.","fr":"Recadré pour un format neuf par seize.","ar":"أُعيد تأطيره بنسبة 9:16."}'::jsonb,
    'https://www.instagram.com/p/XXXXXXXX/', false, true, 3
  );

-- -----------------------------------------------------------------------------
-- Cleanup: when you are ready to replace this with your own work.
-- -----------------------------------------------------------------------------
-- delete from raid_db.gallery_items
--   where instagram_url = 'https://www.instagram.com/p/XXXXXXXX/';
-- update raid_db.projects set featured = false
--   where client_name in ('Self-initiated', 'Studio Meridian', 'Algeria Film Fund', 'Cercle Studio');
-- delete from raid_db.services;
-- update raid_db.site_settings
--   set owner_name = null,
--       tagline_i18n = '{}'::jsonb,
--       short_intro_i18n = '{}'::jsonb,
--       bio_i18n = '{}'::jsonb,
--       email = null,
--       phone = null
--   where singleton;
-- =============================================================================