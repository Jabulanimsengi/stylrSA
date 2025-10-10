EXPLAIN (ANALYZE, BUFFERS) SELECT "s"."id", "s"."name", "s"."city", "s"."province", "s"."avgRating", "s"."offersMobile"
FROM "Salon" AS "s"
WHERE "s"."approvalStatus" = 'APPROVED'
ORDER BY "s"."avgRating" DESC
LIMIT 50;
