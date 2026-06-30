// WebSocket events

export const SOCKET_EVENTS = {
  // Agent events
  AGENT_POSITION_UPDATE: 'agent:position:update',
  AGENT_STATUS_CHANGE: 'agent:status:change',
  AGENT_CREATED: 'agent:created',
  AGENT_UPDATED: 'agent:updated',
  AGENT_DELETED: 'agent:deleted',
  AGENT_ASSIGNED: 'agent:assigned',

  // Task events
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_COMPLETED: 'task:completed',
  TASK_CANCELLED: 'task:cancelled',
  TASK_ASSIGNED: 'task:assigned',

  // Workspace events
  WORKSPACE_CREATED: 'workspace:created',
  WORKSPACE_UPDATED: 'workspace:updated',
  WORKSPACE_DELETED: 'workspace:deleted',

  // Office events
  OFFICE_CREATED: 'office:created',
  OFFICE_UPDATED: 'office:updated',
  OFFICE_DELETED: 'office:deleted',

  // Desk events
  DESK_CREATED: 'desk:created',
  DESK_UPDATED: 'desk:updated',
  DESK_DELETED: 'desk:deleted',
  DESK_OCCUPANCY_CHANGE: 'desk:occupancy:change',

  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Subscription events
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed',
} as const;

export const ROOM_EVENTS = {
  JOIN_WORKSPACE: 'room:join:workspace',
  LEAVE_WORKSPACE: 'room:leave:workspace',
  JOIN_OFFICE: 'room:join:office',
  LEAVE_OFFICE: 'room:leave:office',
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  WS_CONNECTION_ERROR: 'WS_CONNECTION_ERROR',
  INVALID_MESSAGE: 'INVALID_MESSAGE',
} as const;

export type SocketEventType = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
export type RoomEventType = (typeof ROOM_EVENTS)[keyof typeof ROOM_EVENTS];
export type ErrorCodeType = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
