import { PrismaClient, AgentStatus, AgentRole, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.workspace.deleteMany();

  // Create a workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Proyecto Alpha',
      projectName: 'Alpha Core',
    },
  });

  console.log(`✅ Created workspace: ${workspace.name}`);

  // Create agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        name: 'Agent Alice',
        color: '#FF5733',
        status: AgentStatus.IDLE,
        positionX: 100,
        positionY: 200,
        workspaceId: workspace.id,
        role: AgentRole.ORCHESTRATOR,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Agent Bob',
        color: '#33FF57',
        status: AgentStatus.IDLE,
        positionX: 300,
        positionY: 150,
        workspaceId: workspace.id,
        role: AgentRole.BACKEND_CODER,
      },
    }),
    prisma.agent.create({
      data: {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Agent Charlie',
        color: '#3357FF',
        status: AgentStatus.IDLE,
        positionX: 500,
        positionY: 300,
        workspaceId: workspace.id,
        role: AgentRole.REVIEWER,
      },
    }),
  ]);

  console.log(`✅ Created ${agents.length} agents`);

  // Create tasks
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
        assignedAgentId: agents[0]!.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Review de código',
        description: 'Revisar PR #42',
        status: TaskStatus.IN_REVIEW,
        workspaceId: workspace.id,
        assignedAgentId: agents[1]!.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Deploy a producción',
        status: TaskStatus.DONE,
        workspaceId: workspace.id,
        completedAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} tasks`);

  // Update agent statuses based on their assigned tasks
  await prisma.agent.update({
    where: { id: agents[0]!.id },
    data: { status: AgentStatus.WORKING, currentTaskId: tasks[1]!.id },
  });

  await prisma.agent.update({
    where: { id: agents[1]!.id },
    data: { status: AgentStatus.WORKING, currentTaskId: tasks[2]!.id },
  });

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
