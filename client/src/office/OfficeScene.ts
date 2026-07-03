import * as PIXI from 'pixi.js';
import { Agent, AgentConfig } from './Agent';
import { OfficeBackground, OFFICE_WIDTH, OFFICE_HEIGHT } from './OfficeBackground';

// Desk positions for agents to work at
const DESK_POSITIONS = [
  { x: 100, y: 150 },
  { x: 250, y: 150 },
  { x: 100, y: 300 },
  { x: 250, y: 300 },
];

// Rest area positions
const REST_POSITIONS = [
  { x: 520, y: 430 },
  { x: 560, y: 430 },
  { x: 600, y: 430 },
];

export class OfficeScene extends PIXI.Container {
  private app: PIXI.Application;
  private background: OfficeBackground;
  private agents: Map<string, Agent> = new Map();
  private agentContainer: PIXI.Container;
  private isRunning: boolean = false;
  private officeBounds: { minX: number; maxX: number; minY: number; maxY: number };

  constructor(app: PIXI.Application) {
    super();
    this.app = app;
    this.background = new OfficeBackground();
    this.officeBounds = this.background.getOfficeBounds();

    // Agent container for z-ordering
    this.agentContainer = new PIXI.Container();
    this.agentContainer.sortableChildren = true;

    this.addChild(this.background);
    this.addChild(this.agentContainer);
  }

  addAgent(config: AgentConfig): Agent {
    const agent = new Agent(config);

    // Assign desk position if available
    const deskIndex = this.agents.size % DESK_POSITIONS.length;
    const deskPos = DESK_POSITIONS[deskIndex];
    agent.setDeskPosition(deskPos.x + 30, deskPos.y + 50); // Offset for chair position

    // Set initial state - CODER starts working, others idle
    if (config.role === 'CODER') {
      agent.setState('WORKING');
    } else {
      agent.setState('IDLE');
      // Random home position in rest area
      const homePos = REST_POSITIONS[Math.floor(Math.random() * REST_POSITIONS.length)];
      agent.setHomePosition(homePos.x, homePos.y);
      agent.sprite.x = homePos.x;
      agent.sprite.y = homePos.y;
    }

    this.agents.set(config.id, agent);
    this.agentContainer.addChild(agent.sprite);

    return agent;
  }

  removeAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agentContainer.removeChild(agent.sprite);
      agent.sprite.destroy();
      this.agents.delete(agentId);
    }
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  setAgentState(agentId: string, state: 'IDLE' | 'WORKING'): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.setState(state);
    }
  }

  update(delta: number): void {
    for (const agent of this.agents.values()) {
      agent.update(delta, this.officeBounds);
    }
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.app.ticker.add(this.tickerCallback, this);
  }

  stop(): void {
    this.isRunning = false;
    this.app.ticker.remove(this.tickerCallback, this);
  }

  private tickerCallback = (delta: number): void => {
    this.update(delta);
  };

  destroy(): void {
    this.stop();
    for (const agent of this.agents.values()) {
      agent.sprite.destroy();
    }
    this.agents.clear();
    super.destroy({ children: true });
  }
}

// Factory function to create and initialize the scene
export function createOfficeScene(
  parentElement: HTMLElement
): { app: PIXI.Application; scene: OfficeScene } {
  const app = new PIXI.Application({
    width: OFFICE_WIDTH,
    height: OFFICE_HEIGHT,
    backgroundColor: 0xe0e0e0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  parentElement.appendChild(app.view as HTMLCanvasElement);

  const scene = new OfficeScene(app);
  app.stage.addChild(scene);

  // Add some demo agents
  const demoAgents: AgentConfig[] = [
    { id: 'orch-1', role: 'ORQUESTADOR', name: 'Orquestador Alpha' },
    { id: 'coder-1', role: 'CODER', name: 'Dev One' },
    { id: 'coder-2', role: 'CODER', name: 'Dev Two' },
    { id: 'reviewer-1', role: 'REVIEWER', name: 'Reviewer Beta' },
    { id: 'tester-1', role: 'TESTER', name: 'Tester Gamma' },
  ];

  for (const config of demoAgents) {
    scene.addAgent(config);
  }

  scene.start();

  return { app, scene };
}
