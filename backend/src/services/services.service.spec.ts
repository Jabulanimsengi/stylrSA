import { ServicesService } from './services.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ServicesService ordering by visibility', () => {
  let service: ServicesService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      service: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    } as any;
    service = new ServicesService(prisma);
  });

  test('findFeatured returns top 5 by salon visibility + featured boost', async () => {
    const now = Date.now();
    (prisma.service.findMany as any).mockResolvedValue([
      {
        id: 'a',
        createdAt: new Date(now - 5000),
        salon: { visibilityWeight: 1, featuredUntil: null },
      },
      {
        id: 'b',
        createdAt: new Date(now - 4000),
        salon: { visibilityWeight: 3, featuredUntil: null },
      },
      {
        id: 'c',
        createdAt: new Date(now - 3000),
        salon: { visibilityWeight: 2, featuredUntil: new Date(now + 60000) },
      },
      {
        id: 'd',
        createdAt: new Date(now - 2000),
        salon: { visibilityWeight: 5, featuredUntil: null },
      },
      {
        id: 'e',
        createdAt: new Date(now - 1000),
        salon: { visibilityWeight: 1, featuredUntil: new Date(now + 60000) },
      },
      {
        id: 'f',
        createdAt: new Date(now - 8000),
        salon: { visibilityWeight: 4, featuredUntil: null },
      },
    ] as any);

    const result = await service.findFeatured();
    expect(result).toHaveLength(5);
    // First should be with featured boost (visibility 2 + 10 = 12) => id 'c'
    expect(result[0].id).toBe('c');
    // Second featured with weight 1 + 10 = 11 => 'e'
    expect(result[1].id).toBe('e');
    // Then by weight: 5, 4, 3 (d, f, b)
    expect(result.slice(2).map((s) => s.id)).toEqual(['d', 'f', 'b']);
  });

  test('findAllApproved ranks globally before pagination', async () => {
    const now = Date.now();
    // Six services across different salons; only future featured get boost
    (prisma.service.findMany as any).mockResolvedValue([
      {
        id: 'a',
        createdAt: new Date(now - 6000),
        salon: { visibilityWeight: 1, featuredUntil: null },
      }, // score 1
      {
        id: 'b',
        createdAt: new Date(now - 5000),
        salon: { visibilityWeight: 3, featuredUntil: null },
      }, // 3
      {
        id: 'c',
        createdAt: new Date(now - 4000),
        salon: { visibilityWeight: 2, featuredUntil: new Date(now + 60000) },
      }, // 12 (boost)
      {
        id: 'd',
        createdAt: new Date(now - 3000),
        salon: { visibilityWeight: 5, featuredUntil: null },
      }, // 5
      {
        id: 'e',
        createdAt: new Date(now - 2000),
        salon: { visibilityWeight: 1, featuredUntil: new Date(now + 60000) },
      }, // 11
      {
        id: 'f',
        createdAt: new Date(now - 1000),
        salon: { visibilityWeight: 4, featuredUntil: null },
      }, // 4
    ] as any);

    const page1 = await service.findAllApproved(1, 3);
    expect(page1.services.map((s) => s.id)).toEqual(['c', 'e', 'd']);
    expect(page1.currentPage).toBe(1);
    expect(page1.totalPages).toBe(2);

    const page2 = await service.findAllApproved(2, 3);
    expect(page2.services.map((s) => s.id)).toEqual(['f', 'b', 'a']);
  });
});
