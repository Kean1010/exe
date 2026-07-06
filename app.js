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
  versus: {
    currentPlayer: 1,
    scores: [0, 0],
    timeLeft: MATCH_SECONDS,
    timerId: null,
    awaitingNextTurn: false
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
    resetGame();
    gameState.running = true;
    statusText.textContent =
      gameState.mode === "single"
        ? `Camera is live. Stage ${gameState.stage} is running.`
        : `Camera is live. Player ${gameState.versus.currentPlayer} is running.`;

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
      "Player 1 and Player 2 take 60-second turns. Highest squat count wins.";
    roundLabel.textContent = "Battle Mode";
  }

  resetGame();
}

function startGame() {
  if (!stream) {
    statusText.textContent = "Start the camera first so we can track your reps.";
    return;
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.getVoices();
  }

  gameState.running = true;
  gameState.repPhase = "up";
  gameState.lastRepAt = 0;

  if (gameState.mode === "single") {
    statusText.textContent = `Stage ${gameState.stage} started. Target: ${gameState.currentTarget} squats.`;
  } else {
    if (gameState.versus.awaitingNextTurn) {
      gameState.versus.awaitingNextTurn = false;
    }

    if (!gameState.versus.timerId) {
      beginVersusTimer();
    }

    statusText.textContent = `Player ${gameState.versus.currentPlayer}, go all out for 60 seconds.`;
  }

  renderStats();
}

function beginVersusTimer() {
  clearInterval(gameState.versus.timerId);
  gameState.versus.timeLeft = MATCH_SECONDS;

  gameState.versus.timerId = setInterval(() => {
    gameState.versus.timeLeft -= 1;
    renderStats();

    if (gameState.versus.timeLeft <= 0) {
      clearInterval(gameState.versus.timerId);
      gameState.versus.timerId = null;
      endCurrentTurn();
    }
  }, 1000);
}

function endCurrentTurn() {
  gameState.running = false;

  if (gameState.versus.currentPlayer === 1) {
    gameState.versus.currentPlayer = 2;
    gameState.versus.awaitingNextTurn = true;
    gameState.totalReps = 0;
    liveCount.textContent = "0";
    statusText.textContent = "Player 1 finished. Hand the phone over and Player 2 can continue.";
  } else {
    const [score1, score2] = gameState.versus.scores;
    const winnerText =
      score1 === score2
        ? "It is a tie. Both players crushed it."
        : score1 > score2
          ? "Player 1 wins the match."
          : "Player 2 wins the match.";

    statusText.textContent = `Match complete. ${winnerText}`;
  }

  renderStats();
}

function resetGame() {
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

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  clearInterval(gameState.versus.timerId);
  gameState.versus = {
    currentPlayer: 1,
    scores: [0, 0],
    timeLeft: MATCH_SECONDS,
    timerId: null,
    awaitingNextTurn: false
  };

  statusText.textContent =
    gameState.mode === "single"
      ? "Single-player run reset. Start the camera when you're ready."
      : "2-player match reset. Start the camera and Player 1 goes first.";

  renderStats();
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
  } else {
    const playerIndex = gameState.versus.currentPlayer - 1;
    gameState.versus.scores[playerIndex] += 1;
  }

  renderStats();
  const displayCount = getDisplayedCount();
  flashCountOverlay(displayCount);
  speakCount(displayCount);
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

function renderStats() {
  liveCount.textContent =
    gameState.mode === "single"
      ? String(gameState.singleStageReps)
      : String(gameState.totalReps);
  hudLiveCount.textContent = liveCount.textContent;

  stageValue.textContent =
    gameState.mode === "single"
      ? String(gameState.stage)
      : `P${gameState.versus.currentPlayer}`;

  targetValue.textContent =
    gameState.mode === "single"
      ? `${gameState.currentTarget} reps`
      : `${gameState.versus.timeLeft}s`;
  hudTarget.textContent = targetValue.textContent;

  roundLabel.textContent =
    gameState.mode === "single"
      ? "Solo Run"
      : `Player ${gameState.versus.currentPlayer} Turn`;

  player1Score.textContent = String(gameState.versus.scores[0]);
  player2Score.textContent = String(gameState.versus.scores[1]);
}

startCameraBtn.addEventListener("click", startCamera);
switchCameraBtn.addEventListener("click", async () => {
  gameState.facingMode = gameState.facingMode === "user" ? "environment" : "user";
  await startCamera();
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

window.addEventListener("resize", resizeCanvas);

renderStats();
setupPoseLandmarker().catch((error) => {
  console.error(error);
  poseStatus.textContent = "Pose model failed to load";
  statusText.textContent =
    "The pose model could not load. Check your internet connection, then refresh the page.";
});
