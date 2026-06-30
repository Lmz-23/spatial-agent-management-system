import type { Position } from '@sams/shared';

export interface PositionUpdate {
  agentId: string;
  position: Position;
  rotation: number;
  timestamp: number;
}

export class PositionService {
  private updates: Map<string, PositionUpdate[]> = new Map();
  private maxHistory = 100;

  recordUpdate(agentId: string, position: Position, rotation: number): void {
    const update: PositionUpdate = {
      agentId,
      position,
      rotation,
      timestamp: Date.now(),
    };

    const agentUpdates = this.updates.get(agentId) ?? [];
    agentUpdates.push(update);

    if (agentUpdates.length > this.maxHistory) {
      agentUpdates.shift();
    }

    this.updates.set(agentId, agentUpdates);
  }

  getLatestPosition(agentId: string): PositionUpdate | null {
    const updates = this.updates.get(agentId);
    if (!updates || updates.length === 0) return null;
    return updates[updates.length - 1] ?? null;
  }

  getPositionHistory(agentId: string): PositionUpdate[] {
    return this.updates.get(agentId) ?? [];
  }

  interpolatePosition(
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

  calculateVelocity(
    from: Position,
    to: Position,
    timeDelta: number,
  ): { vx: number; vy: number } {
    const vx = (to.x - from.x) / (timeDelta / 1000);
    const vy = (to.y - from.y) / (timeDelta / 1000);
    return { vx, vy };
  }

  clearHistory(agentId: string): void {
    this.updates.delete(agentId);
  }

  clearAllHistory(): void {
    this.updates.clear();
  }
}

export const positionService = new PositionService();
