import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const countBurst = document.getElementById("countBurst");

const startCameraBtn = document.getElementById("startCameraBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const modeButtons = [...document.querySelectorAll(".mode-btn")];
const remoteRoomCard = document.getElementById("remoteRoomCard");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const roomCodeInput = document.getElementById("roomCodeInput");
const roomCodeValue = document.getElementById("roomCodeValue");
const playerSlotLabel = document.getElementById("playerSlotLabel");
const roomStatusBadge = document.getElementById("roomStatusBadge");
const roomHelpText = document.getElementById("roomHelpText");
const startRemoteMatchBtn = document.getElementById("startRemoteMatchBtn");
const resetRemoteMatchBtn = document.getElementById("resetRemoteMatchBtn");

const cameraStatus = document.getElementById("cameraStatus");
const poseStatus = document.getElementById("poseStatus");
const modeLabel = document.getElementById("modeLabel");
const modeHelp = document.getElementById("modeHelp");
const liveCount = document.getElementById("liveCount");
const hudLiveCount = document.getElementById("hudLiveCount");
const formState = document.getElementById("formState");
const stageValue = document.getElementById("stageValue");
const targetValue = document.getElementById("targetValue");
const hudTarget = document.getElementById("hudTarget");
const player1Score = document.getElementById("player1Score");
const player2Score = document.getElementById("player2Score");
const roundLabel = document.getElementById("roundLabel");
const statusText = document.getElementById("statusText");

const STAGE_START = 10;
const STAGE_STEP = 5;
const MATCH_SECONDS = 60;

const gameState = {
  mode: "single",
  running: false,
  facingMode: "user",
  totalReps: 0,
  stage: 1,
  singleStageReps: 0,
  currentTarget: STAGE_START,
  repPhase: "up",
  lastRepAt: 0,
  currentAngle: null,
  remote: {
    playerId: "",
    playerSlot: 0,
    roomCode: "",
    stream: null,
    snapshot: null,
    scoreSent: 0
  }
};

let poseLandmarker;
let drawingUtils;
let stream;
let lastVideoTime = -1;
let animationFrameId;
let countBurstTimeoutId;
let lastStableLandmarks = null;
let lastStablePoseAt = 0;

function setCameraPresentation(active) {
  document.body.classList.toggle("camera-live", active);
}

function getDisplayedCount() {
  return gameState.mode === "single"
    ? gameState.singleStageReps
    : gameState.totalReps;
}

function flashCountOverlay(value) {
  countBurst.textContent = String(value);
  countBurst.classList.remove("active");
  void countBurst.offsetWidth;
  countBurst.classList.add("active");

  clearTimeout(countBurstTimeoutId);
  countBurstTimeoutId = setTimeout(() => {
    countBurst.classList.remove("active");
  }, 720);
}

function speakCount(value) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(String(value));
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

function resetRemoteState() {
  if (gameState.remote.stream) {
    gameState.remote.stream.close();
  }

  gameState.remote = {
    playerId: "",
    playerSlot: 0,
    roomCode: "",
    stream: null,
    snapshot: null,
    scoreSent: 0
  };
}

function clearGameplayCounters() {
  gameState.running = false;
  gameState.totalReps = 0;
  gameState.stage = 1;
  gameState.singleStageReps = 0;
  gameState.currentTarget = STAGE_START;
  gameState.repPhase = "up";
  gameState.lastRepAt = 0;
  gameState.currentAngle = null;
  countBurst.classList.remove("active");
  countBurst.textContent = "0";
}

function getRemotePlayers() {
  return gameState.remote.snapshot?.players ?? [
    { name: "Player 1", score: 0, connected: false },
    { name: "Player 2", score: 0, connected: false }
  ];
}

function getRemoteTimeLeftMs() {
  const snapshot = gameState.remote.snapshot;
  if (!snapshot) {
    return MATCH_SECONDS * 1000;
  }

  if (snapshot.status !== "live" || !snapshot.startedAt) {
    return snapshot.matchDurationMs ?? MATCH_SECONDS * 1000;
  }

  const elapsedMs = Date.now() - snapshot.startedAt;
  return Math.max(0, (snapshot.matchDurationMs ?? MATCH_SECONDS * 1000) - elapsedMs);
}

function getRemoteStatusLine() {
  const snapshot = gameState.remote.snapshot;
  if (!snapshot || !gameState.remote.roomCode) {
    return "Create a room on one phone, share the code, then have the second player join from their own phone.";
  }

  if (snapshot.status === "lobby") {
    return snapshot.players[1]?.name
      ? "Both players are in. Start the online match when you are ready."
      : "Room created. Share the code so Player 2 can join.";
  }

  if (snapshot.status === "live") {
    return "Match is live on both phones. Keep squatting until the timer hits zero.";
  }

  if (snapshot.status === "finished") {
    if (snapshot.winnerSlot === 0) {
      return "The online match ended in a tie.";
    }

    return `Player ${snapshot.winnerSlot} wins the online match.`;
  }

  return "Online match ready.";
}

function updateRoomUi() {
  const remoteActive = gameState.mode === "versus";
  remoteRoomCard.hidden = !remoteActive;

  if (!remoteActive) {
    return;
  }

  roomCodeValue.textContent = gameState.remote.roomCode || "-----";
  playerSlotLabel.textContent = gameState.remote.playerSlot
    ? `Player ${gameState.remote.playerSlot}`
    : "Not Joined";

  const snapshot = gameState.remote.snapshot;
  roomStatusBadge.textContent = snapshot?.status
    ? snapshot.status[0].toUpperCase() + snapshot.status.slice(1)
    : "No Room";
  roomHelpText.textContent = getRemoteStatusLine();

  const canStart =
    snapshot &&
    snapshot.status === "lobby" &&
    snapshot.players.every((player) => player.name);
  const canReset = Boolean(snapshot);

  startRemoteMatchBtn.disabled = !canStart;
  resetRemoteMatchBtn.disabled = !canReset;
}

function renderStats() {
  if (gameState.mode === "single") {
    liveCount.textContent = String(gameState.singleStageReps);
    hudLiveCount.textContent = liveCount.textContent;
    stageValue.textContent = String(gameState.stage);
    targetValue.textContent = `${gameState.currentTarget} reps`;
    hudTarget.textContent = targetValue.textContent;
    roundLabel.textContent = "Solo Run";
  } else {
    const remotePlayers = getRemotePlayers();
    const timeLeftMs = getRemoteTimeLeftMs();
    const localScore = gameState.totalReps;

    liveCount.textContent = String(localScore);
    hudLiveCount.textContent = liveCount.textContent;
    stageValue.textContent = gameState.remote.playerSlot
      ? `P${gameState.remote.playerSlot}`
      : "Room";
    targetValue.textContent = `${Math.ceil(timeLeftMs / 1000)}s`;
    hudTarget.textContent = targetValue.textContent;
    roundLabel.textContent = gameState.remote.roomCode
      ? `Room ${gameState.remote.roomCode}`
      : "Online Battle";
    player1Score.textContent = String(remotePlayers[0]?.score ?? 0);
    player2Score.textContent = String(remotePlayers[1]?.score ?? 0);
    statusText.textContent = getRemoteStatusLine();
  }

  if (gameState.mode === "single") {
    player1Score.textContent = "0";
    player2Score.textContent = "0";
    statusText.textContent =
      gameState.running
        ? `Stage ${gameState.stage} is running. Reach ${gameState.currentTarget} squats.`
        : "Start the camera, line up sideways, and the game will begin automatically.";
  }

  updateRoomUi();
}

async function apiRequest(pathname, options = {}) {
  const response = await fetch(pathname, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function applyRemoteSnapshot(snapshot) {
  gameState.remote.snapshot = snapshot;

  if (gameState.mode !== "versus") {
    return;
  }

  if (snapshot.status === "live") {
    if (!gameState.running) {
      gameState.totalReps = 0;
      gameState.remote.scoreSent = 0;
    }
    gameState.running = true;
  } else {
    gameState.running = false;
  }

  renderStats();
}

function connectRoomStream() {
  if (!gameState.remote.roomCode || !gameState.remote.playerId) {
    return;
  }

  if (gameState.remote.stream) {
    gameState.remote.stream.close();
  }

  const stream = new EventSource(
    `/api/rooms/${gameState.remote.roomCode}/events?playerId=${encodeURIComponent(gameState.remote.playerId)}`
  );

  stream.onmessage = (event) => {
    const snapshot = JSON.parse(event.data);
    applyRemoteSnapshot(snapshot);
  };

  stream.onerror = () => {
    roomHelpText.textContent = "Realtime connection dropped. Trying to reconnect...";
  };

  gameState.remote.stream = stream;
}

async function createRoom() {
  const payload = await apiRequest("/api/rooms/create", {
    method: "POST",
    body: { name: "Player 1" }
  });

  gameState.remote.playerId = payload.playerId;
  gameState.remote.playerSlot = payload.playerSlot;
  gameState.remote.roomCode = payload.room.code;
  gameState.remote.snapshot = payload.room;
  gameState.remote.scoreSent = 0;
  roomCodeInput.value = payload.room.code;
  connectRoomStream();
  renderStats();
}

async function joinRoom() {
  const code = roomCodeInput.value.trim().toUpperCase();
  if (!code) {
    roomHelpText.textContent = "Enter the room code from Player 1.";
    return;
  }

  const payload = await apiRequest("/api/rooms/join", {
    method: "POST",
    body: { code, name: "Player 2" }
  });

  gameState.remote.playerId = payload.playerId;
  gameState.remote.playerSlot = payload.playerSlot;
  gameState.remote.roomCode = payload.room.code;
  gameState.remote.snapshot = payload.room;
  gameState.remote.scoreSent = 0;
  roomCodeInput.value = payload.room.code;
  connectRoomStream();
  renderStats();
}

async function startRemoteMatch() {
  if (!gameState.remote.roomCode || !gameState.remote.playerId) {
    roomHelpText.textContent = "Create or join a room first.";
    return;
  }

  const payload = await apiRequest(`/api/rooms/${gameState.remote.roomCode}/start`, {
    method: "POST",
    body: { playerId: gameState.remote.playerId }
  });

  gameState.totalReps = 0;
  gameState.remote.scoreSent = 0;
  applyRemoteSnapshot(payload.room);
}

async function resetRemoteMatch() {
  if (!gameState.remote.roomCode || !gameState.remote.playerId) {
    resetRemoteState();
    renderStats();
    return;
  }

  const payload = await apiRequest(`/api/rooms/${gameState.remote.roomCode}/reset`, {
    method: "POST",
    body: { playerId: gameState.remote.playerId }
  });

  gameState.totalReps = 0;
  gameState.remote.scoreSent = 0;
  applyRemoteSnapshot(payload.room);
}

async function syncRemoteScore() {
  if (
    gameState.mode !== "versus" ||
    !gameState.remote.roomCode ||
    !gameState.remote.playerId ||
    gameState.remote.scoreSent === gameState.totalReps ||
    gameState.remote.snapshot?.status !== "live"
  ) {
    return;
  }

  gameState.remote.scoreSent = gameState.totalReps;
  await apiRequest(`/api/rooms/${gameState.remote.roomCode}/score`, {
    method: "POST",
    body: {
      playerId: gameState.remote.playerId,
      score: gameState.totalReps
    }
  }).catch(() => {
    roomHelpText.textContent = "Could not send your score update. We will try again on the next rep.";
    gameState.remote.scoreSent = Math.max(0, gameState.totalReps - 1);
  });
}

async function setupPoseLandmarker() {
  poseStatus.textContent = "Loading pose model...";

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );

  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numPoses: 1
  });

  drawingUtils = new DrawingUtils(ctx);
  poseStatus.textContent = "Pose model ready";
}

