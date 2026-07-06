const {
  allowCors,
  finalizeRoomIfExpired,
  getPlayerSlot,
  getRoomByCode,
  handleOptions,
  json,
  makeRoomSnapshot,
  readJson,
  supabaseRequest
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
    const code = String(body.code || "").trim().toUpperCase();
    let room = await getRoomByCode(code);

    if (!room) {
      json(res, 404, { error: "Room not found" });
      return;
    }

    room = await finalizeRoomIfExpired(room);

    if (!getPlayerSlot(room, body.playerId)) {
      json(res, 403, { error: "Player not recognized for this room" });
      return;
    }

    if (!room.player1_name || !room.player2_name) {
      json(res, 409, { error: "Both players must join before starting" });
      return;
    }

    const rows = await supabaseRequest(`rooms?code=eq.${encodeURIComponent(code)}`, {
      method: "PATCH",
      body: {
        status: "live",
        started_at: new Date().toISOString(),
        player1_score: 0,
        player2_score: 0,
        updated_at: new Date().toISOString()
      }
    });

    json(res, 200, {
      room: makeRoomSnapshot(rows?.[0] || room)
    });
  } catch (error) {
    json(res, 400, { error: error.message });
  }
};
