import type { ITask } from '@sams/shared';

export function isTask(obj: unknown): obj is ITask {
  if (typeof obj !== 'object' || obj === null) return false;
  const task = obj as Record<string, unknown>;
  return (
    typeof task['id'] === 'string' &&
    typeof task['title'] === 'string' &&
    typeof task['status'] === 'string' &&
    typeof task['priority'] === 'string'
  );
}