async function startCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  cameraStatus.textContent = "Requesting camera...";

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: gameState.facingMode
      },
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    setCameraPresentation(true);
    startCameraBtn.style.display = "none";
    resizeCanvas();
    cameraStatus.textContent =
      gameState.facingMode === "user" ? "Front camera live" : "Rear camera live";

    clearGameplayCounters();
    if (gameState.mode === "single") {
      gameState.running = true;
      statusText.textContent = `Camera is live. Stage ${gameState.stage} is running.`;
    } else {
      statusText.textContent = getRemoteStatusLine();
    }

    renderStats();

    if (!animationFrameId) {
      predictLoop();
    }
  } catch (error) {
    console.error(error);
    setCameraPresentation(false);
    startCameraBtn.style.display = "";
    cameraStatus.textContent = "Camera blocked";
    statusText.textContent =
      "We could not access the camera. Open this app in a secure browser tab and allow camera access.";
  }
}

function resizeCanvas() {
  const rect = video.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  if (video.videoWidth && video.videoHeight) {
    const stack = video.parentElement;
    if (stack) {
      stack.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
    }
  }
}

function setMode(mode) {
  if (gameState.mode === "versus" && mode !== "versus") {
    resetRemoteState();
  }

  gameState.mode = mode;
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  if (mode === "single") {
    modeLabel.textContent = "Single Player";
    modeHelp.textContent =
      "Clear stage goals. Stage 1 starts at 10 squats and every stage adds 5 more.";
    roundLabel.textContent = "Solo Run";
  } else {
    modeLabel.textContent = "2 Players";
    modeHelp.textContent =
      "Two phones join the same room and race live for 60 seconds.";
    roundLabel.textContent = "Online Battle";
  }

  clearGameplayCounters();
  renderStats();
}

