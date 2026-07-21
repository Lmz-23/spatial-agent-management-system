import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AgentRole, AgentStatus, PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Mapping opencode agent → DB Agent
// ---------------------------------------------------------------------------
//
// 16 sub-agents reales del orquestador opencode. Ground truth:
//   ls ~/.config/opencode/agent/
//
// Cobertura:
//   - orquestador      → ORCHESTRATOR (coordinador)
//   - 8 lectores/analistas arriba (parallelSafe: true)
//   - 7 escritores/ejecutores abajo (parallelSafe: false)
//   - orquestador en el centro visual del canvas (400, 275)
//
// Display names: capitalización Title-Case consistente, derivada de opencodeName
// (split on '-' → capitalize cada palabra). Para monopalabras como "git" o
// "scout" sigue valiendo la misma regla (capital inicial).
//
// isParallelSafe:
//   true  → analyst, architect, reviewer, debugger, scout, security, tech-writer, verifier.
//           architect puede lanzar comandos bash de consulta (read-only) → nota abajo.
//   false → orquestador, backend-coder, frontend-coder, mobile-coder, data-engineer,
//            tester, git, devops. Razón: escriben código, tocan infra o ejecutan
//            comandos de modificación.
//
// Grid layout (canvas cliente: OFFICE_WIDTH=800 × OFFICE_HEIGHT=600, WALL_THICKNESS=15):
//   inner area: x ∈ [35, 765], y ∈ [35, 565]
//   columnas  (x): 100, 300, 500, 700  (step 200, margen 100 a izq, 65 a der)
//   filas     (y):  50, 200, 350, 500  (step 150, margen 50 arriba, 65 abajo)
//   orquestador override → (400, 275) — centro visual del grid.
//
// arquitect NOTA: a veces lanza `bash` de consulta (grep, ls, etc.) — sigue
// marcado parallelSafe: true porque esas lecturas no mutan estado; documentado
// aquí por si el @reviewer quiere reconsiderarlo en el futuro.
// ---------------------------------------------------------------------------

type AgentDef = {
  opencodeName: string;
  displayName: string;
  role: AgentRole;
  isParallelSafe: boolean;
  positionX: number;
  positionY: number;
};

const GRID_X = [100, 300, 500, 700] as const;
const GRID_Y = [50, 200, 350, 500] as const;
const ORQUESTADOR_POS = { x: 400, y: 275 } as const;

function gridCell(index: number): { positionX: number; positionY: number } {
  const col = index % 4;
  const row = Math.floor(index / 4);
  return { positionX: GRID_X[col]!, positionY: GRID_Y[row]! };
}

const AGENT_DEFS: AgentDef[] = [
  // Lectores/analistas — filas 0 y 1
  { opencodeName: 'analyst',     displayName: 'Analyst',     role: AgentRole.ANALYST,       isParallelSafe: true,  ...gridCell(0) },
  { opencodeName: 'architect',   displayName: 'Architect',   role: AgentRole.ARCHITECT,     isParallelSafe: true,  ...gridCell(1) },
  { opencodeName: 'scout',       displayName: 'Scout',       role: AgentRole.SCOUT,         isParallelSafe: true,  ...gridCell(2) },
  { opencodeName: 'security',    displayName: 'Security',    role: AgentRole.SECURITY,      isParallelSafe: true,  ...gridCell(3) },
  { opencodeName: 'tech-writer', displayName: 'Tech Writer', role: AgentRole.TECH_WRITER,   isParallelSafe: true,  ...gridCell(4) },
  { opencodeName: 'reviewer',    displayName: 'Reviewer',    role: AgentRole.REVIEWER,      isParallelSafe: true,  ...gridCell(5) },
  { opencodeName: 'debugger',    displayName: 'Debugger',    role: AgentRole.DEBUGGER,      isParallelSafe: true,  ...gridCell(6) },
  { opencodeName: 'verifier',    displayName: 'Verifier',    role: AgentRole.VERIFIER,      isParallelSafe: true,  ...gridCell(7) },
  // Escritores/ejecutores — filas 2 y 3
  { opencodeName: 'backend-coder',  displayName: 'Backend Coder',  role: AgentRole.BACKEND_CODER,  isParallelSafe: false, ...gridCell(8)  },
  { opencodeName: 'frontend-coder', displayName: 'Frontend Coder', role: AgentRole.FRONTEND_CODER, isParallelSafe: false, ...gridCell(9)  },
  { opencodeName: 'mobile-coder',   displayName: 'Mobile Coder',   role: AgentRole.MOBILE_CODER,   isParallelSafe: false, ...gridCell(10) },
  { opencodeName: 'data-engineer',  displayName: 'Data Engineer',  role: AgentRole.DATA_ENGINEER,  isParallelSafe: false, ...gridCell(11) },
  { opencodeName: 'devops',         displayName: 'DevOps',         role: AgentRole.DEVOPS,         isParallelSafe: false, ...gridCell(12) },
  { opencodeName: 'tester',         displayName: 'Tester',         role: AgentRole.TESTER,         isParallelSafe: false, ...gridCell(13) },
  { opencodeName: 'git',            displayName: 'Git',            role: AgentRole.GIT,            isParallelSafe: false, ...gridCell(14) },
  // Orquestador — override a posición central destacada
  {
    opencodeName: 'orquestador',
    displayName: 'Orquestador',
    role: AgentRole.ORCHESTRATOR,
    isParallelSafe: false,
    positionX: ORQUESTADOR_POS.x,
    positionY: ORQUESTADOR_POS.y,
  },
];

if (AGENT_DEFS.length !== 16) {
  throw new Error(`AGENT_DEFS debe tener 16 entradas, tiene ${AGENT_DEFS.length}`);
}

