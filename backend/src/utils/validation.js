/**
 * Parse a route param as an integer id. Returns null (instead of NaN) when
 * the param is missing/malformed, so callers can 400 before hitting Prisma
 * (an `id: NaN` where-clause otherwise throws a raw Prisma error).
 */
export const parseIntParam = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};
