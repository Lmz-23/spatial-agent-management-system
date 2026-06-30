export interface SpriteConfig {
  name: string;
  color: string;
  scale: number;
  rotation: number;
}

const DEFAULT_SPRITES: Record<string, SpriteConfig> = {
  'agent-default': { name: 'agent-default', color: '#4ECDC4', scale: 1, rotation: 0 },
  'agent-maintenance': { name: 'agent-maintenance', color: '#FF6B6B', scale: 1, rotation: 0 },
  'agent-delivery': { name: 'agent-delivery', color: '#45B7D1', scale: 1.2, rotation: 0 },
  'agent-security': { name: 'agent-security', color: '#96CEB4', scale: 1, rotation: 0 },
  'agent-cleaning': { name: 'agent-cleaning', color: '#FFEAA7', scale: 0.9, rotation: 0 },
  'agent-reception': { name: 'agent-reception', color: '#DDA0DD', scale: 1, rotation: 0 },
  'agent-guide': { name: 'agent-guide', color: '#98D8C8', scale: 1, rotation: 0 },
};

export function getSpriteConfig(spriteName: string): SpriteConfig {
  return DEFAULT_SPRITES[spriteName] ?? {
    name: 'agent-default',
    color: '#4ECDC4',
    scale: 1,
    rotation: 0,
  };
}

export function getAvailableSprites(): string[] {
  return Object.keys(DEFAULT_SPRITES);
}

export function validateSpriteName(name: string): boolean {
  return name in DEFAULT_SPRITES;
}
