import { OfficeView } from './components/simulation/OfficeView';
import { useAgents } from './hooks/useAgents';
import { LoginScreen } from './components/LoginScreen';
import { useAgentsStore } from './store';
import type { Agent } from './types/simulation.types';
import './styles/login.css';

const STATUS_LABELS: Record<Agent['status'], string> = {
  IDLE: 'Idle',
  WALKING: 'Caminando',
  WORKING: 'Trabajando',
};

function AgentListItem({ agent }: { agent: Agent }) {
  return (
    <div className="agent-item">
      <div
        className="agent-color"
        style={{ backgroundColor: agent.color }}
      />
      <div className="agent-info">
        <span className="agent-name">{agent.name}</span>
        <span className="agent-status">
          {STATUS_LABELS[agent.status]}
        </span>
      </div>
      <div className="agent-position">
        ({agent.positionX.toFixed(0)}, {agent.positionY.toFixed(0)})
      </div>
    </div>
  );
}

function Sidebar() {
  const { agents, workspaceId } = useAgents();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Agentes</h2>
        <span className="agent-count">{agents.length}</span>
      </div>
      <div className="agent-list">
        {agents.length === 0 ? (
          <p className="no-agents">No hay agentes activos</p>
        ) : (
          agents.map((agent) => (
            <AgentListItem key={agent.id} agent={agent} />
          ))
        )}
      </div>
      {workspaceId && (
        <div className="workspace-info">
          Workspace: {workspaceId}
        </div>
      )}
    </aside>
  );
}

function Header() {
  return (
    <header className="header">
      <h1 className="header-title">SAMS</h1>
      <span className="header-subtitle">
        Simulation & Agent Management System
      </span>
    </header>
  );
}

export function App() {
  const token = useAgentsStore((state) => state.authToken);
  const isLoggedIn = token || localStorage.getItem('sams_token');

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <OfficeView />
        <Sidebar />
      </main>
    </div>
  );
}
