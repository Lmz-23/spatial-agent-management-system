export interface Position {
  x: number;
  y: number;
  floor?: number;
}

export function calculateDistance(from: Position, to: Position): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalizePosition(position: Position, bounds: { width: number; height: number }): Position {
  return {
    x: Math.max(0, Math.min(bounds.width, position.x)),
    y: Math.max(0, Math.min(bounds.height, position.y)),
    floor: position.floor,
  };
}

export function isWithinBounds(
  position: Position,
  bounds: { width: number; height: number },
): boolean {
  return position.x >= 0 && position.x <= bounds.width && position.y >= 0 && position.y <= bounds.height;
}

export function interpolatePosition(
  from: Position,
  to: Position,
  progress: number,
): Position {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
    floor: progress >= 1 ? to.floor : from.floor,
  };
}
