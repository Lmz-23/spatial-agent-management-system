// Workspace related constants

export const MAX_WORKSPACES = 50;
export const MAX_OFFICES_PER_WORKSPACE = 20;
export const MAX_DESKS_PER_OFFICE = 50;

export const WORKSPACE_LIMITS = {
  MIN_WIDTH: 100,
  MAX_WIDTH: 10000,
  MIN_HEIGHT: 100,
  MAX_HEIGHT: 10000,
};

export const OFFICE_LIMITS = {
  MIN_WIDTH: 50,
  MAX_WIDTH: 5000,
  MIN_HEIGHT: 50,
  MAX_HEIGHT: 5000,
  MIN_FLOOR: 1,
  MAX_FLOOR: 100,
};

export const DESK_LIMITS = {
  MIN_WIDTH: 20,
  MAX_WIDTH: 200,
  MIN_HEIGHT: 20,
  MAX_HEIGHT: 200,
};

export const DEFAULT_WORKSPACE_NAME = 'Main Workspace';
export const DEFAULT_OFFICE_NAME = 'Office';
export const DEFAULT_DESK_NAME = 'Desk';

export const WORKSPACE_COLORS = [
  '#E8F4F8',
  '#FDF2E9',
  '#E8F8F5',
  '#F5EEF8',
  '#FEF9E7',
];

export const GRID_SIZE = 10; // pixels

export const OCCUPATION_STATUS = {
  FREE: 'free',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
} as const;
