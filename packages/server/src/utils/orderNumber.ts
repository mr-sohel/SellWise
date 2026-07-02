import { randomBytes } from 'crypto';

export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, ''); // YYMMDD
  const randomSuffix = randomBytes(2).toString('hex').toUpperCase(); // 4 chars
  return `ORD-${dateStr}-${randomSuffix}`;
}