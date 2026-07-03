import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { OfficeScene, createOfficeScene } from '../../office/OfficeScene';
import { useAgentsStore } from '../../store';
import type { Agent } from '../../types/simulation.types';
import './OfficeCanvas.css';

interface OfficeViewProps {
  width?: number;
  height?: number;
}

export function OfficeView(_props: OfficeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const sceneRef = useRef<OfficeScene | null>(null);
  const mountedRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountedRef.current) {
      // Primer mount (StrictMode) - solo marcar y skip
      mountedRef.current = true;
      return;
    }

    // Setup real (solo en segundo mount, cuando no es StrictMode simulation)
    let cancelled = false;

    async function initScene() {
      if (!containerRef.current || cancelled) return;

      try {
        const { app, scene } = await createOfficeScene(containerRef.current);

        if (cancelled) {
          app.destroy(true);
          return;
        }

        appRef.current = app;
        sceneRef.current = scene;

        // Sync demo agents with Zustand store for sidebar display
        const storeAgents: Agent[] = [];
        for (const agent of scene.getAgents()) {
          storeAgents.push({
            id: agent.id,
            name: agent.name,
            color: agent.role === 'ORQUESTADOR' ? '#ff4444' :
                   agent.role === 'CODER' ? '#4488ff' :
                   agent.role === 'REVIEWER' ? '#44ff44' : '#ffaa00',
            status: agent.state === 'WORKING' ? 'WORKING' :
                    agent.state === 'IDLE' ? 'IDLE' : 'WALKING',
            positionX: agent.sprite.x,
            positionY: agent.sprite.y,
            workspaceId: 'demo-workspace',
          });
        }
        useAgentsStore.getState().setAgents(storeAgents);

        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to initialize office scene:', error);
      }
    }

    initScene();

    // Cleanup real (solo cuando se desmonta definitivamente)
    return () => {
      cancelled = true;
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="office-canvas" ref={containerRef}>
      {!isLoaded && (
        <div className="office-loading">Loading Office...</div>
      )}
    </div>
  );
}
