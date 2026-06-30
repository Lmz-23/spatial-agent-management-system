// Shared types
export type { IAgent, AgentState, AgentUpdatePayload, CreateAgentPayload, AssignTaskPayload } from './types/agent.types.js';
export { AgentStatus } from './types/agent.types.js';

// Workspace types
export type {
  IWorkspace,
  IOffice,
  IDesk,
  Position,
  CreateWorkspacePayload,
  CreateOfficePayload,
  CreateDeskPayload,
  WorkspaceUpdatePayload,
} from './types/workspace.types.js';

// Task types
export type {
  ITask,
  CreateTaskPayload,
  UpdateTaskStatusPayload,
  TaskResponse,
} from './types/task.types.js';
export { TaskStatus, TaskPriority } from './types/task.types.js';

// WebSocket types
export type {
  WSMessage,
  WSPayload,
  WSClientMessage,
  AgentPositionPayload,
  AgentStatusPayload,
  TaskPayload,
  ErrorPayload,
  SubscriptionRequest,
  SubscriptionResponse,
  WSEventType,
} from './types/websocket.types.js';

// Constants
export * from './constants/agent.constants.js';
export * from './constants/workspace.constants.js';
export * from './constants/socket.events.js';

// Utils
export * from './utils/validation.utils.js';
export * from './utils/id.utils.js';
