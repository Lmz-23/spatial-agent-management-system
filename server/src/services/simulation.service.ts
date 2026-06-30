import type { WebSocketGateway } from '../modules/websocket/websocket.gateway.js';
import type { Position } from '@sams/shared';

export interface SimulationConfig {
  tickRate: number;
  agentSpeed: number;
  updateInterval: number;
}

export interface SimulatedAgent {
  id: string;
  position: Position;
  targetPosition: Position | null;
  rotation: number;
  status: 'idle' | 'moving' | 'working';
}

export class SimulationService {
  private config: SimulationConfig = {
    tickRate: 100,
    agentSpeed: 2,
    updateInterval: 100,
  };
  private agents: Map<string, SimulatedAgent> = new Map();
  private gateway: WebSocketGateway | null = null;
  private running = false;
  private interval: ReturnType<typeof setInterval> | null = null;

  setGateway(gateway: WebSocketGateway): void {
    this.gateway = gateway;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.interval = setInterval(() => this.tick(), this.config.tickRate);
  }

  stop(): void {
    this.running = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  registerAgent(
    id: string,
    initialPosition: Position,
  ): void {
    this.agents.set(id, {
      id,
      position: { ...initialPosition },
      targetPosition: null,
      rotation: 0,
      status: 'idle',
    });
  }

  unregisterAgent(id: string): void {
    this.agents.delete(id);
  }

  setAgentTarget(id: string, target: Position): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.targetPosition = { ...target };
      agent.status = 'moving';
    }
  }

  private tick(): void {
    for (const agent of this.agents.values()) {
      if (agent.status === 'moving' && agent.targetPosition) {
        this.updateAgentPosition(agent);
      }
    }
  }

  private updateAgentPosition(agent: SimulatedAgent): void {
    if (!agent.targetPosition) return;

    const dx = agent.targetPosition.x - agent.position.x;
    const dy = agent.targetPosition.y - agent.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.config.agentSpeed) {
      agent.position = { ...agent.targetPosition };
      agent.targetPosition = null;
      agent.status = 'idle';
    } else {
      const vx = (dx / distance) * this.config.agentSpeed;
      const vy = (dy / distance) * this.config.agentSpeed;
      agent.position.x += vx;
      agent.position.y += vy;
      agent.rotation = Math.atan2(dy, dx);
    }
  }

  getAgents(): SimulatedAgent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): SimulatedAgent | undefined {
    return this.agents.get(id);
  }
}

export const simulationService = new SimulationService();
