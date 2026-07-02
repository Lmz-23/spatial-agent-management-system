import { useCallback } from 'react';
import { Graphics } from '@pixi/react';
import type { Agent } from '../../types/simulation.types';

interface AgentSpriteProps {
  agent: Agent;
  size?: number;
}

export function AgentSprite({ agent, size = 30 }: AgentSpriteProps) {
  const color = parseInt(agent.color.replace('#', ''), 16);

  const draw = useCallback(
    (g: import('pixi.js').Graphics) => {
      g.clear();
      g.beginFill(color);
      g.drawCircle(0, 0, size / 2);
      g.endFill();
      g.lineStyle(2, 0xffffff, 0.5);
      g.drawCircle(0, 0, size / 2 + 4);
    },
    [color, size]
  );

  return (
    <Graphics
      draw={draw}
      x={agent.positionX}
      y={agent.positionY}
      anchor={0.5}
    />
  );
}
