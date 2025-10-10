import { PrismaClient } from '@prisma/client';

type PlanStats = {
  nodeType: string;
  relationName?: string;
  indexName?: string;
  actualRows?: number;
  actualTotalTime?: number;
};

const prisma = new PrismaClient();

function collectPlanStats(plan: Record<string, any>, acc: PlanStats[] = []) {
  if (!plan) {
    return acc;
  }

  acc.push({
    nodeType: plan['Node Type'],
    relationName: plan['Relation Name'],
    indexName: plan['Index Name'],
    actualRows: plan['Actual Rows'],
    actualTotalTime: plan['Actual Total Time'],
  });

  const children = plan['Plans'];
  if (Array.isArray(children)) {
    for (const child of children) {
      collectPlanStats(child, acc);
    }
  }

  return acc;
}

async function explainQuery(label: string, sql: string) {
  const rawResult = await prisma.$queryRawUnsafe<any[]>(
    `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`,
  );

  if (!Array.isArray(rawResult) || rawResult.length === 0) {
    throw new Error(`Unexpected EXPLAIN output for ${label}`);
  }

  const explainRoot = rawResult[0]?.['QUERY PLAN']?.[0];
  if (!explainRoot) {
    throw new Error(`Missing QUERY PLAN for ${label}`);
  }

  const plan = explainRoot['Plan'];
  const planningTime = explainRoot['Planning Time'] as number | undefined;
  const executionTime = explainRoot['Execution Time'] as number | undefined;

  const stats = collectPlanStats(plan);

  const tableScans = stats.filter((s) => s.relationName);
  const indexScans = stats.filter((s) => s.indexName);

  return {
    label,
    planningTimeMs: planningTime,
    executionTimeMs: executionTime,
    rootNode: {
      type: plan['Node Type'],
      actualRows: plan['Actual Rows'],
      actualTotalTime: plan['Actual Total Time'],
    },
    tableScans,
    indexScans,
  };
}

async function run() {
  const queries = [
    {
      label: 'salon-list',
      sql: `SELECT "s"."id", "s"."name", "s"."city", "s"."province", "s"."avgRating", "s"."offersMobile"
            FROM "Salon" AS "s"
            WHERE "s"."approvalStatus" = 'APPROVED'
            ORDER BY "s"."avgRating" DESC
            LIMIT 50`,
    },
    {
      label: 'product-list',
      sql: `SELECT "p"."id", "p"."name", "p"."price", "p"."approvalStatus", "p"."createdAt",
                   "u"."firstName", "u"."lastName"
            FROM "Product" AS "p"
            LEFT JOIN "User" AS "u" ON "u"."id" = "p"."sellerId"
            WHERE "p"."approvalStatus" = 'APPROVED'
            ORDER BY "p"."createdAt" DESC
            LIMIT 50`,
    },
  ];

  for (const { label, sql } of queries) {
    // eslint-disable-next-line no-console
    console.log(`\n=== ${label} ===`);
    const result = await explainQuery(label, sql);
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify(
        {
          planningTimeMs: result.planningTimeMs,
          executionTimeMs: result.executionTimeMs,
          rootNode: result.rootNode,
          tableScans: result.tableScans,
          indexScans: result.indexScans,
        },
        null,
        2,
      ),
    );
  }
}

run()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Query profiling failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });