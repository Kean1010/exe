const crypto = require("crypto");

const MATCH_SECONDS = 60;

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function allowCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function handleOptions(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}

function getEnv() {
  const supabaseUrl = process.env.REPQUEST_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.REPQUEST_SUPABASE_ANON_KEY || "";
  const supabaseServiceRoleKey = process.env.REPQUEST_SUPABASE_SERVICE_ROLE_KEY || "";

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    enabled: Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey)
  };
}

async function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1024 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", reject);
  });
}

function createRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  while (code.length < 5) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function makeRoomSnapshot(row) {
  const now = Date.now();
  const startedAt = row.started_at ? new Date(row.started_at).getTime() : null;
  const matchDurationMs = Number(row.match_duration_ms || MATCH_SECONDS * 1000);
  const elapsedMs = startedAt ? Math.max(0, now - startedAt) : 0;
  const timeLeftMs = startedAt
    ? Math.max(0, matchDurationMs - elapsedMs)
    : matchDurationMs;

  const players = [
    {
      id: row.player1_id,
      slot: 1,
      name: row.player1_name || "",
      score: Number(row.player1_score || 0),
      connected: Boolean(row.player1_name)
    },
    {
      id: row.player2_id,
      slot: 2,
      name: row.player2_name || "",
      score: Number(row.player2_score || 0),
      connected: Boolean(row.player2_name)
    }
  ];

  return {
    code: row.code,
    status: row.status,
    startedAt,
    matchDurationMs,
    timeLeftMs,
    players,
    winnerSlot:
      row.status === "finished"
        ? players[0].score === players[1].score
          ? 0
          : players[0].score > players[1].score
            ? 1
            : 2
        : 0
  };
}

async function supabaseRequest(pathname, { method = "GET", body } = {}) {
  const env = getEnv();
  if (!env.enabled) {
    throw new Error("Supabase environment variables are missing.");
  }

  const response = await fetch(`${env.supabaseUrl}/rest/v1/${pathname}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      Prefer: "return=representation"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Supabase request failed");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function getRoomByCode(code) {
  const rows = await supabaseRequest(
    `rooms?code=eq.${encodeURIComponent(String(code).toUpperCase())}&select=*`,
    { method: "GET" }
  );

  return rows?.[0] || null;
}

async function ensureUniqueRoomCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = createRoomCode();
    const existing = await getRoomByCode(code);
    if (!existing) {
      return code;
    }
  }

  throw new Error("Could not create a unique room code");
}

function getPlayerSlot(row, playerId) {
  if (row.player1_id === playerId) {
    return 1;
  }
  if (row.player2_id === playerId) {
    return 2;
  }
  return 0;
}

async function finalizeRoomIfExpired(row) {
  if (row.status !== "live" || !row.started_at) {
    return row;
  }

  const expiresAt = new Date(row.started_at).getTime() + Number(row.match_duration_ms || 0);
  if (Date.now() < expiresAt) {
    return row;
  }

  const updatedRows = await supabaseRequest(
    `rooms?code=eq.${encodeURIComponent(row.code)}`,
    {
      method: "PATCH",
      body: {
        status: "finished",
        updated_at: new Date().toISOString()
      }
    }
  );

  return updatedRows?.[0] || row;
}

module.exports = {
  MATCH_SECONDS,
  allowCors,
  finalizeRoomIfExpired,
  getEnv,
  getPlayerSlot,
  getRoomByCode,
  handleOptions,
  json,
  makeRoomSnapshot,
  readJson,
  supabaseRequest,
  ensureUniqueRoomCode,
  randomUuid: () => crypto.randomUUID()
};
