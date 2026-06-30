export interface WorkspaceRoom {
  id: string;
  sockets: Set<unknown>;
  officeIds: string[];
}

export class WorkspaceRoomManager {
  private rooms: Map<string, WorkspaceRoom> = new Map();

  createRoom(workspaceId: string): WorkspaceRoom {
    const room: WorkspaceRoom = {
      id: workspaceId,
      sockets: new Set(),
      officeIds: [],
    };
    this.rooms.set(workspaceId, room);
    return room;
  }

  getRoom(workspaceId: string): WorkspaceRoom | undefined {
    return this.rooms.get(workspaceId);
  }

  joinRoom(workspaceId: string, socket: unknown): void {
    let room = this.rooms.get(workspaceId);
    if (!room) {
      room = this.createRoom(workspaceId);
    }
    room.sockets.add(socket);
  }

  leaveRoom(workspaceId: string, socket: unknown): void {
    const room = this.rooms.get(workspaceId);
    if (room) {
      room.sockets.delete(socket);
      if (room.sockets.size === 0) {
        this.rooms.delete(workspaceId);
      }
    }
  }

  addOfficeToRoom(workspaceId: string, officeId: string): void {
    const room = this.rooms.get(workspaceId);
    if (room && !room.officeIds.includes(officeId)) {
      room.officeIds.push(officeId);
    }
  }

  removeOfficeFromRoom(workspaceId: string, officeId: string): void {
    const room = this.rooms.get(workspaceId);
    if (room) {
      room.officeIds = room.officeIds.filter((id) => id !== officeId);
    }
  }

  getRoomSocketCount(workspaceId: string): number {
    return this.rooms.get(workspaceId)?.sockets.size ?? 0;
  }

  getAllRooms(): WorkspaceRoom[] {
    return Array.from(this.rooms.values());
  }
}

export const workspaceRoomManager = new WorkspaceRoomManager();
