import type { WebSocketService } from '../websocket.service.js';
import { SOCKET_EVENTS } from '@sams/shared';

export function createWorkspaceHandlers(service: WebSocketService) {
  return {
    handleCreated(workspaceId: string, data: unknown): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.WORKSPACE_CREATED, {
        workspaceId,
        ...(data as Record<string, unknown>),
      });
    },

    handleUpdated(workspaceId: string, data: unknown): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.WORKSPACE_UPDATED, {
        workspaceId,
        ...(data as Record<string, unknown>),
      });
    },

    handleDeleted(workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.WORKSPACE_DELETED, {
        workspaceId,
      });
    },

    handleOfficeCreated(officeId: string, workspaceId: string, data: unknown): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.OFFICE_CREATED, {
        officeId,
        workspaceId,
        ...(data as Record<string, unknown>),
      });
    },

    handleOfficeUpdated(officeId: string, workspaceId: string, data: unknown): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.OFFICE_UPDATED, {
        officeId,
        workspaceId,
        ...(data as Record<string, unknown>),
      });
    },

    handleOfficeDeleted(officeId: string, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.OFFICE_DELETED, {
        officeId,
        workspaceId,
      });
    },

    handleDeskCreated(deskId: string, officeId: string, workspaceId: string, data: unknown): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.DESK_CREATED, {
        deskId,
        officeId,
        workspaceId,
        ...(data as Record<string, unknown>),
      });
    },

    handleDeskUpdated(deskId: string, officeId: string, workspaceId: string, data: unknown): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.DESK_UPDATED, {
        deskId,
        officeId,
        workspaceId,
        ...(data as Record<string, unknown>),
      });
    },

    handleDeskDeleted(deskId: string, officeId: string, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.DESK_DELETED, {
        deskId,
        officeId,
        workspaceId,
      });
    },

    handleDeskOccupancyChange(
      deskId: string,
      officeId: string,
      isOccupied: boolean,
      agentId: string | undefined,
      workspaceId: string,
    ): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.DESK_OCCUPANCY_CHANGE, {
        deskId,
        officeId,
        isOccupied,
        agentId,
        workspaceId,
      });
    },
  };
}
