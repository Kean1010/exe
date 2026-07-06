const {
  allowCors,
  finalizeRoomIfExpired,
  getPlayerSlot,
  getRoomByCode,
  handleOptions,
  json,
  makeRoomSnapshot,
  readJson
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

    if (!getPlayerSlot(room, body.playerId)) {
      json(res, 403, { error: "Player not recognized for this room" });
      return;
    }

    room = await finalizeRoomIfExpired(room);
    json(res, 200, {
      room: makeRoomSnapshot(room)
    });
  } catch (error) {
    json(res, 400, { error: error.message });
  }
};
