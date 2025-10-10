import {
  calculateVisibilityScore,
  compareByVisibilityThenRecency,
} from './visibility';

describe('visibility utils', () => {
  test('calculateVisibilityScore: base weight only', () => {
    expect(calculateVisibilityScore({ visibilityWeight: 1 })).toBe(1);
    expect(calculateVisibilityScore({ visibilityWeight: 4 })).toBe(4);
  });

  test('calculateVisibilityScore: featured boost applied when future', () => {
    const future = new Date(Date.now() + 60_000);
    expect(
      calculateVisibilityScore({ visibilityWeight: 2, featuredUntil: future }),
    ).toBe(12);
  });

  test('compareByVisibilityThenRecency sorts by score then createdAt desc', () => {
    const now = new Date();
    const items = [
      {
        visibilityWeight: 1,
        featuredUntil: null,
        createdAt: new Date(now.getTime() - 1000),
      },
      {
        visibilityWeight: 3,
        featuredUntil: null,
        createdAt: new Date(now.getTime() - 5000),
      },
      {
        visibilityWeight: 2,
        featuredUntil: new Date(now.getTime() + 60_000),
        createdAt: new Date(now.getTime() - 2000),
      },
    ];
    const sorted = items.sort(compareByVisibilityThenRecency);
    // item with featured boost wins (2 + 10 = 12)
    expect(sorted[0].visibilityWeight).toBe(2);
    // next is weight 3 (score = 3)
    expect(sorted[1].visibilityWeight).toBe(3);
    // last is weight 1
    expect(sorted[2].visibilityWeight).toBe(1);
  });
});
