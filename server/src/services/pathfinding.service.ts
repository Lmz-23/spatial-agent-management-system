export class PathfindingService {
  private gridSize = 10;

  async findPath(
    from: { x: number; y: number },
    to: { x: number; y: number },
    obstacles: Array<{ x: number; y: number; width: number; height: number }>,
  ): Promise<Array<{ x: number; y: number }>> {
    // Simple linear path for now (no actual pathfinding)
    const path: Array<{ x: number; y: number }> = [];
    const steps = Math.max(
      Math.abs(to.x - from.x),
      Math.abs(to.y - from.y),
    );

    if (steps === 0) return [from];

    const dx = (to.x - from.x) / steps;
    const dy = (to.y - from.y) / steps;

    for (let i = 0; i <= steps; i++) {
      path.push({
        x: Math.round(from.x + dx * i),
        y: Math.round(from.y + dy * i),
      });
    }

    return path;
  }

  async isPathValid(
    from: { x: number; y: number },
    to: { x: number; y: number },
    obstacles: Array<{ x: number; y: number; width: number; height: number }>,
  ): Promise<boolean> {
    const path = await this.findPath(from, to, obstacles);
    for (const point of path) {
      for (const obstacle of obstacles) {
        if (
          point.x >= obstacle.x &&
          point.x <= obstacle.x + obstacle.width &&
          point.y >= obstacle.y &&
          point.y <= obstacle.y + obstacle.height
        ) {
          return false;
        }
      }
    }
    return true;
  }

  getGridSize(): number {
    return this.gridSize;
  }

  snapToGrid(position: { x: number; y: number }): { x: number; y: number } {
    return {
      x: Math.round(position.x / this.gridSize) * this.gridSize,
      y: Math.round(position.y / this.gridSize) * this.gridSize,
    };
  }
}

export const pathfindingService = new PathfindingService();
