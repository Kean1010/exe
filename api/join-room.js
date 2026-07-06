const {
  allowCors,
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
    const room = await getRoomByCode(code);

    if (!room) {
      json(res, 404, { error: "Room not found" });
      return;
    }

    if (room.player2_name) {
      json(res, 409, { error: "Room already has two players" });
      return;
    }

    const rows = await supabaseRequest(`rooms?code=eq.${encodeURIComponent(code)}`, {
      method: "PATCH",
      body: {
        player2_name: body.name || "Player 2",
        updated_at: new Date().toISOString()
      }
    });

    json(res, 200, {
      playerId: room.player2_id,
      playerSlot: 2,
      room: makeRoomSnapshot(rows?.[0] || room)
    });
  } catch (error) {
    json(res, 400, { error: error.message });
  }
};
