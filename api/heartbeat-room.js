const {
  allowCors,
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
    const room = await getRoomByCode(code);

    if (!room) {
      json(res, 404, { error: "Room not found" });
      return;
    }

    if (!getPlayerSlot(room, body.playerId)) {
      json(res, 403, { error: "Player not recognized for this room" });
      return;
    }

    const rows = await supabaseRequest(`rooms?code=eq.${encodeURIComponent(code)}`, {
      method: "PATCH",
      body: {
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
