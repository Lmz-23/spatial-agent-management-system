// Agent related constants
export const MAX_AGENTS = 100;
export const MAX_AGENTS_PER_OFFICE = 20;
export const AGENT_SPEED = {
    WALKING: 2,
    RUNNING: 5,
    IDLE: 0,
};
export const AGENT_COLORS = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD',
    '#98D8C8',
    '#F7DC6F',
];
export const DEFAULT_SPRITE = 'agent-default';
export const AGENT_STATE_TIMEOUTS = {
    IDLE: 5000,
    WORKING: 30000,
    BLOCKED: 10000,
};
export const POSITION_UPDATE_INTERVAL = 100; // ms
export const AGENT_TYPES = [
    'maintenance',
    'delivery',
    'security',
    'cleaning',
    'reception',
    'guide',
];
//# sourceMappingURL=agent.constants.js.map