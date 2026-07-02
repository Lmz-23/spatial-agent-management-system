import { useCallback } from 'react';
import { Stage, Container, Graphics, useTick } from '@pixi/react';
import { AgentSprite } from './AgentSprite';
import { useAgents } from '../../hooks/useAgents';
import './OfficeCanvas.css';

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const OFFICE_WALL = 0xe0e0e0;
const OFFICE_FLOOR = 0xd4d4d4;
const WALL_THICKNESS = 20;

function OfficeBackground() {
  const draw = useCallback((g: import('pixi.js').Graphics) => {
    // Fondo exterior (paredes)
    g.clear();
    g.beginFill(OFFICE_WALL);
    g.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    g.endFill();

    // Piso interior (oficina real)
    g.beginFill(OFFICE_FLOOR);
    g.drawRect(
      WALL_THICKNESS,
      WALL_THICKNESS,
      CANVAS_WIDTH - WALL_THICKNESS * 2,
      CANVAS_HEIGHT - WALL_THICKNESS * 2
    );
    g.endFill();

    // Línea de borde interior
    g.lineStyle(2, 0xbbbbbb, 0.5);
    g.drawRect(
      WALL_THICKNESS,
      WALL_THICKNESS,
      CANVAS_WIDTH - WALL_THICKNESS * 2,
      CANVAS_HEIGHT - WALL_THICKNESS * 2
    );

    // Línea de borde exterior
    g.lineStyle(4, 0x888888, 1);
    g.drawRect(2, 2, CANVAS_WIDTH - 4, CANVAS_HEIGHT - 4);

    // Grid sutil en el piso
    g.lineStyle(1, 0xcccccc, 0.3);
    const gridSize = 100;
    for (let x = WALL_THICKNESS; x < CANVAS_WIDTH - WALL_THICKNESS; x += gridSize) {
      g.moveTo(x, WALL_THICKNESS);
      g.lineTo(x, CANVAS_HEIGHT - WALL_THICKNESS);
    }
    for (let y = WALL_THICKNESS; y < CANVAS_HEIGHT - WALL_THICKNESS; y += gridSize) {
      g.moveTo(WALL_THICKNESS, y);
      g.lineTo(CANVAS_WIDTH - WALL_THICKNESS, y);
    }
  }, []);

  return <Graphics draw={draw} />;
}

function ViewportController() {
  useTick?.(() => {});
  return null;
}

export function OfficeCanvas() {
  const { agents } = useAgents();

  return (
    <div className="office-canvas">
      <Stage
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        options={{
          backgroundColor: OFFICE_WALL,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        }}
      >
        <Container sortableChildren>
          <OfficeBackground />
          {agents.map((agent) => (
            <AgentSprite key={agent.id} agent={agent} size={30} />
          ))}
        </Container>
        <ViewportController />
      </Stage>
    </div>
  );
}
