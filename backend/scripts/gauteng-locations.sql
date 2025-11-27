-- Add all missing Gauteng locations
-- Run this in Supabase SQL Editor

-- Main Places (Cities/Towns)
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Midrand', 'midrand', 'CITY', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Fourways', 'fourways', 'CITY', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Northcliff', 'northcliff', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Rosebank', 'rosebank', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Krugersdorp', 'krugersdorp', 'CITY', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Randfontein', 'randfontein', 'CITY', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Westonaria', 'westonaria', 'TOWN', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Vanderbijlpark', 'vanderbijlpark', 'CITY', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Vereeniging', 'vereeniging', 'CITY', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Meyerton', 'meyerton', 'TOWN', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Heidelberg', 'heidelberg', 'TOWN', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Springs', 'springs', 'CITY', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Nigel', 'nigel', 'TOWN', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Fochville', 'fochville', 'TOWN', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Akasia', 'akasia', 'TOWN', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;


-- Midrand suburbs
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Halfway House', 'halfway-house', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Carlswald', 'carlswald', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Vorna Valley', 'vorna-valley', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Kyalami', 'kyalami', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Glen Austin', 'glen-austin', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Blue Hills', 'blue-hills', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Ebony Park', 'ebony-park', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Ivory Park', 'ivory-park', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Rabie Ridge', 'rabie-ridge', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Fourways suburbs
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Lonehill', 'lonehill', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Dainfern', 'dainfern', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Broadacres', 'broadacres', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Randburg suburbs
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Ferndale', 'ferndale', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Blairgowrie', 'blairgowrie', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Bordeaux', 'bordeaux', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Fontainebleau', 'fontainebleau', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Randpark Ridge', 'randpark-ridge', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Boskruin', 'boskruin', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Northwold', 'northwold', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Sundowner', 'sundowner', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Olivedale', 'olivedale', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;


-- Northcliff/Rosebank suburbs
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Linden', 'linden', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Greenside', 'greenside', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Emmarentia', 'emmarentia', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Parkhurst', 'parkhurst', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Parktown North', 'parktown-north', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Craighall Park', 'craighall-park', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Illovo', 'illovo', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Hyde Park', 'hyde-park', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Dunkeld', 'dunkeld', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Sandton suburbs
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Morningside', 'morningside', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Bryanston', 'bryanston', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Rivonia', 'rivonia', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Sunninghill', 'sunninghill', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Woodmead', 'woodmead', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Gallo Manor', 'gallo-manor', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Kelvin', 'kelvin', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Buccleuch', 'buccleuch', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Linbro Park', 'linbro-park', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Sandown', 'sandown', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Atholl', 'atholl', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Bramley', 'bramley', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Houghton', 'houghton', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Norwood', 'norwood', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Oaklands', 'oaklands', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;


-- JHB CBD and South suburbs
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Braamfontein', 'braamfontein', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Hillbrow', 'hillbrow', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Yeoville', 'yeoville', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Berea', 'berea', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Cyrildene', 'cyrildene', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Bruma', 'bruma', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Turffontein', 'turffontein', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Rosettenville', 'rosettenville', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Mondeor', 'mondeor', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Glenvista', 'glenvista', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Mulbarton', 'mulbarton', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Kibler Park', 'kibler-park', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Naturena', 'naturena', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Lenasia South', 'lenasia-south', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Eldorado Park', 'eldorado-park', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Roodepoort suburbs
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Florida', 'florida', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Horison', 'horison', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Discovery', 'discovery', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Helderkruin', 'helderkruin', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Weltevreden Park', 'weltevreden-park', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Ruimsig', 'ruimsig', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Cosmo City', 'cosmo-city', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;


-- Soweto suburbs
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Orlando', 'orlando', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Diepkloof', 'diepkloof', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Dobsonville', 'dobsonville', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Meadowlands', 'meadowlands', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Pimville', 'pimville', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Jabulani', 'jabulani', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Zola', 'zola', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Protea Glen', 'protea-glen', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Chiawelo', 'chiawelo', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Pretoria suburbs
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Arcadia', 'arcadia', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Sunnyside', 'sunnyside', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Hatfield', 'hatfield', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Brooklyn', 'brooklyn', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Menlyn', 'menlyn', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Lynnwood', 'lynnwood', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Faerie Glen', 'faerie-glen', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Garsfontein', 'garsfontein', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Moreleta Park', 'moreleta-park', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Waterkloof', 'waterkloof', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Silver Lakes', 'silver-lakes', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Montana', 'montana', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Sinoville', 'sinoville', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Wonderboom', 'wonderboom', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;


-- Centurion suburbs
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Lyttelton', 'lyttelton', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Eldoraigne', 'eldoraigne', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Wierda Park', 'wierda-park', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Rooihuiskraal', 'rooihuiskraal', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Highveld', 'highveld', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Midstream', 'midstream', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Laudium', 'laudium', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Olievenhoutbosch', 'olievenhoutbosch', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Ekurhuleni suburbs (Benoni, Boksburg, etc)
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Northmead', 'northmead', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Rynfield', 'rynfield', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Lakefield', 'lakefield', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Crystal Park', 'crystal-park', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Sunward Park', 'sunward-park', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Parkrand', 'parkrand', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Bartlett', 'bartlett', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Glen Marais', 'glen-marais', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Birchleigh', 'birchleigh', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Rhodesfield', 'rhodesfield', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Brackenhurst', 'brackenhurst', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Meyersdal', 'meyersdal', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- West Rand and Sedibeng
INSERT INTO seo_locations (id, name, slug, type, province, province_slug, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Kagiso', 'kagiso', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Mohlakeng', 'mohlakeng', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Khutsong', 'khutsong', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Sebokeng', 'sebokeng', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Evaton', 'evaton', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Sharpeville', 'sharpeville', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Three Rivers', 'three-rivers', 'SUBURB', 'Gauteng', 'gauteng', NOW(), NOW()),
  (gen_random_uuid(), 'Ratanda', 'ratanda', 'TOWNSHIP', 'Gauteng', 'gauteng', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Verify count
SELECT COUNT(*) as total_gauteng_locations FROM seo_locations WHERE province_slug = 'gauteng';
