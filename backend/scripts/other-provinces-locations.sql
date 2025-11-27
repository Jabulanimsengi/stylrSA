-- Add locations for Eastern Cape, Free State, Limpopo, Mpumalanga, North West, Northern Cape
-- Run this in Supabase SQL Editor

-- ==================== EASTERN CAPE ====================
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  -- Buffalo City
  (gen_random_uuid(), 'East London', 'east-london', 'CITY', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Gonubie', 'gonubie', 'SUBURB', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Beacon Bay', 'beacon-bay', 'SUBURB', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Nahoon', 'nahoon', 'SUBURB', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Vincent', 'vincent', 'SUBURB', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Mdantsane', 'mdantsane', 'SUBURB', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Bisho', 'bisho', 'SUBURB', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'King Williams Town', 'king-williams-town', 'TOWN', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  -- Nelson Mandela Bay
  (gen_random_uuid(), 'Port Elizabeth', 'port-elizabeth', 'CITY', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Gqeberha', 'gqeberha', 'CITY', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Summerstrand', 'summerstrand', 'SUBURB', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Walmer', 'walmer', 'SUBURB', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Humewood', 'humewood', 'SUBURB', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Lorraine', 'lorraine', 'SUBURB', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Motherwell', 'motherwell', 'SUBURB', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'New Brighton', 'new-brighton', 'SUBURB', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Uitenhage', 'uitenhage', 'TOWN', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Kariega', 'kariega', 'TOWN', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Despatch', 'despatch', 'TOWN', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  -- Other Eastern Cape
  (gen_random_uuid(), 'Makhanda', 'makhanda', 'CITY', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Grahamstown', 'grahamstown', 'CITY', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Jeffreys Bay', 'jeffreys-bay', 'TOWN', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'St Francis Bay', 'st-francis-bay', 'TOWN', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Mthatha', 'mthatha', 'CITY', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Queenstown', 'queenstown', 'TOWN', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Komani', 'komani', 'TOWN', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Bedford', 'bedford', 'TOWN', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Alice', 'alice', 'TOWN', 'Eastern Cape', 'eastern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Fort Beaufort', 'fort-beaufort', 'TOWN', 'Eastern Cape', 'eastern-cape', NOW(), NOW())
ON CONFLICT DO NOTHING;


-- ==================== FREE STATE ====================
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  -- Mangaung (Bloemfontein)
  (gen_random_uuid(), 'Bloemfontein Central', 'bloemfontein-central', 'SUBURB', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Universitas', 'universitas', 'SUBURB', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Langenhoven Park', 'langenhoven-park', 'SUBURB', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Westdene', 'westdene', 'SUBURB', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Dan Pienaar', 'dan-pienaar', 'SUBURB', 'Free State', 'free-state', NOW(), NOW()),
  -- Matjhabeng (Welkom)
  (gen_random_uuid(), 'Welkom', 'welkom', 'CITY', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Riebeeckstad', 'riebeeckstad', 'SUBURB', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Dagbreek', 'dagbreek', 'SUBURB', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Thabong', 'thabong', 'SUBURB', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Virginia', 'virginia', 'TOWN', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Odendaalsrus', 'odendaalsrus', 'TOWN', 'Free State', 'free-state', NOW(), NOW()),
  -- Metsimaholo
  (gen_random_uuid(), 'Sasolburg', 'sasolburg', 'TOWN', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Vaalpark', 'vaalpark', 'SUBURB', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Deneysville', 'deneysville', 'TOWN', 'Free State', 'free-state', NOW(), NOW()),
  -- Other Free State
  (gen_random_uuid(), 'Bethlehem', 'bethlehem', 'TOWN', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Clarens', 'clarens', 'TOWN', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Parys', 'parys', 'TOWN', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Kroonstad', 'kroonstad', 'TOWN', 'Free State', 'free-state', NOW(), NOW()),
  (gen_random_uuid(), 'Harrismith', 'harrismith', 'TOWN', 'Free State', 'free-state', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ==================== LIMPOPO ====================
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  -- Polokwane
  (gen_random_uuid(), 'Polokwane Central', 'polokwane-central', 'SUBURB', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Bendor', 'bendor', 'SUBURB', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Flora Park', 'flora-park', 'SUBURB', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Welgelegen', 'welgelegen', 'SUBURB', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Seshego', 'seshego', 'SUBURB', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Mankweng', 'mankweng', 'SUBURB', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Turfloop', 'turfloop', 'SUBURB', 'Limpopo', 'limpopo', NOW(), NOW()),
  -- Other Limpopo
  (gen_random_uuid(), 'Lebowakgomo', 'lebowakgomo', 'TOWN', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Thohoyandou', 'thohoyandou', 'TOWN', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Sibasa', 'sibasa', 'SUBURB', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Tzaneen', 'tzaneen', 'TOWN', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Nkowankowa', 'nkowankowa', 'SUBURB', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Phalaborwa', 'phalaborwa', 'TOWN', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Mokopane', 'mokopane', 'TOWN', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Mahwelereng', 'mahwelereng', 'SUBURB', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Bela-Bela', 'bela-bela', 'TOWN', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Warmbaths', 'warmbaths', 'TOWN', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Lephalale', 'lephalale', 'TOWN', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Louis Trichardt', 'louis-trichardt', 'TOWN', 'Limpopo', 'limpopo', NOW(), NOW()),
  (gen_random_uuid(), 'Makhado', 'makhado', 'TOWN', 'Limpopo', 'limpopo', NOW(), NOW())
ON CONFLICT DO NOTHING;


-- ==================== MPUMALANGA ====================
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  -- Mbombela (Nelspruit)
  (gen_random_uuid(), 'Nelspruit', 'nelspruit', 'CITY', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Mbombela', 'mbombela', 'CITY', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'West Acres', 'west-acres', 'SUBURB', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Steiltes', 'steiltes', 'SUBURB', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Sonheuwel', 'sonheuwel', 'SUBURB', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'White River', 'white-river', 'TOWN', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Hazyview', 'hazyview', 'TOWN', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'KaNyamazane', 'kanyamazane', 'SUBURB', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  -- Bushbuckridge
  (gen_random_uuid(), 'Bushbuckridge', 'bushbuckridge', 'TOWN', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Thulamahashe', 'thulamahashe', 'SUBURB', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Acornhoek', 'acornhoek', 'SUBURB', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  -- Emalahleni (Witbank)
  (gen_random_uuid(), 'Witbank', 'witbank', 'CITY', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Emalahleni', 'emalahleni', 'CITY', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Reyno Ridge', 'reyno-ridge', 'SUBURB', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Highveld Park', 'highveld-park', 'SUBURB', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'KwaGuqa', 'kwaguqa', 'SUBURB', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  -- Steve Tshwete (Middelburg)
  (gen_random_uuid(), 'Middelburg', 'middelburg', 'TOWN', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Aerorand', 'aerorand', 'SUBURB', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Mhluzi', 'mhluzi', 'SUBURB', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  -- Govan Mbeki
  (gen_random_uuid(), 'Secunda', 'secunda', 'TOWN', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Trichardt', 'trichardt', 'TOWN', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Bethal', 'bethal', 'TOWN', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Embalenhle', 'embalenhle', 'SUBURB', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Lydenburg', 'lydenburg', 'TOWN', 'Mpumalanga', 'mpumalanga', NOW(), NOW()),
  (gen_random_uuid(), 'Mashishing', 'mashishing', 'TOWN', 'Mpumalanga', 'mpumalanga', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ==================== NORTH WEST ====================
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  -- Mahikeng
  (gen_random_uuid(), 'Mafikeng', 'mafikeng', 'CITY', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Mmabatho', 'mmabatho', 'CITY', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Montshiwa', 'montshiwa', 'SUBURB', 'North West', 'north-west', NOW(), NOW()),
  -- Rustenburg
  (gen_random_uuid(), 'Rustenburg CBD', 'rustenburg-cbd', 'SUBURB', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Geelhoutpark', 'geelhoutpark', 'SUBURB', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Protea Park', 'protea-park', 'SUBURB', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Waterfall East', 'waterfall-east', 'SUBURB', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Tlhabane', 'tlhabane', 'SUBURB', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Marikana', 'marikana', 'TOWN', 'North West', 'north-west', NOW(), NOW()),
  -- Madibeng
  (gen_random_uuid(), 'Brits', 'brits', 'TOWN', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Hartbeespoort', 'hartbeespoort', 'TOWN', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Schoemansville', 'schoemansville', 'SUBURB', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Mooinooi', 'mooinooi', 'TOWN', 'North West', 'north-west', NOW(), NOW()),
  -- JB Marks (Potchefstroom)
  (gen_random_uuid(), 'Potchefstroom', 'potchefstroom', 'CITY', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Die Bult', 'die-bult', 'SUBURB', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Baillie Park', 'baillie-park', 'SUBURB', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Ikageng', 'ikageng', 'SUBURB', 'North West', 'north-west', NOW(), NOW()),
  -- Matlosana (Klerksdorp)
  (gen_random_uuid(), 'Klerksdorp', 'klerksdorp', 'CITY', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Wilkoppies', 'wilkoppies', 'SUBURB', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Orkney', 'orkney', 'TOWN', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Stilfontein', 'stilfontein', 'TOWN', 'North West', 'north-west', NOW(), NOW()),
  (gen_random_uuid(), 'Jouberton', 'jouberton', 'SUBURB', 'North West', 'north-west', NOW(), NOW())
ON CONFLICT DO NOTHING;


-- ==================== NORTHERN CAPE ====================
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  -- Sol Plaatje (Kimberley)
  (gen_random_uuid(), 'Kimberley Central', 'kimberley-central', 'SUBURB', 'Northern Cape', 'northern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Hadison Park', 'hadison-park', 'SUBURB', 'Northern Cape', 'northern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Monument Heights', 'monument-heights', 'SUBURB', 'Northern Cape', 'northern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Galeshewe', 'galeshewe', 'SUBURB', 'Northern Cape', 'northern-cape', NOW(), NOW()),
  -- Other Northern Cape
  (gen_random_uuid(), 'Upington', 'upington', 'TOWN', 'Northern Cape', 'northern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Kuruman', 'kuruman', 'TOWN', 'Northern Cape', 'northern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Springbok', 'springbok', 'TOWN', 'Northern Cape', 'northern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'De Aar', 'de-aar', 'TOWN', 'Northern Cape', 'northern-cape', NOW(), NOW()),
  (gen_random_uuid(), 'Calvinia', 'calvinia', 'TOWN', 'Northern Cape', 'northern-cape', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ==================== VERIFY COUNTS ====================
SELECT 
  province_slug,
  COUNT(*) as total_locations,
  COUNT(CASE WHEN type = 'CITY' THEN 1 END) as cities,
  COUNT(CASE WHEN type = 'TOWN' THEN 1 END) as towns,
  COUNT(CASE WHEN type = 'SUBURB' THEN 1 END) as suburbs,
  COUNT(CASE WHEN type = 'TOWNSHIP' THEN 1 END) as townships
FROM seo_locations
GROUP BY province_slug
ORDER BY total_locations DESC;
