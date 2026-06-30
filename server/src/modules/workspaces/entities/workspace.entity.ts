import type { IWorkspace } from '@sams/shared';

export function isWorkspace(obj: unknown): obj is IWorkspace {
  if (typeof obj !== 'object' || obj === null) return false;
  const workspace = obj as Record<string, unknown>;
  return (
    typeof workspace['id'] === 'string' &&
    typeof workspace['name'] === 'string' &&
    typeof workspace['width'] === 'number' &&
    typeof workspace['height'] === 'number'
  );
}
