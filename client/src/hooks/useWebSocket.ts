import { useEffect, useRef, useCallback } from 'react';
import { useAgentsStore } from '../store';
import type {
  Agent,
  WSMessage,
  AgentPositionUpdate,
  AgentStatusUpdate,
} from '../types/simulation.types';
import { appConfig } from '../config/app.config';

export function useWebSocket(workspaceId?: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(false); // Track first mount for Strict Mode
  const { addAgent, updateAgent, removeAgent } = useAgentsStore();

  // Use refs for store functions to prevent handleMessage recreation
  const addAgentRef = useRef(addAgent);
  const updateAgentRef = useRef(updateAgent);
  const removeAgentRef = useRef(removeAgent);

  // Keep refs updated when store functions change
  useEffect(() => {
    addAgentRef.current = addAgent;
    updateAgentRef.current = updateAgent;
    removeAgentRef.current = removeAgent;
  }, [addAgent, updateAgent, removeAgent]);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WSMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'agent:created': {
          const agent = message.payload as Agent;
          addAgentRef.current(agent);
          break;
        }
        case 'agent:position:update': {
          const { agentId, positionX, positionY } =
            message.payload as AgentPositionUpdate;
          updateAgentRef.current(agentId, { positionX, positionY });
          break;
        }
        case 'agent:status:update': {
          const { agentId, status } =
            message.payload as AgentStatusUpdate;
          updateAgentRef.current(agentId, { status });
          break;
        }
        case 'agent:deleted': {
          const { agentId } = message.payload as { agentId: string };
          removeAgentRef.current(agentId);
          break;
        }
      }
    } catch {
      console.error('Failed to parse WS message:', event.data);
    }
  }, []); // No dependencies - uses refs only

  const connect = useCallback(
    (wsWorkspaceId?: string) => {
      const wid = wsWorkspaceId || workspaceId;

      if (!wid) {
        console.warn('No workspaceId available for WebSocket connection');
        return;
      }

      // Cerrar conexión existente si hay
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = appConfig.wsHost || window.location.host;
      const token = localStorage.getItem('sams_token');
      const wsUrl = `${wsProtocol}//${wsHost}${appConfig.wsUrl}?workspaceId=${wid}&token=${token}`;

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => console.log('WS connected');
      socket.onmessage = handleMessage;
      socket.onerror = (error) => console.error('WS error:', error);
      socket.onclose = () => {
        console.log('WS closed');
        wsRef.current = null;
      };
    },
    [handleMessage, workspaceId]
  );

  useEffect(() => {
    // Ignorar primer unmount de Strict Mode
    if (mountedRef.current === false) {
      mountedRef.current = true;
      // Solo conectar si hay workspaceId
      if (!workspaceId) {
        return;
      }
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }
      connect();
      return;
    }

    // Cleanup real solo en unmount definitivo
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, workspaceId]);

  return { socket: wsRef.current, connect };
}
