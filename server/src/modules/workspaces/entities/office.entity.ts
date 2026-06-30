import type { IOffice } from '@sams/shared';

export function isOffice(obj: unknown): obj is IOffice {
  if (typeof obj !== 'object' || obj === null) return false;
  const office = obj as Record<string, unknown>;
  return (
    typeof office['id'] === 'string' &&
    typeof office['workspaceId'] === 'string' &&
    typeof office['name'] === 'string' &&
    typeof office['floor'] === 'number'
  );
}
