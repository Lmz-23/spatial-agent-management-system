import type { WebSocketService } from './websocket.service.js';
import type { WebSocket as WSClient } from '@fastify/websocket';
import { SOCKET_EVENTS, ROOM_EVENTS } from '@sams/shared';

interface ClientMessage {
  type: string;
  payload: unknown;
  requestId?: string;
}

interface OutboundMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  requestId?: string;
}

export class WebSocketGateway {
  private clients: Set<WSClient> = new Set();

  constructor(private readonly service: WebSocketService) {}

  handleConnection(socket: WSClient, request: unknown): void {
    const req = request as { url?: string; headers?: Record<string, string> };
    const url = new URL(req.url ?? '/', `http://${req.headers?.host ?? 'localhost'}`);
    const workspaceId = url.searchParams.get('workspaceId') ?? 'default';

    this.clients.add(socket);
    this.service.subscribe(socket, workspaceId);

    socket.on('message', (data) => {
      this.handleMessage(socket, data.toString(), workspaceId);
    });

    socket.on('close', () => {
      this.service.unsubscribeAll(socket);
      this.clients.delete(socket);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.send(socket, {
      type: SOCKET_EVENTS.CONNECTION,
      payload: { message: 'Connected to SAMS WebSocket', workspaceId },
      timestamp: Date.now(),
    });
  }

  private handleMessage(socket: WSClient, data: string, workspaceId: string): void {
    try {
      const message = JSON.parse(data) as ClientMessage;

      switch (message.type) {
        case SOCKET_EVENTS.SUBSCRIBE:
          this.handleSubscribe(socket, message.payload);
          break;
        case SOCKET_EVENTS.UNSUBSCRIBE:
          this.handleUnsubscribe(socket, message.payload);
          break;
        case SOCKET_EVENTS.AGENT_POSITION_UPDATE:
          this.handleAgentPositionUpdate(socket, message.payload, workspaceId);
          break;
        case ROOM_EVENTS.JOIN_WORKSPACE:
          this.handleJoinWorkspace(socket, message.payload);
          break;
        case ROOM_EVENTS.LEAVE_WORKSPACE:
          this.handleLeaveWorkspace(socket, message.payload);
          break;
        default:
          this.send(socket, {
            type: SOCKET_EVENTS.ERROR,
            payload: { code: 'INVALID_MESSAGE', message: `Unknown event type: ${message.type}` },
            timestamp: Date.now(),
          });
      }
    } catch {
      this.send(socket, {
        type: SOCKET_EVENTS.ERROR,
        payload: { code: 'INVALID_MESSAGE', message: 'Failed to parse message' },
        timestamp: Date.now(),
      });
    }
  }

  private handleSubscribe(socket: WSClient, payload: unknown): void {
    const data = payload as { workspaceId?: string; officeId?: string };
    if (data.workspaceId) {
      this.service.subscribe(socket, data.workspaceId);
      this.send(socket, {
        type: SOCKET_EVENTS.SUBSCRIBED,
        payload: { workspaceId: data.workspaceId, subscribedAt: Date.now() },
        timestamp: Date.now(),
      });
    }
  }

  private handleUnsubscribe(socket: WSClient, payload: unknown): void {
    const data = payload as { workspaceId?: string; officeId?: string };
    if (data.workspaceId) {
      this.service.unsubscribe(socket, data.workspaceId);
      this.send(socket, {
        type: SOCKET_EVENTS.UNSUBSCRIBED,
        payload: { workspaceId: data.workspaceId, unsubscribedAt: Date.now() },
        timestamp: Date.now(),
      });
    }
  }

  private handleJoinWorkspace(socket: WSClient, payload: unknown): void {
    const data = payload as { workspaceId?: string };
    if (data.workspaceId) {
      this.service.subscribe(socket, data.workspaceId);
      this.send(socket, {
        type: 'room:joined',
        payload: { workspaceId: data.workspaceId, joinedAt: Date.now() },
        timestamp: Date.now(),
      });
    }
  }

  private handleLeaveWorkspace(socket: WSClient, payload: unknown): void {
    const data = payload as { workspaceId?: string };
    if (data.workspaceId) {
      this.service.unsubscribe(socket, data.workspaceId);
      this.send(socket, {
        type: 'room:left',
        payload: { workspaceId: data.workspaceId, leftAt: Date.now() },
        timestamp: Date.now(),
      });
    }
  }

  private handleAgentPositionUpdate(socket: WSClient, payload: unknown, workspaceId: string): void {
    const data = payload as {
      agentId?: string;
      positionX?: number;
      positionY?: number;
      rotation?: number;
      floor?: number;
    };
    if (data.agentId && data.positionX !== undefined && data.positionY !== undefined) {
      this.service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.AGENT_POSITION_UPDATE, {
        agentId: data.agentId,
        positionX: data.positionX,
        positionY: data.positionY,
        rotation: data.rotation ?? 0,
        floor: data.floor,
        workspaceId,
      });
    }
  }

  private send(socket: WSClient, message: OutboundMessage): void {
    if (socket.readyState === 1) {
      socket.send(JSON.stringify(message));
    }
  }
}
