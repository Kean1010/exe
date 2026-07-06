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

    const playerSlot = getPlayerSlot(room, body.playerId);
    if (!playerSlot) {
      json(res, 403, { error: "Player not recognized for this room" });
      return;
    }

    if (room.status !== "live") {
      json(res, 409, { error: "Match is not live", room: makeRoomSnapshot(room) });
      return;
    }

    const score = Math.max(0, Number(body.score || 0));
    const patch =
      playerSlot === 1
        ? { player1_score: Math.max(Number(room.player1_score || 0), score) }
        : { player2_score: Math.max(Number(room.player2_score || 0), score) };

    const rows = await supabaseRequest(`rooms?code=eq.${encodeURIComponent(code)}`, {
      method: "PATCH",
      body: {
        ...patch,
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