function calculateAngle(a, b, c) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x);

  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) {
    angle = 360 - angle;
  }
  return angle;
}

function landmarkVisible(landmark) {
  return landmark && (landmark.visibility ?? 1) > 0.55;
}

function estimateSquatState(landmarks) {
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  const leftReady =
    landmarkVisible(leftHip) &&
    landmarkVisible(leftKnee) &&
    landmarkVisible(leftAnkle);
  const rightReady =
    landmarkVisible(rightHip) &&
    landmarkVisible(rightKnee) &&
    landmarkVisible(rightAnkle);

  if (!leftReady && !rightReady) {
    return { state: "No pose", angle: null };
  }

  const angles = [];
  if (leftReady) {
    angles.push(calculateAngle(leftHip, leftKnee, leftAnkle));
  }
  if (rightReady) {
    angles.push(calculateAngle(rightHip, rightKnee, rightAnkle));
  }

  const angle = angles.reduce((sum, value) => sum + value, 0) / angles.length;

  if (angle < 115) {
    return { state: "Down", angle };
  }
  if (angle > 160) {
    return { state: "Up", angle };
  }
  return { state: "Moving", angle };
}

function trackSquat(stateInfo) {
  formState.textContent = stateInfo.state;
  gameState.currentAngle = stateInfo.angle;

  if (!gameState.running || !stateInfo.angle) {
    return;
  }

  const now = performance.now();

  if (stateInfo.state === "Down") {
    gameState.repPhase = "down";
  }

  if (
    stateInfo.state === "Up" &&
    gameState.repPhase === "down" &&
    now - gameState.lastRepAt > 700
  ) {
    gameState.lastRepAt = now;
    gameState.repPhase = "up";
    registerRep();
  }
}

