const {
  MATCH_SECONDS,
  allowCors,
  ensureUniqueRoomCode,
  handleOptions,
  json,
  makeRoomSnapshot,
  readJson,
  supabaseRequest,
  randomUuid
} = require("./_supabase");

const WAITING_ROOM_PREFIX = "Q";
const FRESH_WAITING_WINDOW_MS = 20000;

module.exports = async (req, res) => {
  if (handleOptions(req, res)) {
    return;
  }

  allowCors(res);

  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJson(req);
    const nowIso = new Date().toISOString();
    const cutoffIso = new Date(Date.now() - FRESH_WAITING_WINDOW_MS).toISOString();

    const waitingRooms = await supabaseRequest(
      `rooms?code=like.${WAITING_ROOM_PREFIX}%25&status=eq.lobby&player2_name=eq.&updated_at=gte.${encodeURIComponent(cutoffIso)}&order=updated_at.asc&limit=1`,
      { method: "GET" }
    );

    const waitingRoom = waitingRooms?.[0];
    if (waitingRoom) {
      const rows = await supabaseRequest(`rooms?code=eq.${encodeURIComponent(waitingRoom.code)}`, {
        method: "PATCH",
        body: {
          player2_name: body.name || "Player 2",
          updated_at: nowIso
        }
      });

      json(res, 200, {
        matched: true,
        playerId: waitingRoom.player2_id,
        playerSlot: 2,
        room: makeRoomSnapshot(rows?.[0] || waitingRoom)
      });
      return;
    }

    const code = await ensureUniqueRoomCode({ prefix: WAITING_ROOM_PREFIX });
    const playerId = randomUuid();
    const rows = await supabaseRequest("rooms", {
      method: "POST",
      body: {
        code,
        status: "lobby",
        started_at: null,
        match_duration_ms: MATCH_SECONDS * 1000,
        player1_id: playerId,
        player1_name: body.name || "Player 1",
        player1_score: 0,
        player2_id: randomUuid(),
        player2_name: "",
        player2_score: 0,
        updated_at: nowIso
      }
    });

    json(res, 201, {
      matched: false,
      playerId,
      playerSlot: 1,
      room: makeRoomSnapshot(rows?.[0])
    });
  } catch (error) {
    json(res, 400, { error: error.message });
  }
};
