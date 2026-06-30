export declare const MAX_AGENTS = 100;
export declare const MAX_AGENTS_PER_OFFICE = 20;
export declare const AGENT_SPEED: {
    WALKING: number;
    RUNNING: number;
    IDLE: number;
};
export declare const AGENT_COLORS: string[];
export declare const DEFAULT_SPRITE = "agent-default";
export declare const AGENT_STATE_TIMEOUTS: {
    IDLE: number;
    WORKING: number;
    BLOCKED: number;
};
export declare const POSITION_UPDATE_INTERVAL = 100;
export declare const AGENT_TYPES: readonly ["maintenance", "delivery", "security", "cleaning", "reception", "guide"];
export type AgentType = (typeof AGENT_TYPES)[number];
//# sourceMappingURL=agent.constants.d.ts.map