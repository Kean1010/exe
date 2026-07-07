const {
  MATCH_SECONDS,
  allowCors,
  getPlayerSlot,
  getRoomByCode,
  handleOptions,
  json,
  makeRoomSnapshot,
  readJson,
  supabaseRequest,
  randomUuid
} = require("./_supabase");

function buildLobbyResetPatch(room, targetSlot) {
  if (targetSlot === 2) {
    return {
      status: "lobby",
      started_at: null,
      match_duration_ms: MATCH_SECONDS * 1000,
      player2_id: randomUuid(),
      player2_name: "",
      player2_score: 0,
      updated_at: new Date().toISOString()
    };
  }

  if (room.player2_name) {
    return {
      status: "lobby",
      started_at: null,
      match_duration_ms: MATCH_SECONDS * 1000,
      player1_id: room.player2_id,
      player1_name: room.player2_name,
      player1_score: 0,
      player2_id: randomUuid(),
      player2_name: "",
      player2_score: 0,
      updated_at: new Date().toISOString()
    };
  }

  return {
    status: "finished",
    started_at: null,
    match_duration_ms: MATCH_SECONDS * 1000,
    player1_name: "",
    player1_score: 0,
    updated_at: new Date().toISOString()
  };
}

function buildForfeitPatch(room, targetSlot) {
  const winnerSlot = targetSlot === 1 ? 2 : 1;
  const winnerScoreField = `player${winnerSlot}_score`;
  const loserScoreField = `player${targetSlot}_score`;
  const winnerScore = Math.max(
    Number(room[winnerScoreField] || 0),
    Number(room[loserScoreField] || 0) + 1
  );

  return {
    status: "finished",
    [winnerScoreField]: winnerScore,
    updated_at: new Date().toISOString()
  };
}

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

    const requesterSlot = getPlayerSlot(room, body.playerId);
    if (!requesterSlot) {
      json(res, 403, { error: "Player not recognized for this room" });
      return;
    }

    const requestedTargetSlot = Number(body.targetSlot || requesterSlot);
    if (![1, 2].includes(requestedTargetSlot)) {
      json(res, 400, { error: "Invalid target slot" });
      return;
    }

    if (requestedTargetSlot !== requesterSlot && requestedTargetSlot !== (requesterSlot === 1 ? 2 : 1)) {
      json(res, 400, { error: "Target slot is not valid for this room" });
      return;
    }

    const targetName = room[`player${requestedTargetSlot}_name`] || "";
    if (!targetName && requestedTargetSlot !== requesterSlot) {
      json(res, 200, {
        room: makeRoomSnapshot(room)
      });
      return;
    }

    const patch =
      room.status === "live"
        ? buildForfeitPatch(room, requestedTargetSlot)
        : buildLobbyResetPatch(room, requestedTargetSlot);

    const rows = await supabaseRequest(`rooms?code=eq.${encodeURIComponent(code)}`, {
      method: "PATCH",
      body: patch
    });

    json(res, 200, {
      room: makeRoomSnapshot(rows?.[0] || room)
    });
  } catch (error) {
    json(res, 400, { error: error.message });
  }
};
