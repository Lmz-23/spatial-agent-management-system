import { StateCreator } from 'zustand';
import type { Agent } from '../../types/simulation.types';

export interface AgentsSliceState {
  agents: Map<string, Agent>;
  workspaceId: string | null;
}

export interface AgentsSliceActions {
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  setWorkspace: (workspaceId: string) => void;
  setAgents: (agents: Agent[]) => void;
}

export type AgentsSlice = AgentsSliceState & AgentsSliceActions;

export const agentsSlice: StateCreator<
  AgentsSlice,
  [],
  [],
  AgentsSlice
> = (set) => ({
  agents: new Map(),
  workspaceId: null,

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
});
