export type VisibilityInput = {
  visibilityWeight?: number | null;
  featuredUntil?: Date | string | null;
  createdAt?: Date | string;
};

export function calculateVisibilityScore(input: VisibilityInput): number {
  const w = Number(input.visibilityWeight ?? 1) || 1;
  const until = input.featuredUntil
    ? new Date(input.featuredUntil).getTime()
    : 0;
  const boost = until > Date.now() ? 10 : 0;
  return w + boost;
}

export function compareByVisibilityThenRecency<
  A extends VisibilityInput,
  B extends VisibilityInput,
>(a: A, b: B): number {
  const sv = calculateVisibilityScore(b) - calculateVisibilityScore(a);
  if (sv !== 0) return sv;
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return bTime - aTime;
}
