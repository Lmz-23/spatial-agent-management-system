import * as PIXI from 'pixi.js';

export type AgentRole = 'ORQUESTADOR' | 'CODER' | 'REVIEWER' | 'TESTER';
export type AgentState = 'IDLE' | 'WORKING';

export interface AgentConfig {
  id: string;
  role: AgentRole;
  name: string;
}

const ROLE_COLORS: Record<AgentRole, number> = {
  ORQUESTADOR: 0xff4444, // Red
  CODER: 0x4488ff,       // Blue
  REVIEWER: 0x44ff44,    // Green
  TESTER: 0xffaa00,      // Orange
};

const AGENT_SIZES: Record<AgentRole, number> = {
  ORQUESTADOR: 1.5,      // 1.5x bigger
  CODER: 1.0,
  REVIEWER: 1.0,
  TESTER: 1.0,
};

const BASE_SIZE = 20;

export class Agent {
  public readonly id: string;
  public readonly role: AgentRole;
  public readonly name: string;
  public state: AgentState = 'IDLE';

  public deskPosition: PIXI.Point | null = null;
  private targetPosition: PIXI.Point | null = null;
  private homePosition: PIXI.Point;

  public readonly sprite: PIXI.Graphics;
  private readonly speed: number = 2;

  // Animation properties
  private waitTime: number = 0;
  private readonly waitDuration: number = 2000; // ms
  private velocity: PIXI.Point = new PIXI.Point(0, 0);

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.role = config.role;
    this.name = config.name;

    // Create sprite based on role
    this.sprite = this.createSprite();
    this.homePosition = new PIXI.Point(400, 300);
    this.sprite.x = this.homePosition.x;
    this.sprite.y = this.homePosition.y;
  }

  private createSprite(): PIXI.Graphics {
    const g = new PIXI.Graphics();
    const color = ROLE_COLORS[this.role];
    const size = BASE_SIZE * AGENT_SIZES[this.role];

    // Body
    g.beginFill(color);
    g.drawRect(-size / 2, -size / 2, size, size);
    g.endFill();

    // Border/Highlight
    g.lineStyle(2, 0xffffff, 0.5);
    g.drawRect(-size / 2, -size / 2, size, size);

    // Role-specific decorations
    if (this.role === 'ORQUESTADOR') {
      // Golden crown/border effect
      g.lineStyle(3, 0xffd700, 1);
      g.drawRect(-size / 2 - 2, -size / 2 - 2, size + 4, size + 4);

      // Crown dots on top
      g.beginFill(0xffd700);
      g.drawCircle(-size / 4, -size / 2 - 6, 3);
      g.drawCircle(0, -size / 2 - 8, 3);
      g.drawCircle(size / 4, -size / 2 - 6, 3);
      g.endFill();
    }

    // Eyes (two small white dots)
    g.beginFill(0xffffff);
    g.drawCircle(-size / 5, -size / 8, 2);
    g.drawCircle(size / 5, -size / 8, 2);
    g.endFill();

    return g;
  }

  setDeskPosition(x: number, y: number): void {
    this.deskPosition = new PIXI.Point(x, y);
  }

  setHomePosition(x: number, y: number): void {
    this.homePosition = new PIXI.Point(x, y);
  }

  setState(state: AgentState): void {
    this.state = state;
    if (state === 'WORKING' && this.deskPosition) {
      this.targetPosition = this.deskPosition;
    }
  }

  private pickRandomTarget(officeBounds: { minX: number; maxX: number; minY: number; maxY: number }): void {
    const padding = 50;
    const x = padding + Math.random() * (officeBounds.maxX - padding * 2);
    const y = padding + Math.random() * (officeBounds.maxY - padding * 2);
    this.targetPosition = new PIXI.Point(x, y);
  }

  update(delta: number, officeBounds: { minX: number; maxX: number; minY: number; maxY: number }): void {
    if (this.state === 'WORKING') {
      // Stay at desk
      if (this.deskPosition) {
        this.targetPosition = this.deskPosition;
      }
      this.moveTowardsTarget(delta);
      return;
    }

    // IDLE state - wander randomly
    if (this.waitTime > 0) {
      this.waitTime -= delta * 16.67; // Approximate ms per frame
      return;
    }

    if (!this.targetPosition || this.isAtTarget()) {
      this.pickRandomTarget(officeBounds);
      this.waitTime = this.waitDuration + Math.random() * 2000;
    }

    this.moveTowardsTarget(delta);
  }

  private isAtTarget(): boolean {
    if (!this.targetPosition) return true;
    const dx = this.sprite.x - this.targetPosition.x;
    const dy = this.sprite.y - this.targetPosition.y;
    return Math.sqrt(dx * dx + dy * dy) < 5;
  }

  private moveTowardsTarget(delta: number): void {
    if (!this.targetPosition) return;

    const dx = this.targetPosition.x - this.sprite.x;
    const dy = this.targetPosition.y - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      this.sprite.x = this.targetPosition.x;
      this.sprite.y = this.targetPosition.y;
      this.velocity.set(0, 0);
      return;
    }

    // Normalize direction and apply speed
    const moveX = (dx / distance) * this.speed * delta;
    const moveY = (dy / distance) * this.speed * delta;

    // Smooth interpolation
    this.sprite.x += moveX;
    this.sprite.y += moveY;

    this.velocity.set(moveX, moveY);
  }

  getPosition(): PIXI.Point {
    return new PIXI.Point(this.sprite.x, this.sprite.y);
  }
}
