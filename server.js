const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = 8080;
const ROOT = __dirname;
const MATCH_SECONDS = 60;
const ROOM_TTL_MS = 1000 * 60 * 60 * 6;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const rooms = new Map();

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 Not Found");
        return;
      }

      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("500 Server Error");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function parseBody(req) {
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

function createPlayer(name, slot) {
  return {
    id: crypto.randomUUID(),
    slot,
    name: name || `Player ${slot}`,
    score: 0,
    connected: false
  };
}

function makeRoomSnapshot(room) {
  const now = Date.now();
  const elapsedMs = room.startedAt ? Math.max(0, now - room.startedAt) : 0;
  const timeLeftMs = room.startedAt
    ? Math.max(0, room.matchDurationMs - elapsedMs)
    : room.matchDurationMs;

  return {
    code: room.code,
    status: room.status,
    startedAt: room.startedAt,
    matchDurationMs: room.matchDurationMs,
    timeLeftMs,
    players: room.players.map((player) => ({
      id: player.id,
      slot: player.slot,
      name: player.name,
      score: player.score,
      connected: player.connected
    })),
    winnerSlot:
      room.status === "finished"
        ? room.players[0].score === room.players[1].score
          ? 0
          : room.players[0].score > room.players[1].score
            ? 1
            : 2
        : 0
  };
}

function broadcastRoom(room) {
  const snapshot = makeRoomSnapshot(room);
  const payload = `data: ${JSON.stringify(snapshot)}\n\n`;

  room.subscribers.forEach((res) => {
    res.write(payload);
  });
}

function cleanupExpiredRooms() {
  const now = Date.now();

  for (const [code, room] of rooms.entries()) {
    if (now - room.updatedAt > ROOM_TTL_MS) {
      room.subscribers.forEach((res) => res.end());
      rooms.delete(code);
    }
  }
}

function getRoom(code) {
  return rooms.get(String(code || "").toUpperCase());
}

function ensureRoom(res, code) {
  const room = getRoom(code);

  if (!room) {
    json(res, 404, { error: "Room not found" });
    return null;
  }

  return room;
}

function ensurePlayer(res, room, playerId) {
  const player = room.players.find((entry) => entry.id === playerId);

  if (!player) {
    json(res, 403, { error: "Player not recognized for this room" });
    return null;
  }

  return player;
}

function finishRoomIfNeeded(room) {
  if (room.status !== "live" || !room.startedAt) {
    return;
  }

  const elapsedMs = Date.now() - room.startedAt;
  if (elapsedMs >= room.matchDurationMs) {
    room.status = "finished";
    room.updatedAt = Date.now();
    broadcastRoom(room);
  }
}

setInterval(() => {
  cleanupExpiredRooms();

  rooms.forEach((room) => {
    finishRoomIfNeeded(room);
  });
}, 1000);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname === "/api/rooms/create" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      let code = createRoomCode();

      while (rooms.has(code)) {
        code = createRoomCode();
      }

      const host = createPlayer(body.name, 1);
      const guest = createPlayer("", 2);
      guest.connected = false;

      const room = {
        code,
        status: "lobby",
        startedAt: null,
        matchDurationMs: MATCH_SECONDS * 1000,
        players: [host, guest],
        subscribers: new Set(),
        updatedAt: Date.now()
      };

      rooms.set(code, room);
      json(res, 201, {
        playerId: host.id,
        playerSlot: host.slot,
        room: makeRoomSnapshot(room)
      });
      return;
    } catch (error) {
      json(res, 400, { error: error.message });
      return;
    }
  }

  if (pathname === "/api/rooms/join" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const room = ensureRoom(res, body.code);
      if (!room) {
        return;
      }

      const guest = room.players[1];
      if (guest.connected && guest.name) {
        json(res, 409, { error: "Room already has two players" });
        return;
      }

      guest.name = body.name || "Player 2";
      guest.connected = false;
      room.updatedAt = Date.now();

      json(res, 200, {
        playerId: guest.id,
        playerSlot: guest.slot,
        room: makeRoomSnapshot(room)
      });
      return;
    } catch (error) {
      json(res, 400, { error: error.message });
      return;
    }
  }

  const eventsMatch = pathname.match(/^\/api\/rooms\/([A-Z0-9]+)\/events$/i);
  if (eventsMatch && req.method === "GET") {
    const room = ensureRoom(res, eventsMatch[1]);
    if (!room) {
      return;
    }

    const playerId = url.searchParams.get("playerId");
    const player = ensurePlayer(res, room, playerId);
    if (!player) {
      return;
    }

    player.connected = true;
    room.updatedAt = Date.now();

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });

    res.write(`data: ${JSON.stringify(makeRoomSnapshot(room))}\n\n`);
    room.subscribers.add(res);
    broadcastRoom(room);

    req.on("close", () => {
      room.subscribers.delete(res);
      player.connected = false;
      room.updatedAt = Date.now();
      broadcastRoom(room);
    });
    return;
  }

  const roomActionMatch = pathname.match(/^\/api\/rooms\/([A-Z0-9]+)\/(start|score|reset)$/i);
  if (roomActionMatch && req.method === "POST") {
    try {
      const room = ensureRoom(res, roomActionMatch[1]);
      if (!room) {
        return;
      }

      const body = await parseBody(req);
      const player = ensurePlayer(res, room, body.playerId);
      if (!player) {
        return;
      }

      const action = roomActionMatch[2];

      if (action === "start") {
        if (!room.players[0].name || !room.players[1].name) {
          json(res, 409, { error: "Both players must join before starting" });
          return;
        }

        room.status = "live";
        room.startedAt = Date.now();
        room.players.forEach((entry) => {
          entry.score = 0;
        });
      }

      if (action === "score") {
        if (room.status !== "live") {
          json(res, 409, { error: "Match is not live" });
          return;
        }

        const safeScore = Math.max(0, Number(body.score || 0));
        player.score = Math.max(player.score, safeScore);
      }

      if (action === "reset") {
        room.status = "lobby";
        room.startedAt = null;
        room.players.forEach((entry) => {
          entry.score = 0;
        });
      }

      room.updatedAt = Date.now();
      finishRoomIfNeeded(room);
      broadcastRoom(room);
      json(res, 200, { room: makeRoomSnapshot(room) });
      return;
    } catch (error) {
      json(res, 400, { error: error.message });
      return;
    }
  }

  const requestPath = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden");
    return;
  }

  sendFile(filePath, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`RepQuest server running at http://localhost:${PORT}`);
});
