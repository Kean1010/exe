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
    const code = await ensureUniqueRoomCode();
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
        updated_at: new Date().toISOString()
      }
    });

    const room = rows?.[0];
    json(res, 201, {
      playerId,
      playerSlot: 1,
      room: makeRoomSnapshot(room)
    });
  } catch (error) {
    json(res, 400, { error: error.message });
  }
};
