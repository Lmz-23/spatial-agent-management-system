import type { WebSocketService } from '../websocket.service.js';
import { SOCKET_EVENTS } from '@sams/shared';

export function createTaskHandlers(service: WebSocketService) {
  return {
    handleStatusUpdate(
      taskId: string,
      status: string,
      assignedAgentId: string | null,
      workspaceId: string,
    ): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.TASK_UPDATED, {
        taskId,
        status,
        assignedAgentId,
        workspaceId,
      });
    },

    handleCreated(taskId: string, data: unknown, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.TASK_CREATED, {
        taskId,
        ...(data as Record<string, unknown>),
        workspaceId,
      });
    },

    handleUpdated(taskId: string, data: unknown, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.TASK_UPDATED, {
        taskId,
        ...(data as Record<string, unknown>),
        workspaceId,
      });
    },

    handleCompleted(taskId: string, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.TASK_COMPLETED, {
        taskId,
        workspaceId,
      });
    },

    handleCancelled(taskId: string, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.TASK_CANCELLED, {
        taskId,
        workspaceId,
      });
    },

    handleAssigned(taskId: string, agentId: string, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.TASK_ASSIGNED, {
        taskId,
        agentId,
        workspaceId,
      });
    },
  };
}
