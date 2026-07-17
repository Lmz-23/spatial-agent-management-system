// SAMS Bridge POC — script standalone
//
// Objetivo: validar el flujo de eventos opencode → backend SAMS antes
// de construir el bridge completo. Single agent, hardcoded, una dirección.
//
// Ejecutar:  cd /home/lmz/sams && npx tsx scripts/poc-bridge.ts
// Apagar:    Ctrl+C
//
// REQUISITOS:
//   - opencode corriendo en localhost:54321 (o OPENCODE_API)
//   - backend SAMS corriendo en localhost:3000 (o SAMS_API)
//   - seed ejecutado (Agent Charlie existe en BD)
//   - Charlie tiene el UUID hardcodeado abajo (verificado contra seed.ts)
//   - SAMS_API_TOKEN debe contener un JWT válido para el backend protegido

import { appendFileSync } from "node:fs";
import {
  createOpencodeClient,
  type Event,
} from "/home/lmz/.config/opencode/node_modules/@opencode-ai/sdk/dist/index.js";

// === HARDCODE POC ===
const OPENCODE_API = process.env.OPENCODE_API ?? "http://localhost:54321";
const SAMS_API = process.env.SAMS_API ?? "http://localhost:3000";
const SAMS_API_TOKEN = process.env.SAMS_API_TOKEN;
const CHARLIE_AGENT_ID = "00000000-0000-0000-0000-000000000003";
const POC_LOG_PATH = "/tmp/sams-bridge-poc.log";
// ====================

type AgentStatus = "WORKING" | "IDLE";

type AgentResponse = {
  id: string;
  name: string;
  status: string;
};

type PatchResponse = {
  data?: AgentResponse;
};

// Mapa sessionID → estado del POC para evitar pasar a IDLE
// sesiones que nunca fueron marcadas como WORKING.
const sessionState = new Map<string, AgentStatus>();

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function log(message: string, details?: unknown): void {
  const ts = new Date().toISOString();
  const suffix = details === undefined ? "" : ` ${JSON.stringify(details)}`;
  const line = `[POC ${ts}] ${message}${suffix}`;

  try {
    appendFileSync(POC_LOG_PATH, `${line}\n`);
  } catch (error: unknown) {
    console.error(`[POC ${ts}] No se pudo escribir ${POC_LOG_PATH}: ${formatError(error)}`);
  }

  if (details === undefined) {
    console.log(line);
  } else {
    console.log(line, details);
  }
}

function buildSamsHeaders(): Headers {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (SAMS_API_TOKEN) {
    headers.set("Authorization", `Bearer ${SAMS_API_TOKEN}`);
  }
  return headers;
}

async function patchAgentStatus(status: AgentStatus): Promise<void> {
  const url = `${SAMS_API}/api/agents/${CHARLIE_AGENT_ID}/status`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: buildSamsHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const body = await response.text();
      log(`PATCH ${url} → ${response.status} ${response.statusText}`, {
        status,
        body: body.slice(0, 200),
      });
      return;
    }

    const payload = (await response.json()) as PatchResponse;
    log(`PATCH ${url} → ${response.status}`, {
      status,
      agent: payload.data
        ? {
            id: payload.data.id,
            name: payload.data.name,
            status: payload.data.status,
          }
        : payload,
    });
  } catch (error: unknown) {
    log(`PATCH ${url} → network error`, {
      status,
      error: formatError(error),
    });
  }
}

async function handleEvent(event: Event): Promise<void> {
  if (event.type === "message.updated") {
    const { info } = event.properties;

    // UserMessage expone `agent` directamente (no-opcional, string).
    // Cuando llega un mensaje de usuario sabemos qué agente está activo.
    // AssistantMessage no expone `agent`, por eso el guard sobre `role`.
    // `sessionID` aquí es el mismo campo string que en `session.idle`,
    // así que el mapa sessionState correlaciona ambos eventos sin mapeo extra.
    if (info.role === "user" && info.agent != null) {
      log("message.updated (user message)", {
        sessionID: info.sessionID,
        agent: info.agent,
        messageID: info.id,
      });
      sessionState.set(info.sessionID, "WORKING");
      await patchAgentStatus("WORKING");
    }
    return;
  }

  if (event.type === "session.idle") {
    const { sessionID } = event.properties;
    if (sessionState.get(sessionID) === "WORKING") {
      log("session.idle", { sessionID });
      sessionState.set(sessionID, "IDLE");
      await patchAgentStatus("IDLE");
    }
  }
}

async function subscribeToEvents(): Promise<void> {
  const client = createOpencodeClient({ baseUrl: OPENCODE_API });
  const { stream } = await client.event.subscribe({
    onSseError: (error: unknown) => {
      log("SSE error; el SDK reintentará la conexión", {
        error: formatError(error),
      });
    },
  });

  log("Bridge escuchando eventos. Ctrl+C para salir.");
  for await (const event of stream) {
    await handleEvent(event);
  }
}

async function main(): Promise<void> {
  log("Iniciando bridge POC...");
  log("Configuración", {
    opencodeApi: OPENCODE_API,
    samsApi: SAMS_API,
    charlieAgentId: CHARLIE_AGENT_ID,
    samsApiTokenConfigured: SAMS_API_TOKEN !== undefined,
  });

  await subscribeToEvents();
}

main().catch((error: unknown) => {
  console.error(`[POC] Error fatal: ${formatError(error)}`);
  process.exitCode = 1;
});
