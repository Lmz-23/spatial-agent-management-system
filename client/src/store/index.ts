import { create } from 'zustand';
import type { Agent } from '../types/simulation.types';

interface AgentsState {
  agents: Map<string, Agent>;
  workspaceId: string | null;
  authToken: string | null;
}

interface AgentsActions {
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  setWorkspace: (workspaceId: string) => void;
  setAgents: (agents: Agent[]) => void;
  setAuthToken: (token: string | null) => void;
}

type AgentsStore = AgentsState & AgentsActions;

export const useAgentsStore = create<AgentsStore>((set) => ({
  agents: new Map(),
  workspaceId: null,
  authToken: null,

  addAgent: (agent) =>
    set((state) => {
      const newAgents = new Map(state.agents);
      newAgents.set(agent.id, agent);
      return { agents: newAgents };
    }),

  updateAgent: (id, updates) =>
    set((state) => {
      const newAgents = new Map(state.agents);
      const existing = newAgents.get(id);
      if (existing) {
        newAgents.set(id, { ...existing, ...updates });
      }
      return { agents: newAgents };
    }),

  removeAgent: (id) =>
    set((state) => {
      const newAgents = new Map(state.agents);
      newAgents.delete(id);
      return { agents: newAgents };
    }),

  setWorkspace: (workspaceId) => set({ workspaceId }),

  setAgents: (agents) =>
    set(() => {
      const agentsMap = new Map<string, Agent>();
      agents.forEach((agent) => agentsMap.set(agent.id, agent));
      return { agents: agentsMap };
    }),

  setAuthToken: (token) => set({ authToken: token }),
}));
