import type { WebSocketService } from './websocket.service.js';
import type { WebSocket as WSClient } from '@fastify/websocket';
import { SOCKET_EVENTS, ROOM_EVENTS } from '@sams/shared';
import { authService, type TokenPayload } from '../../services/auth.service.js';
import type { FastifyBaseLogger } from 'fastify';

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

// Type guards for runtime validation
function isClientMessage(obj: unknown): obj is ClientMessage {
  return typeof obj === 'object' && obj !== null &&
    'type' in obj && typeof obj.type === 'string' &&
    'payload' in obj;
}

function isRecordWithStringKeys(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export class WebSocketGateway {
  private clients: Set<WSClient> = new Set();
  private messageCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly RATE_LIMIT_MAX = 30;
  private readonly RATE_WINDOW_MS = 10000;
  private clientCounter = 0;
  private readonly clientIds: Map<WSClient, string> = new Map();

  constructor(
    private readonly service: WebSocketService,
    private readonly log: FastifyBaseLogger,
  ) {}

  private getClientId(socket: WSClient): string {
    let clientId = this.clientIds.get(socket);
    if (!clientId) {
      clientId = `client_${++this.clientCounter}`;
      this.clientIds.set(socket, clientId);
    }
    return clientId;
  }

  private checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const clientData = this.messageCounts.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      this.messageCounts.set(clientId, { count: 1, resetTime: now + this.RATE_WINDOW_MS });
      return true;
    }

    if (clientData.count >= this.RATE_LIMIT_MAX) {
      return false;
    }

    clientData.count++;
    return true;
  }

  handleConnection(socket: WSClient, request: unknown): void {
    const req = request as { url?: string; headers?: Record<string, string> };
    const url = new URL(req.url ?? '/', `http://${req.headers?.host ?? 'localhost'}`);
    const token = url.searchParams.get('token');
    const workspaceId = url.searchParams.get('workspaceId') ?? 'default';

    // Verify JWT token if provided
    if (token) {
      try {
        const payload = authService.verifyToken(token);
        // Validate that token workspaceId matches the requested workspaceId
        if (payload.workspaceId !== workspaceId) {
          this.send(socket, {
            type: SOCKET_EVENTS.ERROR,
            payload: { code: 'UNAUTHORIZED', message: 'Token workspaceId mismatch' },
            timestamp: Date.now(),
          });
          socket.close(1008, 'Unauthorized');
          return;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid token';
        this.send(socket, {
          type: SOCKET_EVENTS.ERROR,
          payload: { code: 'UNAUTHORIZED', message },
          timestamp: Date.now(),
        });
        socket.close(1008, 'Unauthorized');
        return;
      }
    } else {
      // No token provided - reject connection
      this.send(socket, {
        type: SOCKET_EVENTS.ERROR,
        payload: { code: 'UNAUTHORIZED', message: 'Missing authentication token' },
        timestamp: Date.now(),
      });
      socket.close(1008, 'Unauthorized');
      return;
    }

    this.clients.add(socket);
    this.service.subscribe(socket, workspaceId);

    socket.on('message', (data) => {
      this.handleMessage(socket, data.toString(), workspaceId);
    });

    socket.on('close', () => {
      this.service.unsubscribeAll(socket);
      this.clients.delete(socket);
      this.clientIds.delete(socket);
    });

    socket.on('error', (error) => {
      this.log.error({ err: error }, 'WebSocket error');
    });

    this.send(socket, {
      type: SOCKET_EVENTS.CONNECTION,
      payload: { message: 'Connected to SAMS WebSocket', workspaceId },
      timestamp: Date.now(),
    });
  }

  private handleMessage(socket: WSClient, data: string, workspaceId: string): void {
    const clientId = this.getClientId(socket);
    if (!this.checkRateLimit(clientId)) {
      this.send(socket, {
        type: SOCKET_EVENTS.ERROR,
        payload: { code: 'RATE_LIMIT_EXCEEDED', message: 'Rate limit exceeded' },
        timestamp: Date.now(),
      });
      return;
    }

    try {
      const parsed = JSON.parse(data);
      if (!isClientMessage(parsed)) {
        this.send(socket, {
          type: SOCKET_EVENTS.ERROR,
          payload: { code: 'INVALID_MESSAGE', message: 'Invalid message format' },
          timestamp: Date.now(),
        });
        return;
      }
      const message = parsed;

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
    if (!isRecordWithStringKeys(payload)) return;
    const data = payload;
    if (data.workspaceId && typeof data.workspaceId === 'string') {
      this.service.subscribe(socket, data.workspaceId);
      this.send(socket, {
        type: SOCKET_EVENTS.SUBSCRIBED,
        payload: { workspaceId: data.workspaceId, subscribedAt: Date.now() },
        timestamp: Date.now(),
      });
    }
  }

  private handleUnsubscribe(socket: WSClient, payload: unknown): void {
    if (!isRecordWithStringKeys(payload)) return;
    const data = payload;
    if (data.workspaceId && typeof data.workspaceId === 'string') {
      this.service.unsubscribe(socket, data.workspaceId);
      this.send(socket, {
        type: SOCKET_EVENTS.UNSUBSCRIBED,
        payload: { workspaceId: data.workspaceId, unsubscribedAt: Date.now() },
        timestamp: Date.now(),
      });
    }
  }

  private handleJoinWorkspace(socket: WSClient, payload: unknown): void {
    if (!isRecordWithStringKeys(payload)) return;
    const data = payload;
    if (data.workspaceId && typeof data.workspaceId === 'string') {
      this.service.subscribe(socket, data.workspaceId);
      this.send(socket, {
        type: 'room:joined',
        payload: { workspaceId: data.workspaceId, joinedAt: Date.now() },
        timestamp: Date.now(),
      });
    }
  }

  private handleLeaveWorkspace(socket: WSClient, payload: unknown): void {
    if (!isRecordWithStringKeys(payload)) return;
    const data = payload;
    if (data.workspaceId && typeof data.workspaceId === 'string') {
      this.service.unsubscribe(socket, data.workspaceId);
      this.send(socket, {
        type: 'room:left',
        payload: { workspaceId: data.workspaceId, leftAt: Date.now() },
        timestamp: Date.now(),
      });
    }
  }

  private handleAgentPositionUpdate(socket: WSClient, payload: unknown, workspaceId: string): void {
    if (!isRecordWithStringKeys(payload)) return;
    const data = payload;
    if (
      typeof data.agentId === 'string' &&
      typeof data.positionX === 'number' &&
      typeof data.positionY === 'number'
    ) {
      this.service.broadcastToWorkspace(workspaceId, SOCKET_EVENTS.AGENT_POSITION_UPDATE, {
        agentId: data.agentId,
        positionX: data.positionX,
        positionY: data.positionY,
        rotation: typeof data.rotation === 'number' ? data.rotation : 0,
        floor: typeof data.floor === 'number' ? data.floor : undefined,
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
