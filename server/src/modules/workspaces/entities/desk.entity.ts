import type { IDesk } from '@sams/shared';

export function isDesk(obj: unknown): obj is IDesk {
  if (typeof obj !== 'object' || obj === null) return false;
  const desk = obj as Record<string, unknown>;
  return (
    typeof desk['id'] === 'string' &&
    typeof desk['officeId'] === 'string' &&
    typeof desk['name'] === 'string' &&
    typeof desk['isOccupied'] === 'boolean'
  );
}