function registerRep() {
  gameState.totalReps += 1;

  if (gameState.mode === "single") {
    gameState.singleStageReps += 1;

    if (gameState.singleStageReps >= gameState.currentTarget) {
      gameState.stage += 1;
      gameState.singleStageReps = 0;
      gameState.currentTarget = STAGE_START + (gameState.stage - 1) * STAGE_STEP;
      statusText.textContent = `Stage cleared. Welcome to Stage ${gameState.stage}. New target: ${gameState.currentTarget}.`;
    }
  }

  renderStats();
  const displayCount = getDisplayedCount();
  flashCountOverlay(displayCount);
  speakCount(displayCount);
  syncRemoteScore();
}

function drawPose(result) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!result?.length) {
    return;
  }

  for (const landmarks of result) {
    drawingUtils.drawConnectors(
      landmarks,
      PoseLandmarker.POSE_CONNECTIONS,
      { color: "#5ef2c2", lineWidth: 3 }
    );
    drawingUtils.drawLandmarks(landmarks, {
      color: "#ffd166",
      lineWidth: 1.5,
      radius: 4
    });
  }
}

async function predictLoop() {
  if (!poseLandmarker || video.readyState < 2) {
    animationFrameId = requestAnimationFrame(predictLoop);
    return;
  }

  resizeCanvas();

  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    const result = poseLandmarker.detectForVideo(video, performance.now());

    if (result.landmarks?.[0]) {
      lastStableLandmarks = result.landmarks;
      lastStablePoseAt = performance.now();
      drawPose(result.landmarks);
      const stateInfo = estimateSquatState(result.landmarks[0]);
      trackSquat(stateInfo);
      poseStatus.textContent =
        stateInfo.angle == null
          ? "Find a full side view"
          : `${stateInfo.state} | knee angle ${Math.round(stateInfo.angle)} deg`;
    } else {
      formState.textContent = "Searching";
      if (lastStableLandmarks && performance.now() - lastStablePoseAt < 180) {
        drawPose(lastStableLandmarks);
        poseStatus.textContent = "Hold position";
      } else {
        drawPose(null);
        poseStatus.textContent = "Searching for your pose";
      }
    }
  }

  animationFrameId = requestAnimationFrame(predictLoop);
}

startCameraBtn.addEventListener("click", startCamera);
switchCameraBtn.addEventListener("click", async () => {
  gameState.facingMode = gameState.facingMode === "user" ? "environment" : "user";
  await startCamera();
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

createRoomBtn.addEventListener("click", async () => {
  try {
    await createRoom();
  } catch (error) {
    roomHelpText.textContent = error.message;
  }
});

joinRoomBtn.addEventListener("click", async () => {
  try {
    await joinRoom();
  } catch (error) {
    roomHelpText.textContent = error.message;
  }
});

startRemoteMatchBtn.addEventListener("click", async () => {
  try {
    await startRemoteMatch();
  } catch (error) {
    roomHelpText.textContent = error.message;
  }
});

resetRemoteMatchBtn.addEventListener("click", async () => {
  try {
    await resetRemoteMatch();
  } catch (error) {
    roomHelpText.textContent = error.message;
  }
});

window.addEventListener("resize", resizeCanvas);

renderStats();
setupPoseLandmarker().catch((error) => {
  console.error(error);
  poseStatus.textContent = "Pose model failed to load";
  statusText.textContent =
    "The pose model could not load. Check your internet connection, then refresh the page.";
});
