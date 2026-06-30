import type { WebSocket as WSClient } from '@fastify/websocket';
import { SOCKET_EVENTS } from '@sams/shared';

export class WebSocketService {
  private rooms: Map<string, Set<WSClient>> = new Map();
  private clientRooms: Map<WSClient, Set<string>> = new Map();

  constructor() {}

  subscribe(client: WSClient, workspaceId: string): void {
    let room = this.rooms.get(workspaceId);
    if (!room) {
      room = new Set();
      this.rooms.set(workspaceId, room);
    }
    room.add(client);

    let clientRoomList = this.clientRooms.get(client);
    if (!clientRoomList) {
      clientRoomList = new Set();
      this.clientRooms.set(client, clientRoomList);
    }
    clientRoomList.add(workspaceId);
  }

  unsubscribe(client: WSClient, workspaceId: string): void {
    const room = this.rooms.get(workspaceId);
    if (room) {
      room.delete(client);
      if (room.size === 0) {
        this.rooms.delete(workspaceId);
      }
    }

    const clientRoomList = this.clientRooms.get(client);
    if (clientRoomList) {
      clientRoomList.delete(workspaceId);
      if (clientRoomList.size === 0) {
        this.clientRooms.delete(client);
      }
    }
  }

  unsubscribeAll(client: WSClient): void {
    const workspaceIds = this.clientRooms.get(client);
    if (workspaceIds) {
      for (const workspaceId of workspaceIds) {
        this.unsubscribe(client, workspaceId);
      }
    }
  }

  broadcastToWorkspace(workspaceId: string, event: string, data: object): void {
    const room = this.rooms.get(workspaceId);
    if (!room) {
      return;
    }

    const message = {
      type: event,
      payload: data,
      timestamp: Date.now(),
    };

    for (const client of room) {
      if (client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    }
  }

  getRoomClientCount(workspaceId: string): number {
    return this.rooms.get(workspaceId)?.size ?? 0;
  }

  getClientWorkspaces(client: WSClient): string[] {
    const workspaces = this.clientRooms.get(client);
    return workspaces ? Array.from(workspaces) : [];
  }
}

export function createAgentHandlers(service: WebSocketService) {
  return {
    handlePositionUpdate(
      agentId: string,
      positionX: number,
      positionY: number,
      workspaceId: string,
    ): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.AGENT_POSITION_UPDATE, {
        agentId,
        positionX,
        positionY,
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
        ...(data as object),
        workspaceId,
      });
    },

    handleUpdated(agentId: string, data: unknown, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.AGENT_UPDATED, {
        agentId,
        ...(data as object),
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
        ...(data as object),
        workspaceId,
      });
    },

    handleUpdated(taskId: string, data: unknown, workspaceId: string): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.TASK_UPDATED, {
        taskId,
        ...(data as object),
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

export function createWorkspaceHandlers(service: WebSocketService) {
  return {
    handleCreated(workspaceId: string, data: unknown): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.WORKSPACE_CREATED, {
        workspaceId,
        ...(data as object),
      });
    },

    handleUpdated(workspaceId: string, data: unknown): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.WORKSPACE_UPDATED, {
        workspaceId,
        ...(data as object),
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
        ...(data as object),
      });
    },

    handleOfficeUpdated(officeId: string, workspaceId: string, data: unknown): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.OFFICE_UPDATED, {
        officeId,
        workspaceId,
        ...(data as object),
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
        ...(data as object),
      });
    },

    handleDeskUpdated(deskId: string, officeId: string, workspaceId: string, data: unknown): void {
      service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.DESK_UPDATED, {
        deskId,
        officeId,
        workspaceId,
        ...(data as object),
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