const WORKSPACE_NAME = 'Proyecto Alpha';
const CONFIG_DIR = join(process.cwd(), 'config');
const CONFIG_FILE = join(CONFIG_DIR, 'agent-mapping.json');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type AgentMapping = {
  generatedAt: string;
  agents: Record<string, string>;
};

function writeAgentMapping(mapping: AgentMapping): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  const json = JSON.stringify(mapping, null, 2);
  writeFileSync(CONFIG_FILE, `${json}\n`, 'utf8');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('🌱 Seeding database (16 agentes opencode → SAMS)...');

  // 1. Limpiar datos dependientes primero (orden importa por FK).
  //    No tocamos agents aún porque vamos a upsertarlos por opencodeName;
  //    al recrearlos conservaremos su `id` (no se sobreescribe en `update`).
  await prisma.taskEvent.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.task.deleteMany();

  // 2. Workspace idempotente: stable ID entre ejecuciones.
  const workspace = await prisma.workspace.upsert({
    where: { id: 'seed-workspace-alpha' }, // estable; nadie más usa este id
    update: { name: WORKSPACE_NAME, projectName: 'Alpha Core' },
    create: {
      id: 'seed-workspace-alpha',
      name: WORKSPACE_NAME,
      projectName: 'Alpha Core',
    },
  });
  console.log(`✅ Workspace: ${workspace.name} (${workspace.id})`);

  // 3. Limpiar agentes legacy sin opencodeName (huérfanos de seeds anteriores).
  //    El upsert de la sección 4 matchea por opencodeName, así que los registros
  //    con opencodeName=null convivirían como fantasmas (15/16 apilados, etc.).
  //    Borramos SOLO los legacy (opencodeName IS NULL); cualquier agente creado
  //    a mano por un humano fuera del seed queda intacto.
  const { count: legacyCount } = await prisma.agent.deleteMany({
    where: { opencodeName: null },
  });
  if (legacyCount > 0) {
    console.log(`🧹 Removed ${legacyCount} legacy agent(s) without opencodeName`);
  }

  // 4. Agents: upsert por opencodeName.
  //    - Primera ejecución: `create` con id aleatorio (crypto.randomUUID()).
  //    - Re-ejecución: `update` conserva el id original (no lo incluimos en update).
  //    Esto evita el bug "UUID fijo choca con un registro viejo" y a la vez
  //    mantiene el bridge estable (mapping.json siempre apunta al mismo UUID).
  const agentMapping: AgentMapping = {
    generatedAt: new Date().toISOString(),
    agents: {},
  };

  for (const def of AGENT_DEFS) {
    const agent = await prisma.agent.upsert({
      where: { opencodeName: def.opencodeName },
      create: {
        id: randomUUID(),
        name: def.displayName, // legacy `name` se mantiene para no romper el cliente
        displayName: def.displayName,
        opencodeName: def.opencodeName,
        role: def.role,
        isParallelSafe: def.isParallelSafe,
        positionX: def.positionX,
        positionY: def.positionY,
        status: AgentStatus.IDLE,
        workspaceId: workspace.id,
      },
      update: {
        // `id` intencionalmente omitido: no queremos rotar IDs entre re-seeds.
        name: def.displayName,
        displayName: def.displayName,
        role: def.role,
        isParallelSafe: def.isParallelSafe,
        positionX: def.positionX,
        positionY: def.positionY,
        workspaceId: workspace.id,
      },
    });

    agentMapping.agents[def.opencodeName] = agent.id;
  }

  console.log(`✅ Upserted ${AGENT_DEFS.length} agents`);

  // 5. Tareas demo (clean slate cada seed — son datos de inicialización, no de workload).
  //    Las FK assignedAgentId/createByAgentId están en SetNull, así que borrar tasks
  //    no rompe agents. Asignamos a roles que tienen sentido:
  //      - "Implementar WebSocket server" → backend-coder
  //      - "Review de código"            → reviewer
  //      - "Deploy a producción"         → devops
  const backendAgentId = agentMapping.agents['backend-coder']!;
  const reviewerAgentId = agentMapping.agents['reviewer']!;
  const devopsAgentId = agentMapping.agents['devops']!;

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Diseñar interfaz de usuario',
        description: 'Crear wireframes y mockups para el dashboard',
        status: TaskStatus.BACKLOG,
        workspaceId: workspace.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implementar WebSocket server',
        description: 'Configurar comunicación en tiempo real',
        status: TaskStatus.IN_PROGRESS,
        workspaceId: workspace.id,
        assignedAgentId: backendAgentId,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Review de código',
        description: 'Revisar PR #42',
        status: TaskStatus.IN_REVIEW,
        workspaceId: workspace.id,
        assignedAgentId: reviewerAgentId,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Deploy a producción',
        status: TaskStatus.DONE,
        workspaceId: workspace.id,
        assignedAgentId: devopsAgentId,
        completedAt: new Date(),
      },
    }),
  ]);
  console.log(`✅ Created ${tasks.length} tasks`);

  // 6. Marcar los agentes asignados como WORKING y vincular su currentTaskId.
  //    Los demás agentes quedan en IDLE por defecto.
  await prisma.agent.update({
    where: { id: backendAgentId },
    data: { status: AgentStatus.WORKING, currentTaskId: tasks[1]!.id },
  });
  await prisma.agent.update({
    where: { id: reviewerAgentId },
    data: { status: AgentStatus.WORKING, currentTaskId: tasks[2]!.id },
  });

  // 7. Mapping side-effect para el bridge.
  writeAgentMapping(agentMapping);
  console.log(`✅ Wrote ${CONFIG_FILE}`);
  console.log('📦 agent-mapping.json:');
  console.log(JSON.stringify(agentMapping, null, 2));

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
