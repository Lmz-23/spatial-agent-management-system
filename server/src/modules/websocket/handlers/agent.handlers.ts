import type { WebSocketService } from '../websocket.service.js';
import { SOCKET_EVENTS } from '@sams/shared';

export function createAgentHandlers(service: WebSocketService) {
  return {
    handlePositionUpdate(
      agentId: string,
      positionX: number,
      positionY: number,
      workspaceId: string,
      rotation?: number,
      floor?: number,
    ): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.AGENT_POSITION_UPDATE, {
        agentId,
        positionX,
        positionY,
        rotation,
        floor,
        workspaceId,
      });
    },

    handleStatusUpdate(agentId: string, status: string, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.AGENT_STATUS_CHANGE, {
        agentId,
        status,
        workspaceId,
      });
    },

    handleCreated(agentId: string, data: unknown, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.AGENT_CREATED, {
        agentId,
        ...(data as Record<string, unknown>),
        workspaceId,
      });
    },

    handleUpdated(agentId: string, data: unknown, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.AGENT_UPDATED, {
        agentId,
        ...(data as Record<string, unknown>),
        workspaceId,
      });
    },

    handleDeleted(agentId: string, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.AGENT_DELETED, {
        agentId,
        workspaceId,
      });
    },

    handleAssigned(agentId: string, taskId: string, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.AGENT_ASSIGNED, {
        agentId,
        taskId,
        workspaceId,
      });
    },
  };
}
