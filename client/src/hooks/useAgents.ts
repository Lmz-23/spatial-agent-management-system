import { useEffect } from 'react';
import { useAgentsStore } from '../store';
import { useWebSocket } from './useWebSocket';
import { appConfig } from '../config/app.config';

export function useAgents() {
  const { agents, workspaceId, setAgents, setWorkspace, setAuthToken } = useAgentsStore();
  const { connect } = useWebSocket(workspaceId);

  // Initialize authToken and workspaceId from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('sams_token');
    const storedWorkspace = localStorage.getItem('sams_workspace');

    if (storedToken && !useAgentsStore.getState().authToken) {
      setAuthToken(storedToken);
    }
    if (storedWorkspace && !useAgentsStore.getState().workspaceId) {
      setWorkspace(storedWorkspace);
    }
  }, [setAuthToken, setWorkspace]);

  useEffect(() => {
    async function fetchAndSetWorkspace() {
      try {
        const token = localStorage.getItem('sams_token');
        const res = await fetch('/api/workspaces', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const workspaces = await res.json();
        if (workspaces.length > 0) {
          const realWorkspaceId = workspaces[0].id;
          setWorkspace(realWorkspaceId);
        }
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      }
    }

    fetchAndSetWorkspace();
  }, [setWorkspace]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem('sams_token');
        const response = await fetch(`${appConfig.apiUrl}/agents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          // Ensure data is an array (API might return { agents: [...] } or direct array)
          const agentsArray = Array.isArray(data) ? data : (data?.agents || data?.data || []);
          // Only update agents if API returned real data, otherwise preserve existing agents (e.g., demo agents)
          if (agentsArray.length > 0) {
            setAgents(agentsArray);
          }

          // Get workspaceId from first agent - useEffect in useWebSocket will handle connection
          if (agentsArray.length > 0 && agentsArray[0].workspaceId) {
            const agentWorkspaceId = agentsArray[0].workspaceId;
            setWorkspace(agentWorkspaceId);
            // NOT calling connect() here - useWebSocket useEffect handles it
          }
        }
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    };

    fetchAgents();
  }, [setAgents, setWorkspace, connect]);

  const agentsList = Array.from(agents.values());

  return {
    agents: agentsList,
    workspaceId,
  };
}
