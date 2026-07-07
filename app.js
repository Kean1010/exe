import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const appShell = document.getElementById("appShell");
const lobbyScreen = document.getElementById("lobbyScreen");
const experienceScreen = document.getElementById("experienceScreen");
const resultsScreen = document.getElementById("resultsScreen");
const profileScreen = document.getElementById("profileScreen");
const globalLobbyBtn = document.getElementById("globalLobbyBtn");
const howToPlayBtn = document.getElementById("howToPlayBtn");
const howToPlayModal = document.getElementById("howToPlayModal");
const howToPlayBackdrop = document.getElementById("howToPlayBackdrop");
const closeHowToPlayBtn = document.getElementById("closeHowToPlayBtn");
const lobbySoloBtn = document.getElementById("lobbySoloBtn");
const lobbyBattleBtn = document.getElementById("lobbyBattleBtn");
const dailyChallengeBtn = document.getElementById("dailyChallengeBtn");
const lobbyHowToPlayBtn = document.getElementById("lobbyHowToPlayBtn");
const lobbyTipsBtn = document.getElementById("lobbyTipsBtn");
const authGoogleBtn = document.getElementById("authGoogleBtn");
const authSignOutBtn = document.getElementById("authSignOutBtn");
const dailyCheckInBtn = document.getElementById("dailyCheckInBtn");
const profileName = document.getElementById("profileName");
const profileHint = document.getElementById("profileHint");
const profileRankBadge = document.getElementById("profileRankBadge");
const profilePoints = document.getElementById("profilePoints");
const profileTotalSquats = document.getElementById("profileTotalSquats");
const profileBattleRecord = document.getElementById("profileBattleRecord");
const profileBestStage = document.getElementById("profileBestStage");
const profileCheckInStatus = document.getElementById("profileCheckInStatus");
const dailyChallengeStatus = document.getElementById("dailyChallengeStatus");
const openProfileHubBtn = document.getElementById("openProfileHubBtn");
const openLeaderboardBtn = document.getElementById("openLeaderboardBtn");
const backToLobbyProfileBtn = document.getElementById("backToLobbyProfileBtn");
const profileHubName = document.getElementById("profileHubName");
const profileHubHint = document.getElementById("profileHubHint");
const profileHubRankBadge = document.getElementById("profileHubRankBadge");
const profileHubPoints = document.getElementById("profileHubPoints");
const profileHubSoloSessions = document.getElementById("profileHubSoloSessions");
const profileHubBattleMatches = document.getElementById("profileHubBattleMatches");
const profileHubWinRate = document.getElementById("profileHubWinRate");
const profileHubChallengeStatus = document.getElementById("profileHubChallengeStatus");
const nextRankLabel = document.getElementById("nextRankLabel");
const rankProgressFill = document.getElementById("rankProgressFill");
const rankProgressText = document.getElementById("rankProgressText");
const rankLadder = document.getElementById("rankLadder");
const profileHistoryList = document.getElementById("profileHistoryList");
const leaderboardStatus = document.getElementById("leaderboardStatus");
const leaderboardList = document.getElementById("leaderboardList");
const backToLobbySetupBtn = document.getElementById("backToLobbySetupBtn");
const setupTitle = document.getElementById("setupTitle");
const setupSubtitle = document.getElementById("setupSubtitle");
const setupModeBadge = document.getElementById("setupModeBadge");
const soloConfigCard = document.getElementById("soloConfigCard");
const battleConfigCard = document.getElementById("battleConfigCard");
const stageButtons = [...document.querySelectorAll("[data-stage]")];
const soloVariantButtons = [...document.querySelectorAll("[data-variant]")];
const soloGoalTitle = document.getElementById("soloGoalTitle");
const soloTargetPreview = document.getElementById("soloTargetPreview");
const readyStateText = document.getElementById("readyStateText");
const cameraReadyLight = document.getElementById("cameraReadyLight");
const poseReadyLight = document.getElementById("poseReadyLight");
const poseProgressFill = document.getElementById("poseProgressFill");
const poseProgressLabel = document.getElementById("poseProgressLabel");
const startArenaBtn = document.getElementById("startArenaBtn");
const resultsTitle = document.getElementById("resultsTitle");
const resultsSubtitle = document.getElementById("resultsSubtitle");
const resultsPrimaryStat = document.getElementById("resultsPrimaryStat");
const resultsSecondaryStat = document.getElementById("resultsSecondaryStat");
const resultsPrimaryNote = document.getElementById("resultsPrimaryNote");
const resultsSecondaryNote = document.getElementById("resultsSecondaryNote");
const resultPlayer1Reps = document.getElementById("resultPlayer1Reps");
const resultPlayer2Reps = document.getElementById("resultPlayer2Reps");
const resultPlayer1Damage = document.getElementById("resultPlayer1Damage");
const resultPlayer2Damage = document.getElementById("resultPlayer2Damage");
const playAgainBtn = document.getElementById("playAgainBtn");
const backToLobbyResultsBtn = document.getElementById("backToLobbyResultsBtn");
const arenaMenuBtn = document.getElementById("arenaMenuBtn");
const arenaMenu = document.getElementById("arenaMenu");
const arenaResumeBtn = document.getElementById("arenaResumeBtn");
const arenaQuitBtn = document.getElementById("arenaQuitBtn");
const arenaAlertText = document.getElementById("arenaAlertText");
const countBurst = document.getElementById("countBurst");
const damageBurst = document.getElementById("damageBurst");
const punchBurst = document.getElementById("punchBurst");
const battleOverlay = document.getElementById("battleOverlay");
const startBattleOverlay = document.getElementById("startBattleOverlay");
const startBattleOverlayBtn = document.getElementById("startBattleOverlayBtn");
const battleCountdown = document.getElementById("battleCountdown");
const finishOverlay = document.getElementById("finishOverlay");
const finishTitle = document.getElementById("finishTitle");
const backToMenuBtn = document.getElementById("backToMenuBtn");

const startCameraBtn = document.getElementById("startCameraBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const modeButtons = [...document.querySelectorAll(".mode-btn")];
const remoteRoomCard = document.getElementById("battleConfigCard");
const quickMatchStatus = document.getElementById("quickMatchStatus");
const privateMatchToggleBtn = document.getElementById("privateMatchToggleBtn");
const privateMatchPanel = document.getElementById("privateMatchPanel");
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const roomCodeInput = document.getElementById("roomCodeInput");
const roomCodeValue = document.getElementById("roomCodeValue");
const playerSlotLabel = document.getElementById("playerSlotLabel");
const roomStatusBadge = document.getElementById("roomStatusBadge");
const matchReadyActions = document.getElementById("matchReadyActions");
const matchReadyBtn = document.getElementById("matchReadyBtn");
const roomHelpText = document.getElementById("roomHelpText");

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
const player1HpBar = document.getElementById("player1HpBar");
const player2HpBar = document.getElementById("player2HpBar");
const player1HpLabel = document.getElementById("player1HpLabel");
const player2HpLabel = document.getElementById("player2HpLabel");
const overlayPlayer1HpBar = document.getElementById("overlayPlayer1HpBar");
const overlayPlayer2HpBar = document.getElementById("overlayPlayer2HpBar");
const overlayPlayer1HpLabel = document.getElementById("overlayPlayer1HpLabel");
const overlayPlayer2HpLabel = document.getElementById("overlayPlayer2HpLabel");
const overlayPlayer1Meta = document.getElementById("overlayPlayer1Meta");
const overlayPlayer2Meta = document.getElementById("overlayPlayer2Meta");
const localPlayerPanel = document.getElementById("localPlayerPanel");
const opponentPlayerPanel = document.getElementById("opponentPlayerPanel");
const localRepPanel = document.getElementById("localRepPanel");
const opponentRepPanel = document.getElementById("opponentRepPanel");
const arenaFlash = document.getElementById("arenaFlash");
const roundLabel = document.getElementById("roundLabel");
const statusText = document.getElementById("statusText");
const arenaAlertHint = document.getElementById("arenaAlertHint");

const STAGE_START = 10;
const STAGE_STEP = 5;
const MATCH_SECONDS = 60;
const STARTING_HP = 30;
const ATTACK_CHARGE_REPS = 5;
const ATTACK_DAMAGE = 10;
const ATTACK_GESTURE_HOLD_MS = 350;
const ATTACK_COOLDOWN_MS = 1400;
const BLOCK_WINDOW_MS = 1600;
const COUNTDOWN_MS = 3200;
const OPPONENT_LEAVE_GRACE_MS = 2200;
const DAILY_CHALLENGE_TARGET = 30;
const DAILY_CHALLENGE_MS = 60000;
const DAILY_CHECKIN_POINTS = 25;
const DAILY_CHALLENGE_POINTS = 60;
const BATTLE_WIN_POINTS = 80;
const BATTLE_LOSS_POINTS = 25;
const BATTLE_DRAW_POINTS = 40;
const SOLO_STAGE_CLEAR_POINTS = 18;

const RANK_TIERS = [
  { name: "Rookie", minPoints: 0 },
  { name: "Bronze", minPoints: 80 },
  { name: "Silver", minPoints: 220 },
  { name: "Gold", minPoints: 420 },
  { name: "Platinum", minPoints: 700 },
  { name: "Diamond", minPoints: 1050 },
  { name: "Arena King", minPoints: 1500 }
];

const DEFAULT_PROFILE = {
  display_name: "Guest Fighter",
  avatar_url: "",
  points: 0,
  rank: "Rookie",
  total_squats: 0,
  solo_sessions: 0,
  battle_matches: 0,
  battle_wins: 0,
  battle_losses: 0,
  best_stage: 1,
  daily_checkin_on: "",
  daily_challenge_completed_on: ""
};

function createBattleState() {
  return {
    hpBySlot: {
      1: STARTING_HP,
      2: STARTING_HP
    },
    chargesBySlot: {
      1: 0,
      2: 0
    },
    winnerSlot: 0,
    gestureHoldStartedAt: 0,
    lastAttackAt: 0,
    attackSequence: 0,
    pendingIncomingAttack: null,
    feedback: null,
    processedAttacks: new Set()
  };
}

const gameState = {
  screen: "lobby",
  mode: "single",
  soloVariant: "stages",
  selectedStage: 1,
  running: false,
  facingMode: "user",
  totalReps: 0,
  stage: 1,
  singleStageReps: 0,
  currentTarget: STAGE_START,
  dailyChallenge: {
    active: false,
    startAt: 0,
    timeLeftMs: DAILY_CHALLENGE_MS,
    completed: false,
    resolved: false
  },
  progression: {
    profile: { ...DEFAULT_PROFILE },
    user: null,
    session: null,
    resultReward: null,
    leaderboard: [],
    leaderboardLoaded: false
  },
  repPhase: "up",
  lastRepAt: 0,
  currentAngle: null,
  remote: {
    enabled: false,
    ready: false,
    client: null,
    subscription: null,
    playerId: "",
    playerSlot: 0,
    roomCode: "",
    matchType: "",
    quickMatchPending: false,
    privatePanelOpen: false,
    snapshot: null,
    scoreSent: 0,
    finalizing: false,
    matchLive: false,
    countdownEndsAt: 0,
    countdownStarterSlot: 0,
    countdownTimerId: 0,
    heartbeatTimerId: 0,
    presenceSlots: {
      1: false,
      2: false
    },
    opponentLeaveTimerId: 0,
    resolvingOpponentLeave: false,
    setupReadySlots: {
      1: false,
      2: false
    },
    battle: createBattleState()
  },
  results: {
    title: "Victory",
    subtitle: "Arena complete. Here is your final breakdown."
  }
};

let poseLandmarker;
let drawingUtils;
let stream;
let lastVideoTime = -1;
let animationFrameId;
let countBurstTimeoutId;
let damageBurstTimeoutId;
let punchBurstTimeoutId;
let lastStableLandmarks = null;
let lastStablePoseAt = 0;
let audioContext;
let arenaFlashTimeoutId;
let battleFeedbackTimeoutId;
let lastDailyRenderedSecond = -1;

function setCameraPresentation(active) {
  appShell.dataset.cameraActive = active ? "true" : "false";
}

function setScreen(screen) {
  gameState.screen = screen;
  appShell.dataset.screen = screen;
  lobbyScreen.classList.toggle("active", screen === "lobby");
  experienceScreen.classList.toggle("active", screen === "setup" || screen === "arena");
  profileScreen.classList.toggle("active", screen === "profile");
  resultsScreen.classList.toggle("active", screen === "results");
  globalLobbyBtn.hidden = true;
  if (screen !== "arena") {
    openArenaMenu(false);
  }
}

function getStageTarget(stage) {
  return STAGE_START + (stage - 1) * STAGE_STEP;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getRankForPoints(points) {
  let currentRank = RANK_TIERS[0].name;
  for (const tier of RANK_TIERS) {
    if (Number(points || 0) >= tier.minPoints) {
      currentRank = tier.name;
    }
  }
  return currentRank;
}

function getSignedInClient() {
  return gameState.remote.client;
}

function getNextRankTier(points) {
  const currentPoints = Number(points || 0);
  return RANK_TIERS.find((tier) => currentPoints < tier.minPoints) || null;
}

function getPreviousRankTier(points) {
  const currentPoints = Number(points || 0);
  let previous = RANK_TIERS[0];
  for (const tier of RANK_TIERS) {
    if (currentPoints >= tier.minPoints) {
      previous = tier;
    }
  }
  return previous;
}

function getWinRate(profile) {
  const matches = Number(profile.battle_matches || 0);
  if (!matches) {
    return "0%";
  }
  return `${Math.round((Number(profile.battle_wins || 0) / matches) * 100)}%`;
}

function buildProgressHistory(profile) {
  const history = [];
  const currentRank = profile.rank || "Rookie";
  history.push({
    title: `${currentRank} Rank`,
    detail: `${profile.points || 0} total points banked across solo runs and online battles.`
  });
  history.push({
    title: `Best Stage ${profile.best_stage || 1}`,
    detail: `${profile.total_squats || 0} lifetime squats tracked through the camera arena.`
  });
  history.push({
    title: `${profile.battle_wins || 0} Battle Wins`,
    detail: `${profile.battle_losses || 0} losses recorded with a ${getWinRate(profile)} win rate.`
  });
  history.push({
    title: profile.daily_challenge_completed_on === todayKey() ? "Daily Challenge Cleared" : "Daily Challenge Ready",
    detail: profile.daily_challenge_completed_on === todayKey()
      ? "Today's bonus challenge has already been claimed."
      : "Complete 30 squats in 60 seconds to earn the extra point bonus."
  });
  return history;
}

function renderRankLadder(profile) {
  if (!rankLadder) {
    return;
  }
  const points = Number(profile.points || 0);
  rankLadder.innerHTML = RANK_TIERS.map((tier) => {
    const unlocked = points >= tier.minPoints;
    const current = (profile.rank || "Rookie") === tier.name;
    return `
      <div class="rank-tier ${unlocked ? "unlocked" : ""} ${current ? "current" : ""}">
        <div>
          <strong>${tier.name}</strong>
          <small>${tier.minPoints} pts</small>
        </div>
        <span>${unlocked ? "Unlocked" : "Locked"}</span>
      </div>
    `;
  }).join("");
}

function renderProgressHistory(profile) {
  if (!profileHistoryList) {
    return;
  }
  profileHistoryList.innerHTML = buildProgressHistory(profile).map((item) => `
    <div class="history-item">
      <strong>${item.title}</strong>
      <p>${item.detail}</p>
    </div>
  `).join("");
}

function renderLeaderboard() {
  if (!leaderboardList || !leaderboardStatus) {
    return;
  }

  const entries = gameState.progression.leaderboard || [];
  if (!gameState.progression.user) {
    leaderboardStatus.textContent = "Sign In";
    leaderboardList.innerHTML = `<div class="leaderboard-empty">Sign in with Google to compare your rank on the global board.</div>`;
    return;
  }

  if (!gameState.progression.leaderboardLoaded) {
    leaderboardStatus.textContent = "Loading";
    leaderboardList.innerHTML = `<div class="leaderboard-empty">Loading leaderboard...</div>`;
    return;
  }

  leaderboardStatus.textContent = entries.length ? "Live" : "Empty";
  leaderboardList.innerHTML = entries.length
    ? entries.map((entry, index) => `
        <div class="leaderboard-row ${entry.id === gameState.progression.user?.id ? "is-self" : ""}">
          <span class="leaderboard-place">#${index + 1}</span>
          <div class="leaderboard-player">
            <strong>${entry.display_name || "Arena Fighter"}</strong>
            <small>${entry.rank || "Rookie"} - ${entry.total_squats || 0} squats</small>
          </div>
          <span class="leaderboard-points">${entry.points || 0} pts</span>
        </div>
      `).join("")
    : `<div class="leaderboard-empty">No ranked fighters yet. Your first session can claim the top spot.</div>`;
}

async function fetchLeaderboard() {
  const client = getSignedInClient();
  if (!client || !gameState.progression.user) {
    gameState.progression.leaderboard = [];
    gameState.progression.leaderboardLoaded = true;
    renderLeaderboard();
    return;
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, display_name, rank, points, total_squats")
    .order("points", { ascending: false })
    .order("total_squats", { ascending: false })
    .limit(12);

  if (error) {
    console.error(error);
    gameState.progression.leaderboard = [];
    gameState.progression.leaderboardLoaded = true;
    leaderboardStatus.textContent = "Error";
    leaderboardList.innerHTML = `<div class="leaderboard-empty">Could not load the leaderboard yet.</div>`;
    return;
  }

  gameState.progression.leaderboard = data || [];
  gameState.progression.leaderboardLoaded = true;
  renderLeaderboard();
}

function openProfileHub() {
  setScreen("profile");
  renderStats();
  fetchLeaderboard().catch((error) => {
    console.error(error);
  });
}

function createProgressSession() {
  return {
    mode: gameState.mode,
    soloVariant: gameState.soloVariant,
    reps: 0,
    stageClears: 0,
    bestStage: gameState.stage,
    battleOutcome: "",
    challengeCompleted: false,
    challengeFailed: false,
    finalized: false
  };
}

function ensureProgressSession() {
  if (!gameState.progression.session) {
    gameState.progression.session = createProgressSession();
  }
  return gameState.progression.session;
}

function resetProgressSession() {
  gameState.progression.session = createProgressSession();
  gameState.progression.resultReward = null;
}

function startDailyChallengeRun() {
  gameState.dailyChallenge.active = true;
  gameState.dailyChallenge.startAt = Date.now();
  gameState.dailyChallenge.timeLeftMs = DAILY_CHALLENGE_MS;
  gameState.dailyChallenge.completed = false;
  gameState.dailyChallenge.resolved = false;
  lastDailyRenderedSecond = Math.ceil(DAILY_CHALLENGE_MS / 1000);
}

function stopDailyChallengeRun() {
  gameState.dailyChallenge.active = false;
}

function getDailyChallengeTimeLeft() {
  if (!gameState.dailyChallenge.active) {
    return gameState.dailyChallenge.timeLeftMs;
  }

  const remainingMs = Math.max(0, DAILY_CHALLENGE_MS - (Date.now() - gameState.dailyChallenge.startAt));
  gameState.dailyChallenge.timeLeftMs = remainingMs;
  return remainingMs;
}

function updateDailyChallengeState() {
  if (gameState.soloVariant !== "daily" || !gameState.dailyChallenge.active || gameState.dailyChallenge.resolved) {
    return;
  }

  const timeLeftMs = getDailyChallengeTimeLeft();
  const wholeSeconds = Math.ceil(timeLeftMs / 1000);
  if (wholeSeconds !== lastDailyRenderedSecond) {
    lastDailyRenderedSecond = wholeSeconds;
    renderStats();
  }
  if (timeLeftMs <= 0 && gameState.totalReps < DAILY_CHALLENGE_TARGET) {
    finalizeDailyChallenge(false);
  }
}

function buildRewardSummary() {
  const session = gameState.progression.session;
  if (!session || session.finalized) {
    return gameState.progression.resultReward;
  }

  let points = session.reps;
  const summary = {
    points: 0,
    reps: session.reps,
    bestStage: session.bestStage,
    soloSessions: 0,
    battleMatches: 0,
    battleWins: 0,
    battleLosses: 0,
    challengeCompleted: session.challengeCompleted,
    challengeFailed: session.challengeFailed,
    label: ""
  };

  if (session.mode === "single") {
    summary.soloSessions = 1;
    if (session.soloVariant === "daily") {
      points += session.challengeCompleted ? DAILY_CHALLENGE_POINTS : 0;
      summary.label = session.challengeCompleted
        ? `Daily Challenge clear +${DAILY_CHALLENGE_POINTS}`
        : "Daily Challenge attempt";
    } else {
      points += session.stageClears * SOLO_STAGE_CLEAR_POINTS;
      summary.label = `Stage Rush rewards +${session.stageClears * SOLO_STAGE_CLEAR_POINTS}`;
    }
  } else if (session.mode === "versus") {
    summary.battleMatches = 1;
    if (session.battleOutcome === "win") {
      points += BATTLE_WIN_POINTS;
      summary.battleWins = 1;
      summary.label = `Battle win +${BATTLE_WIN_POINTS}`;
    } else if (session.battleOutcome === "loss") {
      points += BATTLE_LOSS_POINTS;
      summary.battleLosses = 1;
      summary.label = `Battle fought +${BATTLE_LOSS_POINTS}`;
    } else if (session.battleOutcome === "draw") {
      points += BATTLE_DRAW_POINTS;
      summary.label = `Battle draw +${BATTLE_DRAW_POINTS}`;
    }
  }

  summary.points = points;
  return summary;
}

async function saveProfileProgress(force = false) {
  const client = getSignedInClient();
  const user = gameState.progression.user;
  const session = gameState.progression.session;
  if (!client || !user || !session || (session.finalized && !force)) {
    return;
  }

  const reward = buildRewardSummary();
  if (!reward || reward.points <= 0 && reward.reps <= 0 && !reward.challengeCompleted && !force) {
    session.finalized = true;
    return;
  }

  const current = { ...DEFAULT_PROFILE, ...gameState.progression.profile };
  const nextPoints = Number(current.points || 0) + Number(reward.points || 0);
  const nextProfile = {
    id: user.id,
    display_name: user.user_metadata?.full_name || user.user_metadata?.name || current.display_name || "Arena Fighter",
    avatar_url: user.user_metadata?.avatar_url || current.avatar_url || "",
    points: nextPoints,
    rank: getRankForPoints(nextPoints),
    total_squats: Number(current.total_squats || 0) + Number(reward.reps || 0),
    solo_sessions: Number(current.solo_sessions || 0) + Number(reward.soloSessions || 0),
    battle_matches: Number(current.battle_matches || 0) + Number(reward.battleMatches || 0),
    battle_wins: Number(current.battle_wins || 0) + Number(reward.battleWins || 0),
    battle_losses: Number(current.battle_losses || 0) + Number(reward.battleLosses || 0),
    best_stage: Math.max(Number(current.best_stage || 1), Number(reward.bestStage || 1)),
    daily_checkin_on: current.daily_checkin_on || null,
    daily_challenge_completed_on: reward.challengeCompleted ? todayKey() : current.daily_challenge_completed_on || null
  };

  const { data, error } = await client
    .from("profiles")
    .upsert(nextProfile, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error(error);
    profileHint.textContent = "Profile save is not ready yet. Run the latest Supabase schema update.";
    return;
  }

  gameState.progression.profile = data;
  gameState.progression.resultReward = reward;
  session.finalized = true;
  renderStats();
  fetchLeaderboard().catch((error) => {
    console.error(error);
  });
}

async function fetchProfile() {
  const client = getSignedInClient();
  const user = gameState.progression.user;
  if (!client || !user) {
    gameState.progression.profile = { ...DEFAULT_PROFILE };
    renderStats();
    return;
  }

  const defaultRow = {
    id: user.id,
    display_name: user.user_metadata?.full_name || user.user_metadata?.name || "Arena Fighter",
    avatar_url: user.user_metadata?.avatar_url || "",
    daily_checkin_on: null,
    daily_challenge_completed_on: null
  };

  const { data: existingProfile, error: fetchError } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error(fetchError);
    profileHint.textContent = "Could not load your saved profile yet.";
    gameState.progression.profile = { ...DEFAULT_PROFILE };
    renderStats();
    return;
  }

  if (existingProfile) {
    const profilePatch = {};
    const latestName = user.user_metadata?.full_name || user.user_metadata?.name || "Arena Fighter";
    const latestAvatar = user.user_metadata?.avatar_url || "";

    if (!existingProfile.display_name && latestName) {
      profilePatch.display_name = latestName;
    }
    if (!existingProfile.avatar_url && latestAvatar) {
      profilePatch.avatar_url = latestAvatar;
    }

    if (Object.keys(profilePatch).length > 0) {
      const { data: updatedProfile, error: updateError } = await client
        .from("profiles")
        .update(profilePatch)
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error(updateError);
        gameState.progression.profile = { ...DEFAULT_PROFILE, ...existingProfile };
      } else {
        gameState.progression.profile = { ...DEFAULT_PROFILE, ...updatedProfile };
      }
    } else {
      gameState.progression.profile = { ...DEFAULT_PROFILE, ...existingProfile };
    }

    renderStats();
    fetchLeaderboard().catch((error) => {
      console.error(error);
    });
    return;
  }

  const { data, error } = await client
    .from("profiles")
    .insert({
      ...DEFAULT_PROFILE,
      ...defaultRow
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    profileHint.textContent = "Profile tables are missing. Run the latest schema in Supabase, then refresh.";
    gameState.progression.profile = { ...DEFAULT_PROFILE };
    renderStats();
    return;
  }

  gameState.progression.profile = { ...DEFAULT_PROFILE, ...data };
  renderStats();
  fetchLeaderboard().catch((error) => {
    console.error(error);
  });
}

async function claimDailyCheckIn() {
  if (!gameState.progression.user) {
    profileHint.textContent = "Sign in with Google to claim daily rewards.";
    renderStats();
    return;
  }

  const profile = { ...DEFAULT_PROFILE, ...gameState.progression.profile };
  if (profile.daily_checkin_on === todayKey()) {
    profileHint.textContent = "Daily check-in already claimed today.";
    renderStats();
    return;
  }

  const client = getSignedInClient();
  const nextPoints = Number(profile.points || 0) + DAILY_CHECKIN_POINTS;
  const { data, error } = await client
    .from("profiles")
    .update({
      points: nextPoints,
      rank: getRankForPoints(nextPoints),
      daily_checkin_on: todayKey()
    })
    .eq("id", gameState.progression.user.id)
    .select()
    .single();

  if (error) {
    console.error(error);
    profileHint.textContent = "Could not claim daily check-in yet.";
    renderStats();
    return;
  }

  gameState.progression.profile = { ...DEFAULT_PROFILE, ...data };
  profileHint.textContent = `Daily check-in claimed: +${DAILY_CHECKIN_POINTS} points`;
  renderStats();
  fetchLeaderboard().catch((error) => {
    console.error(error);
  });
}

async function signInWithGoogle() {
  const client = getSignedInClient();
  if (!client) {
    profileHint.textContent = "Auth is not ready yet.";
    renderStats();
    return;
  }

  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin
    }
  });

  if (error) {
    console.error(error);
    profileHint.textContent = "Google sign-in could not start.";
    renderStats();
  }
}

async function signOutProfile() {
  const client = getSignedInClient();
  if (!client) {
    return;
  }

  await client.auth.signOut().catch(() => {});
  gameState.progression.user = null;
  gameState.progression.profile = { ...DEFAULT_PROFILE };
  gameState.progression.leaderboard = [];
  gameState.progression.leaderboardLoaded = false;
  renderStats();
}

function applySelectedSoloStage() {
  gameState.singleStageReps = 0;
  if (gameState.soloVariant === "daily") {
    gameState.stage = 1;
    gameState.currentTarget = DAILY_CHALLENGE_TARGET;
    return;
  }

  gameState.stage = gameState.selectedStage;
  gameState.currentTarget = getStageTarget(gameState.stage);
}

function isPoseModelReady() {
  return Boolean(poseLandmarker);
}

function isPoseCentered() {
  return Boolean(lastStableLandmarks && performance.now() - lastStablePoseAt < 900);
}

function isSetupReady() {
  const hasCamera = Boolean(stream && video.srcObject);
  if (!hasCamera || !isPoseModelReady() || !isPoseCentered()) {
    return false;
  }

  if (gameState.mode === "single") {
    return true;
  }

  return isMatchReadyToStart();
}

function openHowToPlay(show) {
  howToPlayModal.hidden = !show;
}

function showCameraTips() {
  openHowToPlay(true);
  statusText.textContent =
    "Place the phone far enough away for a full side view, then keep your full body inside the frame.";
}

function openArenaMenu(show) {
  if (gameState.screen !== "arena") {
    arenaMenu.hidden = true;
    return;
  }

  arenaMenu.hidden = !show;
}

function enterSetup(mode) {
  setMode(mode);
  if (mode === "single") {
    applySelectedSoloStage();
  }
  resetProgressSession();
  setScreen("setup");
  renderStats();
}

function renderResultsSummary() {
  const snapshot = getRemoteSnapshot();
  if (gameState.mode === "versus" && snapshot) {
    const winnerSlot = gameState.remote.battle.winnerSlot || snapshot.winnerSlot;
    const localWon = winnerSlot && winnerSlot === gameState.remote.playerSlot;
    const isDraw = winnerSlot === 0;
    const player1Reps = snapshot.players?.[0]?.score ?? 0;
    const player2Reps = snapshot.players?.[1]?.score ?? 0;
    const player1DamageDealt = STARTING_HP - getBattleHp(2);
    const player2DamageDealt = STARTING_HP - getBattleHp(1);

    resultsTitle.textContent = isDraw ? "Draw" : localWon ? "Victory" : "Defeat";
    resultsSubtitle.textContent = isDraw
      ? "Both players finished on even footing."
      : localWon
        ? "You defeated your opponent in the arena."
        : "Your opponent took this round. Reset and run it back.";
    resultsPrimaryStat.textContent = `${gameState.totalReps}`;
    resultsSecondaryStat.textContent = isDraw
      ? "Even Match"
      : localWon
        ? "Winner"
        : "Runner-Up";
    resultsPrimaryNote.textContent = "Your final rep count";
    resultsSecondaryNote.textContent = gameState.progression.resultReward?.label || "Battle result";
    resultPlayer1Reps.textContent = String(player1Reps);
    resultPlayer2Reps.textContent = String(player2Reps);
    resultPlayer1Damage.textContent = String(player1DamageDealt);
    resultPlayer2Damage.textContent = String(player2DamageDealt);
    return;
  }

  const challengeMode = gameState.soloVariant === "daily";
  const challengeComplete = gameState.dailyChallenge.completed;
  resultsTitle.textContent = challengeMode
    ? challengeComplete
      ? "Challenge Clear"
      : "Challenge Over"
    : "Run Summary";
  resultsSubtitle.textContent = challengeMode
    ? challengeComplete
      ? "Daily challenge complete. Bonus points secured."
      : "Time expired before you reached 30 squats."
    : "Your solo arena snapshot is ready.";
  resultsPrimaryStat.textContent = String(gameState.totalReps);
  resultsSecondaryStat.textContent = challengeMode
    ? `${Math.ceil(gameState.dailyChallenge.timeLeftMs / 1000)}s left`
    : `Stage ${gameState.stage}`;
  resultsPrimaryNote.textContent = "Total reps completed";
  resultsSecondaryNote.textContent = gameState.progression.resultReward?.label || (challengeMode ? "Daily challenge result" : "Current stage reached");
  resultPlayer1Reps.textContent = String(gameState.totalReps);
  resultPlayer2Reps.textContent = "--";
  resultPlayer1Damage.textContent = "0";
  resultPlayer2Damage.textContent = "--";
}

function maybeShowResultsScreen() {
  const snapshot = getRemoteSnapshot();
  if (
    gameState.screen === "arena" &&
    gameState.mode === "versus" &&
    (gameState.remote.battle.winnerSlot || snapshot?.status === "finished")
  ) {
    renderResultsSummary();
    setScreen("results");
  }

  if (
    gameState.screen === "arena" &&
    gameState.mode === "single" &&
    gameState.soloVariant === "daily" &&
    gameState.dailyChallenge.resolved
  ) {
    renderResultsSummary();
    setScreen("results");
  }
}

async function finalizeDailyChallenge(success) {
  if (gameState.dailyChallenge.resolved) {
    return;
  }

  gameState.dailyChallenge.resolved = true;
  gameState.dailyChallenge.completed = Boolean(success);
  gameState.dailyChallenge.timeLeftMs = getDailyChallengeTimeLeft();
  stopDailyChallengeRun();
  gameState.running = false;

  const session = ensureProgressSession();
  session.challengeCompleted = Boolean(success);
  session.challengeFailed = !success;
  session.bestStage = 1;
  await saveProfileProgress();
  renderStats();
  maybeShowResultsScreen();
}

function renderPreparationState() {
  const cameraReady = Boolean(stream && video.srcObject);
  const poseReady = isPoseModelReady();
  const centered = isPoseCentered();
  const ready = isSetupReady();

  cameraReadyLight.classList.toggle("ready", cameraReady);
  poseReadyLight.classList.toggle("ready", ready);

  if (!cameraReady) {
    readyStateText.textContent = "Turn on the camera to start calibration.";
  } else if (!poseReady) {
    readyStateText.textContent = "Calibrating pose model...";
  } else if (!centered) {
    readyStateText.textContent = "Step into frame until the full-body guide locks on.";
  } else if (gameState.mode === "versus" && !isMatchReadyToStart()) {
    readyStateText.textContent = "Waiting for an opponent to be ready.";
  } else {
    readyStateText.textContent = "Ready. Enter the arena.";
  }

  poseProgressFill.style.width = poseReady ? "100%" : "34%";
  poseProgressLabel.textContent = poseReady ? "100%" : "Loading...";

  const shouldShowStart =
    gameState.screen === "setup" &&
    (gameState.mode === "single" ? cameraReady && poseReady : isMatchReadyToStart());
  startArenaBtn.hidden = !shouldShowStart;
  startArenaBtn.disabled = !ready;
  startArenaBtn.textContent = gameState.mode === "single"
    ? ready
      ? "Start Arena"
      : "Calibrating..."
    : ready
      ? "Start Arena"
      : "Waiting for Ready";
}

function stopCameraStream() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }

  stream = null;
  video.srcObject = null;
}

async function returnToMainMenu() {
  if (gameState.mode === "single" && (gameState.totalReps > 0 || gameState.progression.session)) {
    await saveProfileProgress(true).catch(() => {});
  }

  if (gameState.mode === "versus" && gameState.remote.roomCode && gameState.remote.playerId) {
    try {
      await leaveRoomOnServer();
    } catch (error) {
      leaveRoomKeepalive();
    }
  } else {
    leaveRoomKeepalive();
  }

  openArenaMenu(false);
  openHowToPlay(false);
  clearBattleCountdown();
  stopCameraStream();
  setCameraPresentation(false);
  gameState.running = false;
  lastVideoTime = -1;
  clearGameplayCounters();
  resetRemoteState();
  resetProgressSession();
  gameState.selectedStage = 1;
  gameState.soloVariant = "stages";
  setMode("single");
  applySelectedSoloStage();
  setScreen("lobby");
  cameraStatus.textContent = "Camera idle";
  poseStatus.textContent = "Pose model ready";
  formState.textContent = "Waiting";
  statusText.textContent =
    "Start the camera, line up sideways, and the game will begin automatically.";
  renderStats();
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

function flashDamageOverlay(value) {
  damageBurst.textContent = `-${value} HP`;
  damageBurst.classList.remove("active");
  void damageBurst.offsetWidth;
  damageBurst.classList.add("active");

  clearTimeout(damageBurstTimeoutId);
  damageBurstTimeoutId = setTimeout(() => {
    damageBurst.classList.remove("active");
  }, 920);
}

function flashPunchOverlay() {
  punchBurst.classList.remove("active");
  void punchBurst.offsetWidth;
  punchBurst.classList.add("active");

  clearTimeout(punchBurstTimeoutId);
  punchBurstTimeoutId = setTimeout(() => {
    punchBurst.classList.remove("active");
  }, 680);
}

function showArenaFlash(mode) {
  if (!arenaFlash) {
    return;
  }

  clearTimeout(arenaFlashTimeoutId);
  arenaFlash.hidden = false;
  arenaFlash.classList.remove("danger", "blocked");

  if (!mode) {
    arenaFlash.hidden = true;
    return;
  }

  arenaFlash.classList.add(mode);
  if (mode === "blocked") {
    arenaFlashTimeoutId = setTimeout(() => {
      arenaFlash.classList.remove("blocked");
      arenaFlash.hidden = true;
    }, 620);
  }
}

function showBattleFeedback(type, text, hint = "", duration = 700) {
  clearTimeout(battleFeedbackTimeoutId);
  gameState.remote.battle.feedback = { type, text, hint };
  battleOverlay.hidden = gameState.screen !== "arena";
  renderStats();

  if (duration > 0) {
    battleFeedbackTimeoutId = setTimeout(() => {
      gameState.remote.battle.feedback = null;
      renderStats();
    }, duration);
  }
}

function getAudioContext() {
  if (!("AudioContext" in window || "webkitAudioContext" in window)) {
    return null;
  }

  if (!audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtor();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function playAttackSound() {
  const audio = getAudioContext();
  if (!audio) {
    return;
  }

  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const filter = audio.createBiquadFilter();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);

  filter.type = "bandpass";
  filter.frequency.setValueAtTime(900, now);
  filter.Q.value = 0.7;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.22);
}

function playHitSound() {
  const audio = getAudioContext();
  if (!audio) {
    return;
  }

  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.16);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.2);
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

function unsubscribeRemoteRoom() {
  if (gameState.remote.subscription && gameState.remote.client) {
    gameState.remote.client.removeChannel(gameState.remote.subscription);
  }

  gameState.remote.subscription = null;
}

function resetBattleState() {
  gameState.remote.battle = createBattleState();
}

function resetSetupReadyState() {
  gameState.remote.setupReadySlots = {
    1: false,
    2: false
  };
}

function resetPresenceState() {
  if (gameState.remote.opponentLeaveTimerId) {
    clearTimeout(gameState.remote.opponentLeaveTimerId);
  }

  gameState.remote.opponentLeaveTimerId = 0;
  gameState.remote.resolvingOpponentLeave = false;
  gameState.remote.presenceSlots = {
    1: false,
    2: false
  };
}

function clearBattleCountdown() {
  if (gameState.remote.countdownTimerId) {
    clearTimeout(gameState.remote.countdownTimerId);
  }
  gameState.remote.countdownTimerId = 0;
  gameState.remote.countdownEndsAt = 0;
  gameState.remote.countdownStarterSlot = 0;
}

function stopRoomHeartbeat() {
  if (gameState.remote.heartbeatTimerId) {
    clearInterval(gameState.remote.heartbeatTimerId);
  }

  gameState.remote.heartbeatTimerId = 0;
}

function isQuickMatchWaiting() {
  const snapshot = getRemoteSnapshot();
  return (
    gameState.remote.matchType === "quick" &&
    Boolean(gameState.remote.roomCode) &&
    gameState.remote.playerSlot === 1 &&
    snapshot?.status === "lobby" &&
    !snapshot.players?.[1]?.name
  );
}

function isQuickMatchLobbyActive() {
  const snapshot = getRemoteSnapshot();
  return (
    gameState.remote.matchType === "quick" &&
    Boolean(gameState.remote.roomCode) &&
    Boolean(gameState.remote.playerId) &&
    snapshot?.status === "lobby"
  );
}

function isLocalSetupReady() {
  return Boolean(gameState.remote.setupReadySlots[gameState.remote.playerSlot]);
}

function areBothPlayersSetupReady() {
  return Boolean(gameState.remote.setupReadySlots[1] && gameState.remote.setupReadySlots[2]);
}

async function heartbeatRoom() {
  if (!isQuickMatchLobbyActive() || !gameState.remote.playerId) {
    stopRoomHeartbeat();
    return;
  }

  try {
    const payload = await apiRequest("/api/heartbeat-room", {
      method: "POST",
      body: {
        code: gameState.remote.roomCode,
        playerId: gameState.remote.playerId
      }
    });

    if (payload?.room) {
      applyRemoteSnapshot(payload.room);
    }
  } catch (error) {
    console.error(error);
  }
}

function startRoomHeartbeat() {
  if (!isQuickMatchLobbyActive()) {
    stopRoomHeartbeat();
    return;
  }

  if (gameState.remote.heartbeatTimerId) {
    return;
  }

  gameState.remote.heartbeatTimerId = setInterval(() => {
    heartbeatRoom();
  }, 5000);
}

function isVersusMatchActive() {
  if (gameState.mode !== "versus") {
    return false;
  }

  if (!gameState.remote.playerSlot || !gameState.remote.roomCode) {
    return false;
  }

  const snapshot = getRemoteSnapshot();
  if (snapshot?.status === "finished" || gameState.remote.battle.winnerSlot) {
    return false;
  }

  return true;
}

function initializeBattleState() {
  resetBattleState();
}

function getBattleHp(slot) {
  return gameState.remote.battle.hpBySlot[slot] ?? STARTING_HP;
}

function getBattleCharges(slot) {
  return gameState.remote.battle.chargesBySlot[slot] ?? 0;
}

function setBattleHp(slot, value) {
  gameState.remote.battle.hpBySlot[slot] = Math.max(0, Math.min(STARTING_HP, Number(value) || 0));
}

function setBattleCharges(slot, value) {
  gameState.remote.battle.chargesBySlot[slot] = Math.max(0, Number(value) || 0);
}

function getLocalBattleHp() {
  return getBattleHp(gameState.remote.playerSlot || 1);
}

function getLocalBattleCharges() {
  return getBattleCharges(gameState.remote.playerSlot || 1);
}

function getOpponentSlot() {
  return gameState.remote.playerSlot === 1 ? 2 : 1;
}

function getDisplayPlayers(snapshot = getRemoteSnapshot()) {
  const remotePlayers = makeRemotePlayers(snapshot);
  if (!gameState.remote.playerSlot) {
    return {
      local: remotePlayers[0],
      opponent: remotePlayers[1]
    };
  }

  const localIndex = gameState.remote.playerSlot - 1;
  const opponentIndex = localIndex === 0 ? 1 : 0;
  return {
    local: remotePlayers[localIndex],
    opponent: remotePlayers[opponentIndex]
  };
}

function updateLocalSlotFromSnapshot(snapshot) {
  if (!snapshot || !gameState.remote.playerId) {
    return;
  }

  const matchedSlot = snapshot.players.find((player) => player.id === gameState.remote.playerId)?.slot || 0;
  if (matchedSlot && matchedSlot !== gameState.remote.playerSlot) {
    gameState.remote.playerSlot = matchedSlot;
    if (gameState.remote.subscription) {
      gameState.remote.subscription.track({
        playerId: gameState.remote.playerId,
        playerSlot: matchedSlot,
        roomCode: gameState.remote.roomCode,
        onlineAt: Date.now()
      }).catch(() => {});
    }
  }
}

async function sendRoomBroadcast(event, payload) {
  if (!gameState.remote.subscription) {
    return;
  }

  try {
    await gameState.remote.subscription.send({
      type: "broadcast",
      event,
      payload
    });
  } catch (error) {
    console.error(error);
  }
}

function scheduleBattleCountdownTick() {
  if (!gameState.remote.countdownEndsAt) {
    renderBattleStartOverlay();
    return;
  }

  renderBattleStartOverlay();
  const remainingMs = gameState.remote.countdownEndsAt - performance.now();
  if (remainingMs <= 0) {
    const starterSlot = gameState.remote.countdownStarterSlot;
    clearBattleCountdown();
    renderBattleStartOverlay();

    if (
      gameState.remote.playerSlot &&
      starterSlot === gameState.remote.playerSlot &&
      getRemoteSnapshot()?.status === "lobby"
    ) {
      startRemoteMatch().catch((error) => {
        roomHelpText.textContent = error.message;
      });
    }
    return;
  }

  gameState.remote.countdownTimerId = setTimeout(scheduleBattleCountdownTick, 120);
}

function startSharedBattleCountdown(starterSlot, durationMs = COUNTDOWN_MS) {
  if (gameState.remote.countdownEndsAt > performance.now() + 350) {
    return;
  }

  clearBattleCountdown();
  gameState.remote.countdownStarterSlot = starterSlot;
  gameState.remote.countdownEndsAt = performance.now() + durationMs;
  scheduleBattleCountdownTick();
}

async function triggerSharedBattleCountdown() {
  const snapshot = getRemoteSnapshot();
  if (
    gameState.mode !== "versus" ||
    !gameState.remote.playerSlot ||
    !snapshot ||
    snapshot.status !== "lobby" ||
    !snapshot.players.every((player) => player.name)
  ) {
    return;
  }

  startSharedBattleCountdown(gameState.remote.playerSlot, COUNTDOWN_MS);
  await sendRoomBroadcast("countdown-start", {
    starterSlot: gameState.remote.playerSlot,
    durationMs: COUNTDOWN_MS
  });
}

function clearPendingIncomingAttack() {
  const pending = gameState.remote.battle.pendingIncomingAttack;
  if (pending?.timerId) {
    clearTimeout(pending.timerId);
  }
  gameState.remote.battle.pendingIncomingAttack = null;
  gameState.remote.battle.feedback = null;
  arenaAlertText.classList.remove("danger", "blocked");
  arenaAlertHint.textContent = "";
  showArenaFlash(null);
}

async function resolveIncomingAttack(outcome = "hit") {
  const pending = gameState.remote.battle.pendingIncomingAttack;
  if (!pending) {
    return;
  }

  const fromSlot = pending.fromSlot;
  clearPendingIncomingAttack();

  if (outcome === "blocked") {
    showArenaFlash("blocked");
    showBattleFeedback("blocked", "BLOCK!", "Defense successful", 620);
    return;
  }

  const newHp = Math.max(0, getLocalBattleHp() - ATTACK_DAMAGE);
  setBattleHp(gameState.remote.playerSlot, newHp);
  flashDamageOverlay(ATTACK_DAMAGE);
  playHitSound();

  if (newHp <= 0) {
    await finishBattle(fromSlot);
  } else {
    await broadcastBattleState("hit");
    renderStats();
  }
}

function queueIncomingAttack(fromSlot, attackId) {
  clearPendingIncomingAttack();
  arenaAlertText.textContent = "DANGER!";
  arenaAlertHint.textContent = "Squat now to block";
  arenaAlertText.classList.remove("blocked");
  arenaAlertText.classList.add("danger");
  battleOverlay.hidden = gameState.screen !== "arena";
  showArenaFlash("danger");

  const timerId = setTimeout(() => {
    resolveIncomingAttack("hit");
  }, BLOCK_WINDOW_MS);

  gameState.remote.battle.pendingIncomingAttack = {
    id: attackId,
    fromSlot,
    startedAt: performance.now(),
    timerId
  };
}

async function synchronizeArenaEntry() {
  if (gameState.mode !== "versus" || !areBothPlayersSetupReady()) {
    return;
  }

  if (gameState.screen !== "arena") {
    setScreen("arena");
  }

  if (
    !gameState.remote.countdownEndsAt &&
    gameState.remote.playerSlot === 1 &&
    getRemoteSnapshot()?.status === "lobby"
  ) {
    await triggerSharedBattleCountdown();
  }
}

async function markSetupReadyAndSync() {
  if (
    gameState.mode !== "versus" ||
    !gameState.remote.playerSlot ||
    !gameState.remote.roomCode ||
    !getRemoteSnapshot() ||
    getRemoteSnapshot()?.status !== "lobby"
  ) {
    return;
  }

  if (!stream || !video.srcObject) {
    await startCamera();
  }

  if (!isSetupReady()) {
    roomHelpText.textContent = "Stand in frame until the camera and pose guide both lock in.";
    renderPreparationState();
    return;
  }

  gameState.remote.setupReadySlots[gameState.remote.playerSlot] = true;
  renderStats();
  await sendRoomBroadcast("setup-ready", {
    playerSlot: gameState.remote.playerSlot,
    ready: true
  });
  await synchronizeArenaEntry();
}

async function broadcastBattleState(reason = "state") {
  if (!gameState.remote.playerSlot) {
    return;
  }

  await sendRoomBroadcast("battle-state", {
    reason,
    playerSlot: gameState.remote.playerSlot,
    hp: getLocalBattleHp(),
    charges: getLocalBattleCharges(),
    reps: gameState.totalReps,
    winnerSlot: gameState.remote.battle.winnerSlot
  });
}

async function finishBattle(winnerSlot) {
  if (!winnerSlot || gameState.remote.battle.winnerSlot) {
    return;
  }

  gameState.remote.battle.winnerSlot = winnerSlot;
  gameState.remote.matchLive = false;
  gameState.running = false;
  if (gameState.remote.snapshot) {
    gameState.remote.snapshot = {
      ...gameState.remote.snapshot,
      status: "finished",
      winnerSlot
    };
  }

  const session = ensureProgressSession();
  session.battleOutcome =
    winnerSlot === gameState.remote.playerSlot
      ? "win"
      : "loss";

  await broadcastBattleState("finish");
  await saveProfileProgress();
  renderStats();
}

function resetRemoteState() {
  unsubscribeRemoteRoom();
  clearBattleCountdown();
  stopRoomHeartbeat();
  clearTimeout(battleFeedbackTimeoutId);
  resetPresenceState();
  gameState.remote.playerId = "";
  gameState.remote.playerSlot = 0;
  gameState.remote.roomCode = "";
  gameState.remote.matchType = "";
  gameState.remote.quickMatchPending = false;
  gameState.remote.snapshot = null;
  gameState.remote.privatePanelOpen = false;
  gameState.remote.scoreSent = 0;
  gameState.remote.finalizing = false;
  gameState.remote.matchLive = false;
  roomCodeInput.value = "";
  resetSetupReadyState();
  resetBattleState();
}

function clearGameplayCounters(options = {}) {
  const keepTotalReps = Boolean(options.keepTotalReps);
  const keepRemoteScoreSent = Boolean(options.keepRemoteScoreSent);

  gameState.running = false;
  gameState.totalReps = keepTotalReps ? gameState.totalReps : 0;
  gameState.stage = 1;
  gameState.singleStageReps = 0;
  gameState.currentTarget = STAGE_START;
  gameState.dailyChallenge.active = false;
  gameState.dailyChallenge.startAt = 0;
  gameState.dailyChallenge.timeLeftMs = DAILY_CHALLENGE_MS;
  gameState.dailyChallenge.completed = false;
  gameState.dailyChallenge.resolved = false;
  lastDailyRenderedSecond = -1;
  gameState.repPhase = "up";
  gameState.lastRepAt = 0;
  gameState.currentAngle = null;
  if (!keepRemoteScoreSent) {
    gameState.remote.scoreSent = 0;
  }
  countBurst.classList.remove("active");
  countBurst.textContent = "0";
  damageBurst.classList.remove("active");
  punchBurst.classList.remove("active");
}

function renderBattleStartOverlay() {
  const snapshot = getRemoteSnapshot();
  const countdownActive =
    gameState.screen === "arena" &&
    gameState.mode === "versus" &&
    snapshot?.status === "lobby" &&
    gameState.remote.countdownEndsAt > performance.now();

  startBattleOverlay.hidden = !countdownActive;
  startBattleOverlayBtn.hidden = true;
  battleCountdown.hidden = !countdownActive;

  if (countdownActive) {
    const secondsLeft = Math.max(
      1,
      Math.min(3, Math.ceil((gameState.remote.countdownEndsAt - performance.now()) / 1000))
    );
    battleCountdown.textContent = String(secondsLeft);
  }
}

function isMatchReadyToStart() {
  const snapshot = getRemoteSnapshot();
  return (
    gameState.mode === "versus" &&
    snapshot?.status === "lobby" &&
    snapshot.players.every((player) => player.name)
  );
}

function renderFinishOverlay() {
  if (gameState.mode !== "versus" || gameState.screen !== "arena") {
    finishOverlay.hidden = true;
    return;
  }

  const snapshot = getRemoteSnapshot();
  const winnerSlot = gameState.remote.battle.winnerSlot || snapshot?.winnerSlot || 0;
  const finished = snapshot?.status === "finished" || Boolean(winnerSlot);

  if (!finished) {
    finishOverlay.hidden = true;
    return;
  }

  finishOverlay.hidden = false;
  if (winnerSlot === 0) {
    finishTitle.textContent = "Draw!";
  } else {
    finishTitle.textContent = winnerSlot === gameState.remote.playerSlot ? "Winner!" : "Loser!";
  }
}

function makeRemotePlayers(snapshot) {
  return snapshot?.players ?? [
    { name: "Player 1", score: 0, connected: false },
    { name: "Player 2", score: 0, connected: false }
  ];
}

function getRemoteSnapshot() {
  const snapshot = gameState.remote.snapshot;
  if (!snapshot) {
    return null;
  }

  if (snapshot.status !== "live" || !snapshot.startedAt || snapshot.matchDurationMs <= 0) {
    return snapshot;
  }

  const elapsedMs = Date.now() - snapshot.startedAt;
  const remainingMs = Math.max(0, snapshot.matchDurationMs - elapsedMs);
  if (remainingMs > 0) {
    return {
      ...snapshot,
      timeLeftMs: remainingMs
    };
  }

  const players = makeRemotePlayers(snapshot);
  return {
    ...snapshot,
    status: "finished",
    timeLeftMs: 0,
    winnerSlot:
      players[0].score === players[1].score
        ? 0
        : players[0].score > players[1].score
          ? 1
          : 2
  };
}

function getRemotePlayers() {
  return makeRemotePlayers(getRemoteSnapshot());
}

function getRemoteTimeLeftMs() {
  const snapshot = getRemoteSnapshot();
  if (!snapshot) {
    return MATCH_SECONDS * 1000;
  }

  if (snapshot.matchDurationMs <= 0) {
    return 0;
  }

  return snapshot.timeLeftMs ?? MATCH_SECONDS * 1000;
}

function getRemoteStatusLine() {
  if (!gameState.remote.enabled) {
    return "Online mode is available after Supabase and Vercel environment variables are set.";
  }

  const snapshot = getRemoteSnapshot();
  if (!snapshot || !gameState.remote.roomCode) {
    return gameState.remote.quickMatchPending
      ? "Joining quick match..."
      : "Quick Match will search automatically. For friends, open Private Match and share a room code.";
  }

  if (snapshot.status === "lobby") {
    if (gameState.remote.matchType === "private") {
      if (!snapshot.players[1]?.name) {
        return "Private room ready. Share the code so your friend can join.";
      }

      return areBothPlayersSetupReady()
        ? "Both players are ready. Moving into the arena."
        : isLocalSetupReady()
          ? "You are ready. Waiting for the other player."
          : "Both players are in. Start your camera, then tap Start Match.";
    }

    if (!snapshot.players[1]?.name) {
      return "Searching for an opponent. Stay on this screen and we will match you automatically.";
    }

    return areBothPlayersSetupReady()
      ? "Both players are ready. Moving into the arena."
      : isLocalSetupReady()
        ? "You are ready. Waiting for your opponent."
        : "Opponent found. Start your camera, then tap Start Match.";
  }

  if (snapshot.status === "live") {
    return "Battle is live. Every 5 squats gives you 1 attack charge. Raise both hands to attack, and keep squatting during danger to block.";
  }

  if (snapshot.status === "finished") {
    const winnerSlot = gameState.remote.battle.winnerSlot || snapshot.winnerSlot;
    if (winnerSlot === 0) {
      return "The battle ended without a winner.";
    }

    return `Player ${winnerSlot} wins the battle.`;
  }

  return "Online match ready.";
}

function updateRoomUi() {
  const remoteActive = gameState.mode === "versus";
  soloConfigCard.hidden = remoteActive;
  remoteRoomCard.hidden = !remoteActive;
  battleConfigCard.hidden = !remoteActive;

  setupTitle.textContent = remoteActive ? "Battle Setup" : "Solo Setup";
  setupSubtitle.textContent = remoteActive
    ? "Find an opponent, pass the readiness check, then enter the live arena."
    : "Pick your stage, line up with the guide, and start your next solo run.";
  setupModeBadge.textContent = remoteActive ? "Battle" : "Solo";

  if (!remoteActive) {
    return;
  }

  roomCodeValue.textContent = gameState.remote.roomCode || "-----";
  playerSlotLabel.textContent = gameState.remote.playerSlot
    ? `Player ${gameState.remote.playerSlot}`
    : "Not Joined";

  const snapshot = getRemoteSnapshot();
  const waitingForQuickMatch = gameState.remote.quickMatchPending && !gameState.remote.roomCode;
  const quickRoomJoined = gameState.remote.matchType === "quick" && gameState.remote.roomCode;
  const privateRoomJoined = gameState.remote.matchType === "private" && gameState.remote.roomCode;

  roomStatusBadge.textContent = !gameState.remote.enabled
    ? "Setup Needed"
    : waitingForQuickMatch
      ? "Matching"
      : snapshot?.status
      ? snapshot.status[0].toUpperCase() + snapshot.status.slice(1)
      : "No Room";
  roomHelpText.textContent = getRemoteStatusLine();
  quickMatchStatus.textContent = !gameState.remote.enabled
    ? "Online setup needed"
    : waitingForQuickMatch
      ? "Joining queue..."
      : quickRoomJoined
        ? snapshot?.players?.[1]?.name
          ? "Opponent found"
          : "Searching for opponent..."
        : privateRoomJoined
          ? "Private room active"
          : "Ready to auto-match";

  const matchReady = isMatchReadyToStart();
  const cameraLive = Boolean(stream && video.srcObject);
  const countdownActive = matchReady && gameState.remote.countdownEndsAt > Date.now();
  matchReadyActions.hidden = !matchReady;
  matchReadyBtn.hidden = countdownActive;
  matchReadyBtn.disabled = countdownActive || areBothPlayersSetupReady();
  matchReadyBtn.textContent = areBothPlayersSetupReady()
    ? "Starting Arena..."
    : isLocalSetupReady()
      ? "Waiting for Opponent"
      : cameraLive
        ? "Start Match"
        : "Start Camera to Begin";

  privateMatchPanel.hidden = !gameState.remote.privatePanelOpen;
  privateMatchToggleBtn.textContent = gameState.remote.privatePanelOpen
    ? "Hide Private Match"
    : "Private Match";

  const canUsePrivate = gameState.remote.enabled && !gameState.remote.quickMatchPending;
  createRoomBtn.disabled = !canUsePrivate;
  joinRoomBtn.disabled = !canUsePrivate;
  roomCodeInput.disabled = !canUsePrivate;
}

function renderStats() {
  const profile = { ...DEFAULT_PROFILE, ...gameState.progression.profile };
  const signedIn = Boolean(gameState.progression.user);
  const dailyDone = profile.daily_challenge_completed_on === todayKey();
  const nextRank = getNextRankTier(profile.points);
  const previousRank = getPreviousRankTier(profile.points);
  const progressStart = Number(previousRank?.minPoints || 0);
  const progressEnd = Number(nextRank?.minPoints || progressStart || 1);
  const progressSpan = Math.max(1, progressEnd - progressStart);
  const progressPoints = Math.max(0, Number(profile.points || 0) - progressStart);
  const progressPercent = nextRank ? Math.min(100, (progressPoints / progressSpan) * 100) : 100;
  soloTargetPreview.textContent = gameState.soloVariant === "daily"
    ? "Complete 30 squats in 60 seconds to earn extra points."
    : `Start at ${getStageTarget(gameState.selectedStage)} reps and climb by 5 each stage.`;
  soloGoalTitle.textContent = gameState.soloVariant === "daily" ? "Daily Challenge" : "Squat Rush";
  stageButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.stage) === gameState.selectedStage);
  });
  soloVariantButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.variant === gameState.soloVariant);
  });

  profileName.textContent = signedIn
    ? profile.display_name || "Arena Fighter"
    : "Guest Fighter";
  profileHint.textContent = signedIn
    ? gameState.progression.resultReward?.label
      ? `${gameState.progression.resultReward.label} | Rank saves automatically.`
      : "Rank, points, and records save to your Google-linked account."
    : "Sign in with Google to save ranks, points, and daily rewards.";
  profileRankBadge.textContent = profile.rank || "Rookie";
  profilePoints.textContent = `${profile.points || 0} PTS`;
  profileTotalSquats.textContent = String(profile.total_squats || 0);
  profileBattleRecord.textContent = `${profile.battle_wins || 0}-${profile.battle_losses || 0}`;
  profileBestStage.textContent = String(profile.best_stage || 1);
  profileCheckInStatus.textContent = profile.daily_checkin_on === todayKey() ? "Claimed" : "Available";
  dailyChallengeStatus.textContent = dailyDone
    ? "Daily Challenge complete for today. You can still train, but the bonus has been claimed."
    : "Daily Challenge: 30 squats in 60 seconds for bonus points.";
  authGoogleBtn.hidden = signedIn;
  authSignOutBtn.hidden = !signedIn;
  dailyCheckInBtn.disabled = !signedIn || profile.daily_checkin_on === todayKey();

  if (profileHubName) {
    profileHubName.textContent = signedIn ? (profile.display_name || "Arena Fighter") : "Guest Fighter";
    profileHubHint.textContent = signedIn
      ? "Your Google-linked account keeps your rank, points, and battle record in sync."
      : "Sign in with Google to unlock persistent progression and the live leaderboard.";
    profileHubRankBadge.textContent = profile.rank || "Rookie";
    profileHubPoints.textContent = `${profile.points || 0} PTS`;
    profileHubSoloSessions.textContent = String(profile.solo_sessions || 0);
    profileHubBattleMatches.textContent = String(profile.battle_matches || 0);
    profileHubWinRate.textContent = getWinRate(profile);
    profileHubChallengeStatus.textContent = dailyDone ? "Claimed" : "Available";
    nextRankLabel.textContent = nextRank ? nextRank.name : "Max Rank";
    rankProgressFill.style.width = `${progressPercent}%`;
    rankProgressText.textContent = nextRank
      ? `${Math.max(0, progressEnd - Number(profile.points || 0))} points to ${nextRank.name}`
      : "You have reached the top rank.";
    renderRankLadder(profile);
    renderProgressHistory(profile);
    renderLeaderboard();
  }

  if (gameState.mode === "single") {
    modeHelp.textContent = gameState.soloVariant === "daily"
      ? "Daily Challenge: complete 30 squats in 60 seconds to earn extra points."
      : "Clear stage goals. Stage 1 starts at 10 squats and every stage adds 5 more.";
  }

  if (gameState.mode === "single") {
    liveCount.textContent = String(gameState.singleStageReps);
    hudLiveCount.textContent = liveCount.textContent;
    stageValue.textContent = gameState.soloVariant === "daily" ? "DAILY" : `L${gameState.stage}`;
    targetValue.textContent = gameState.soloVariant === "daily"
      ? `${Math.ceil(getDailyChallengeTimeLeft() / 1000)}s`
      : `${gameState.currentTarget} reps`;
    if (hudTarget) {
      hudTarget.textContent = targetValue.textContent;
    }
    roundLabel.textContent = gameState.soloVariant === "daily" ? "Daily Challenge" : `Level ${gameState.stage}`;
    player1HpBar.style.width = "100%";
    player2HpBar.style.width = "100%";
    player1HpLabel.textContent = "--";
    player2HpLabel.textContent = "--";
    overlayPlayer1HpBar.style.width = "100%";
    overlayPlayer2HpBar.style.width = "100%";
    overlayPlayer1HpLabel.textContent = "--";
    overlayPlayer2HpLabel.textContent = "--";
    overlayPlayer1Meta.textContent = "Solo";
    overlayPlayer2Meta.textContent = "Training";
    localPlayerPanel.classList.remove("charged");
    opponentPlayerPanel.classList.remove("charged");
    localRepPanel.classList.remove("charged");
    opponentRepPanel.classList.remove("charged");
    battleOverlay.hidden = true;
    finishOverlay.hidden = true;
    arenaAlertHint.textContent = "";
    statusText.textContent =
      gameState.running
        ? gameState.soloVariant === "daily"
          ? `Daily Challenge live. Reach ${DAILY_CHALLENGE_TARGET} squats before time expires.`
          : `Stage ${gameState.stage} is running. Reach ${gameState.currentTarget} squats.`
        : gameState.soloVariant === "daily"
          ? "Daily Challenge ready. Start the camera, line up sideways, and sprint to 30 squats."
          : "Start the camera, line up sideways, and the game will begin automatically.";
  } else {
    const remotePlayers = getRemotePlayers();
    const displayPlayers = getDisplayPlayers();
    const localScore = gameState.totalReps;
    const localCharges = getLocalBattleCharges();
    const opponentCharges = getBattleCharges(getOpponentSlot());
    const hp1 = getBattleHp(1);
    const hp2 = getBattleHp(2);
    const winnerSlot = gameState.remote.battle.winnerSlot;
    const feedback = gameState.remote.battle.feedback;
    const snapshot = getRemoteSnapshot();
    const timeLeftSeconds = Math.ceil(getRemoteTimeLeftMs() / 1000);
    const localHp = getLocalBattleHp();
    const opponentHp = getBattleHp(getOpponentSlot());

    liveCount.textContent = String(localScore);
    hudLiveCount.textContent = liveCount.textContent;
    stageValue.textContent = gameState.remote.playerSlot
      ? `P${gameState.remote.playerSlot}`
      : "Room";
    targetValue.textContent = `${localCharges} attack${localCharges === 1 ? "" : "s"}`;
    if (hudTarget) {
      hudTarget.textContent = snapshot?.status === "live"
        ? `${timeLeftSeconds}s`
        : "READY";
    }
    roundLabel.textContent = gameState.remote.roomCode
      ? `Room ${gameState.remote.roomCode}`
      : "Online Battle";
    player1Score.textContent = String(displayPlayers.local?.score ?? 0);
    player2Score.textContent = String(displayPlayers.opponent?.score ?? 0);
    player1HpBar.style.width = `${(hp1 / STARTING_HP) * 100}%`;
    player2HpBar.style.width = `${(hp2 / STARTING_HP) * 100}%`;
    player1HpLabel.textContent = `${hp1} HP`;
    player2HpLabel.textContent = `${hp2} HP`;
    overlayPlayer1HpBar.style.width = `${(localHp / STARTING_HP) * 100}%`;
    overlayPlayer2HpBar.style.width = `${(opponentHp / STARTING_HP) * 100}%`;
    overlayPlayer1HpLabel.textContent = `${localHp}/${STARTING_HP} HP`;
    overlayPlayer2HpLabel.textContent = `${opponentHp}/${STARTING_HP} HP`;
    overlayPlayer1Meta.textContent = `ATK x${localCharges}`;
    overlayPlayer2Meta.textContent = `ATK x${opponentCharges}`;
    localPlayerPanel.classList.toggle("charged", localCharges > 0);
    opponentPlayerPanel.classList.toggle("charged", opponentCharges > 0);
    localRepPanel.classList.toggle("charged", localCharges > 0);
    opponentRepPanel.classList.toggle("charged", opponentCharges > 0);
    battleOverlay.hidden =
      gameState.screen !== "arena" ||
      (!gameState.remote.battle.pendingIncomingAttack && !feedback);
    arenaAlertText.classList.remove("danger", "blocked");
    arenaAlertText.textContent = gameState.remote.battle.pendingIncomingAttack
      ? "DANGER!"
      : feedback?.text || "";
    arenaAlertHint.textContent = gameState.remote.battle.pendingIncomingAttack
      ? "Squat now to block"
      : feedback?.hint || "";
    if (gameState.remote.battle.pendingIncomingAttack) {
      arenaAlertText.classList.add("danger");
    } else if (feedback?.type === "blocked") {
      arenaAlertText.classList.add("blocked");
    }
    statusText.textContent = getRemoteStatusLine();

    if (winnerSlot) {
      statusText.textContent = `Player ${winnerSlot} wins the battle.`;
    }
  }

  if (gameState.mode === "single") {
    player1Score.textContent = String(gameState.totalReps);
    player2Score.textContent = "0";
    battleOverlay.hidden = true;
    arenaAlertText.textContent = "";
    arenaAlertHint.textContent = "";
    localPlayerPanel.classList.remove("charged");
    opponentPlayerPanel.classList.remove("charged");
    localRepPanel.classList.remove("charged");
    opponentRepPanel.classList.remove("charged");
  }

  updateRoomUi();
  renderPreparationState();
  renderResultsSummary();
  renderBattleStartOverlay();
  renderFinishOverlay();
  maybeShowResultsScreen();
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
    const message = String(data.error || "Request failed");
    if (message.includes("row-level security policy")) {
      throw new Error(
        "Online rooms are almost ready, but Supabase write access is still blocked. Once the service role key is corrected in Vercel, multiplayer will work."
      );
    }

    throw new Error(message);
  }

  return data;
}

function toRoomSnapshot(row) {
  const players = [
    {
      id: row.player1_id,
      slot: 1,
      name: row.player1_name || "",
      score: Number(row.player1_score || 0),
      connected: Boolean(row.player1_name)
    },
    {
      id: row.player2_id,
      slot: 2,
      name: row.player2_name || "",
      score: Number(row.player2_score || 0),
      connected: Boolean(row.player2_name)
    }
  ];

  const now = Date.now();
  const startedAt = row.started_at ? new Date(row.started_at).getTime() : null;
  const matchDurationMs = Number(row.match_duration_ms ?? MATCH_SECONDS * 1000);
  const elapsedMs = startedAt ? Math.max(0, now - startedAt) : 0;
  const timeLeftMs = startedAt && matchDurationMs > 0
    ? Math.max(0, matchDurationMs - elapsedMs)
    : matchDurationMs;

  return {
    code: row.code,
    status: row.status,
    startedAt,
    matchDurationMs,
    timeLeftMs,
    players,
    winnerSlot:
      row.status === "finished"
        ? players[0].score === players[1].score
          ? 0
          : players[0].score > players[1].score
            ? 1
            : 2
        : 0
  };
}

async function leaveRoomOnServer(targetSlot = 0) {
  if (!gameState.remote.roomCode || !gameState.remote.playerId) {
    return null;
  }

  const payload = await apiRequest("/api/leave-room", {
    method: "POST",
    body: {
      code: gameState.remote.roomCode,
      playerId: gameState.remote.playerId,
      targetSlot: targetSlot || gameState.remote.playerSlot
    }
  });

  return payload?.room || null;
}

function leaveRoomKeepalive(targetSlot = 0) {
  if (!gameState.remote.roomCode || !gameState.remote.playerId) {
    return;
  }

  fetch("/api/leave-room", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code: gameState.remote.roomCode,
      playerId: gameState.remote.playerId,
      targetSlot: targetSlot || gameState.remote.playerSlot
    }),
    keepalive: true
  }).catch(() => {});
}

function readPresenceSlots() {
  const nextSlots = {
    1: false,
    2: false
  };

  if (!gameState.remote.subscription?.presenceState) {
    return nextSlots;
  }

  const state = gameState.remote.subscription.presenceState();
  Object.values(state).forEach((metas) => {
    metas.forEach((meta) => {
      const slot = Number(meta?.playerSlot || 0);
      if ([1, 2].includes(slot)) {
        nextSlots[slot] = true;
      }
    });
  });

  return nextSlots;
}

function clearOpponentLeaveTimer() {
  if (gameState.remote.opponentLeaveTimerId) {
    clearTimeout(gameState.remote.opponentLeaveTimerId);
  }
  gameState.remote.opponentLeaveTimerId = 0;
}

async function handleOpponentMissing() {
  if (
    gameState.mode !== "versus" ||
    !gameState.remote.playerSlot ||
    !gameState.remote.roomCode ||
    gameState.remote.resolvingOpponentLeave
  ) {
    return;
  }

  const snapshot = getRemoteSnapshot();
  const opponentSlot = getOpponentSlot();
  if (!snapshot?.players?.[opponentSlot - 1]?.name) {
    return;
  }

  if (gameState.remote.presenceSlots[opponentSlot]) {
    return;
  }

  gameState.remote.resolvingOpponentLeave = true;
  try {
    const room = await leaveRoomOnServer(opponentSlot);
    if (room) {
      applyRemoteSnapshot(room);
      roomHelpText.textContent = snapshot.status === "live"
        ? "Opponent left the match. You win."
        : "Opponent left. Searching for the next player...";
    }
  } catch (error) {
    console.error(error);
  } finally {
    gameState.remote.resolvingOpponentLeave = false;
  }
}

function syncPresenceState() {
  gameState.remote.presenceSlots = readPresenceSlots();
  const snapshot = getRemoteSnapshot();

  if (gameState.mode !== "versus" || !gameState.remote.playerSlot || !snapshot) {
    renderStats();
    return;
  }

  if (snapshot.status === "finished") {
    clearOpponentLeaveTimer();
    renderStats();
    return;
  }

  const opponentSlot = getOpponentSlot();
  const opponentNamed = Boolean(snapshot.players?.[opponentSlot - 1]?.name);
  if (!opponentNamed || gameState.remote.presenceSlots[opponentSlot]) {
    clearOpponentLeaveTimer();
    renderStats();
    return;
  }

  if (!gameState.remote.opponentLeaveTimerId) {
    gameState.remote.opponentLeaveTimerId = setTimeout(() => {
      clearOpponentLeaveTimer();
      handleOpponentMissing();
    }, OPPONENT_LEAVE_GRACE_MS);
  }

  renderStats();
}

function applyRemoteSnapshot(snapshot) {
  const previousSnapshot = getRemoteSnapshot();
  updateLocalSlotFromSnapshot(snapshot);
  gameState.remote.snapshot = snapshot;
  const effectiveSnapshot = getRemoteSnapshot();

  if (gameState.mode !== "versus") {
    return;
  }

  if (effectiveSnapshot?.status === "live") {
    clearBattleCountdown();
    if (previousSnapshot?.status !== "live") {
      gameState.totalReps = 0;
      gameState.remote.scoreSent = 0;
      gameState.repPhase = "up";
      gameState.lastRepAt = 0;
      resetSetupReadyState();
      clearPendingIncomingAttack();
      initializeBattleState();
      if (gameState.remote.playerSlot) {
        broadcastBattleState("battle-start");
      }
    }
    gameState.remote.matchLive = true;
    gameState.running = true;
  } else {
    if (effectiveSnapshot?.status === "lobby" && previousSnapshot?.status !== "lobby") {
      gameState.totalReps = 0;
      gameState.remote.scoreSent = 0;
      resetSetupReadyState();
      clearPendingIncomingAttack();
      initializeBattleState();
    }
    if (effectiveSnapshot?.status !== "finished") {
      gameState.remote.matchLive = false;
    }
    gameState.running = false;

    if (effectiveSnapshot?.status === "finished" && !gameState.progression.session?.finalized) {
      const session = ensureProgressSession();
      if (!session.battleOutcome && gameState.mode === "versus") {
        const resolvedWinnerSlot = gameState.remote.battle.winnerSlot || effectiveSnapshot.winnerSlot || 0;
        session.battleOutcome =
          resolvedWinnerSlot === 0
            ? "draw"
            : resolvedWinnerSlot === gameState.remote.playerSlot
              ? "win"
              : "loss";
        saveProfileProgress().catch(() => {});
      }
    }
  }

  if (isQuickMatchWaiting()) {
    startRoomHeartbeat();
  } else {
    stopRoomHeartbeat();
  }

  renderStats();
}

function subscribeToRoom() {
  if (!gameState.remote.client || !gameState.remote.roomCode) {
    return;
  }

  unsubscribeRemoteRoom();

  const subscription = gameState.remote.client
    .channel(`room:${gameState.remote.roomCode}`, {
      config: {
        broadcast: {
          self: true
        },
        presence: {
          key: gameState.remote.playerId
        }
      }
    })
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rooms",
        filter: `code=eq.${gameState.remote.roomCode}`
      },
      (payload) => {
        if (payload.new) {
          applyRemoteSnapshot(toRoomSnapshot(payload.new));
        }
      }
    )
    .on("broadcast", { event: "battle-state" }, ({ payload }) => {
      const slot = Number(payload?.playerSlot || 0);
      if (![1, 2].includes(slot)) {
        return;
      }

      setBattleHp(slot, payload.hp);
      setBattleCharges(slot, payload.charges);

      if (
        Number.isFinite(payload.reps) &&
        gameState.remote.snapshot?.players?.[slot - 1]
      ) {
        gameState.remote.snapshot.players[slot - 1].score = Math.max(
          Number(gameState.remote.snapshot.players[slot - 1].score || 0),
          Number(payload.reps || 0)
        );
      }

      if (payload.winnerSlot) {
        gameState.remote.battle.winnerSlot = Number(payload.winnerSlot);
        gameState.remote.matchLive = false;
        gameState.running = false;
        if (gameState.remote.snapshot) {
          gameState.remote.snapshot = {
            ...gameState.remote.snapshot,
            status: "finished",
            winnerSlot: Number(payload.winnerSlot)
          };
        }
      }

      renderStats();
    })
    .on("broadcast", { event: "attack" }, async ({ payload }) => {
      const attackId = String(payload?.id || "");
      const fromSlot = Number(payload?.fromSlot || 0);
      if (!attackId || !fromSlot || fromSlot === gameState.remote.playerSlot) {
        return;
      }

      if (gameState.remote.battle.processedAttacks.has(attackId)) {
        return;
      }
      gameState.remote.battle.processedAttacks.add(attackId);

      if (!gameState.running || getLocalBattleHp() <= 0) {
        return;
      }
      queueIncomingAttack(fromSlot, attackId);
      renderStats();
    })
    .on("broadcast", { event: "setup-ready" }, async ({ payload }) => {
      const slot = Number(payload?.playerSlot || 0);
      if (![1, 2].includes(slot)) {
        return;
      }

      gameState.remote.setupReadySlots[slot] = Boolean(payload?.ready);
      renderStats();
      await synchronizeArenaEntry();
    })
    .on("broadcast", { event: "countdown-start" }, ({ payload }) => {
      const starterSlot = Number(payload?.starterSlot || 0);
      const durationMs = Number(payload?.durationMs || COUNTDOWN_MS);
      if (!starterSlot) {
        return;
      }

      startSharedBattleCountdown(starterSlot, durationMs);
    })
    .on("presence", { event: "sync" }, () => {
      syncPresenceState();
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        subscription.track({
          playerId: gameState.remote.playerId,
          playerSlot: gameState.remote.playerSlot,
          roomCode: gameState.remote.roomCode,
          onlineAt: Date.now()
        }).catch(() => {});
        syncPresenceState();
      }
      if (status === "CHANNEL_ERROR") {
        roomHelpText.textContent = "Realtime connection dropped. Refresh to reconnect to the room.";
      }
    });

  gameState.remote.subscription = subscription;
}

async function createRoom() {
  if (!gameState.remote.enabled) {
    throw new Error("Online mode is not configured yet.");
  }

  resetRemoteState();
  gameState.remote.privatePanelOpen = true;

  const payload = await apiRequest("/api/create-room", {
    method: "POST",
    body: { name: "Player 1" }
  });

  gameState.remote.playerId = payload.playerId;
  gameState.remote.playerSlot = payload.playerSlot;
  gameState.remote.roomCode = payload.room.code;
  gameState.remote.matchType = "private";
  gameState.remote.snapshot = payload.room;
  gameState.remote.scoreSent = 0;
  roomCodeInput.value = payload.room.code;
  subscribeToRoom();
  renderStats();
}

async function joinRoom() {
  if (!gameState.remote.enabled) {
    throw new Error("Online mode is not configured yet.");
  }

  const code = roomCodeInput.value.trim().toUpperCase();
  if (!code) {
    roomHelpText.textContent = "Enter the room code from Player 1.";
    return;
  }

  resetRemoteState();
  gameState.remote.privatePanelOpen = true;

  const payload = await apiRequest("/api/join-room", {
    method: "POST",
    body: { code, name: "Player 2" }
  });

  gameState.remote.playerId = payload.playerId;
  gameState.remote.playerSlot = payload.playerSlot;
  gameState.remote.roomCode = payload.room.code;
  gameState.remote.matchType = "private";
  gameState.remote.snapshot = payload.room;
  gameState.remote.scoreSent = 0;
  roomCodeInput.value = payload.room.code;
  subscribeToRoom();
  renderStats();
}

async function enterQuickMatch() {
  if (
    !gameState.remote.enabled ||
    gameState.mode !== "versus" ||
    gameState.remote.quickMatchPending ||
    gameState.remote.roomCode
  ) {
    return;
  }

  gameState.remote.quickMatchPending = true;
  gameState.remote.matchType = "quick";
  renderStats();

  try {
    const payload = await apiRequest("/api/quick-match", {
      method: "POST",
      body: {
        name: "Player"
      }
    });

    gameState.remote.playerId = payload.playerId;
    gameState.remote.playerSlot = payload.playerSlot;
    gameState.remote.roomCode = payload.room.code;
    gameState.remote.snapshot = payload.room;
    gameState.remote.scoreSent = 0;
    subscribeToRoom();

    if (isQuickMatchWaiting()) {
      startRoomHeartbeat();
    }
  } catch (error) {
    gameState.remote.matchType = "";
    roomHelpText.textContent = error.message;
  } finally {
    gameState.remote.quickMatchPending = false;
    renderStats();
  }
}

async function startRemoteMatch() {
  if (!gameState.remote.roomCode || !gameState.remote.playerId) {
    roomHelpText.textContent = "Join Quick Match or open Private Match first.";
    return;
  }

  const payload = await apiRequest("/api/start-match", {
    method: "POST",
    body: {
      code: gameState.remote.roomCode,
      playerId: gameState.remote.playerId
    }
  });

  gameState.totalReps = 0;
  gameState.remote.scoreSent = 0;
  gameState.remote.matchLive = true;
  initializeBattleState();
  applyRemoteSnapshot(payload.room);
}

async function resetRemoteMatch() {
  if (!gameState.remote.roomCode || !gameState.remote.playerId) {
    resetRemoteState();
    renderStats();
    return;
  }

  const payload = await apiRequest("/api/reset-match", {
    method: "POST",
    body: {
      code: gameState.remote.roomCode,
      playerId: gameState.remote.playerId
    }
  });

  gameState.totalReps = 0;
  gameState.remote.scoreSent = 0;
  gameState.remote.finalizing = false;
  gameState.remote.matchLive = false;
  initializeBattleState();
  applyRemoteSnapshot(payload.room);
}

async function syncRemoteScore() {
  const snapshot = getRemoteSnapshot();
  if (
    gameState.mode !== "versus" ||
    !gameState.remote.roomCode ||
    !gameState.remote.playerId ||
    gameState.remote.scoreSent === gameState.totalReps ||
    snapshot?.status !== "live"
  ) {
    return;
  }

  gameState.remote.scoreSent = gameState.totalReps;
  await apiRequest("/api/update-score", {
    method: "POST",
    body: {
      code: gameState.remote.roomCode,
      playerId: gameState.remote.playerId,
      score: gameState.totalReps
    }
  }).catch(() => {
    roomHelpText.textContent = "Could not send your score update. We will try again on the next rep.";
    gameState.remote.scoreSent = Math.max(0, gameState.totalReps - 1);
  });
}

async function loadOnlineConfig() {
  try {
    const config = await apiRequest("/api/config");
    if (!config.enabled || !config.supabaseUrl || !config.supabaseAnonKey) {
      gameState.remote.enabled = false;
      gameState.remote.ready = true;
      renderStats();
      return;
    }

    gameState.remote.client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    const sessionData = await gameState.remote.client.auth.getSession();
    gameState.progression.user = sessionData?.data?.session?.user || null;
    gameState.remote.client.auth.onAuthStateChange((_event, session) => {
      gameState.progression.user = session?.user || null;
      fetchProfile().catch((error) => {
        console.error(error);
      });
    });
    gameState.remote.enabled = true;
    gameState.remote.ready = true;
    await fetchProfile();
    renderStats();
    if (gameState.mode === "versus") {
      enterQuickMatch().catch((error) => {
        roomHelpText.textContent = error.message;
      });
    }
  } catch (error) {
    console.error(error);
    gameState.remote.enabled = false;
    gameState.remote.ready = true;
    renderStats();
  }
}

async function setupPoseLandmarker() {
  poseStatus.textContent = "Loading pose model...";
  poseProgressLabel.textContent = "Loading...";
  poseProgressFill.style.width = "34%";

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
  poseProgressLabel.textContent = "100%";
  poseProgressFill.style.width = "100%";
  renderPreparationState();
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
    resizeCanvas();
    cameraStatus.textContent =
      gameState.facingMode === "user" ? "Front camera live" : "Rear camera live";

    const remoteSnapshot = getRemoteSnapshot();
    const remoteMatchLive = gameState.mode === "versus" && remoteSnapshot?.status === "live";
    clearGameplayCounters({
      keepTotalReps: remoteMatchLive,
      keepRemoteScoreSent: remoteMatchLive
    });

    if (gameState.mode === "single") {
      gameState.running = true;
      statusText.textContent = `Camera is live. Stage ${gameState.stage} is running.`;
    } else {
      if (remoteMatchLive) {
        gameState.running = true;
      }
      statusText.textContent = getRemoteStatusLine();
    }

    renderStats();

    if (!animationFrameId) {
      predictLoop();
    }
  } catch (error) {
    console.error(error);
    setCameraPresentation(false);
    cameraStatus.textContent = "Camera blocked";
    statusText.textContent =
      "We could not access the camera. Open this app in a secure browser tab and allow camera access.";
    renderPreparationState();
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

  if (mode === "single") {
    modeLabel.textContent = "Single Player";
    modeHelp.textContent = gameState.soloVariant === "daily"
      ? "Daily Challenge: complete 30 squats in 60 seconds to earn extra points."
      : "Clear stage goals. Stage 1 starts at 10 squats and every stage adds 5 more.";
    roundLabel.textContent = gameState.soloVariant === "daily" ? "Daily Challenge" : `Level ${gameState.stage}`;
  } else {
    modeLabel.textContent = "2 Players";
    modeHelp.textContent = gameState.remote.enabled
      ? "Quick Match auto-finds an opponent. Private Match stays available for friends. Every 5 squats gives you 1 attack, then raise both hands to strike."
      : "Online mode appears here after the Vercel and Supabase setup is connected.";
    roundLabel.textContent = "Online Battle";
  }

  clearGameplayCounters();
  renderStats();

  if (mode === "versus" && gameState.remote.enabled) {
    enterQuickMatch().catch((error) => {
      roomHelpText.textContent = error.message;
    });
  }
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

async function beginArena() {
  if (gameState.mode === "single") {
    if (!stream || !video.srcObject) {
      await startCamera();
    }

    if (!isSetupReady()) {
      renderPreparationState();
      return;
    }

    setScreen("arena");
    openArenaMenu(false);
    resetProgressSession();
    applySelectedSoloStage();
    ensureProgressSession();
    gameState.running = true;
    if (gameState.soloVariant === "daily") {
      startDailyChallengeRun();
      statusText.textContent = `Daily Challenge live. Reach ${DAILY_CHALLENGE_TARGET} squats in 60 seconds.`;
    } else {
      statusText.textContent = `Stage ${gameState.stage} is running. Reach ${gameState.currentTarget} squats.`;
    }
    renderStats();
    return;
  }

  await markSetupReadyAndSync();
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

  if (
    gameState.mode === "versus" &&
    gameState.remote.battle.pendingIncomingAttack &&
    stateInfo.state === "Down"
  ) {
    resolveIncomingAttack("blocked");
  }

  const repTrackingActive =
    gameState.mode === "single"
      ? gameState.running
      : isVersusMatchActive();

  if (!repTrackingActive || !stateInfo.angle) {
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

function isAttackGesture(landmarks) {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[16];

  const armsReady =
    landmarkVisible(leftShoulder) &&
    landmarkVisible(rightShoulder) &&
    landmarkVisible(leftElbow) &&
    landmarkVisible(rightElbow) &&
    landmarkVisible(leftWrist) &&
    landmarkVisible(rightWrist);

  if (!armsReady) {
    return false;
  }

  const leftRaised =
    leftWrist.y < leftShoulder.y - 0.12 &&
    leftElbow.y < leftShoulder.y + 0.05;
  const rightRaised =
    rightWrist.y < rightShoulder.y - 0.12 &&
    rightElbow.y < rightShoulder.y + 0.05;

  return leftRaised && rightRaised;
}

async function triggerAttack() {
  if (
    gameState.mode !== "versus" ||
    !gameState.running ||
    !gameState.remote.playerSlot ||
    getLocalBattleCharges() < 1
  ) {
    return;
  }

  setBattleCharges(gameState.remote.playerSlot, getLocalBattleCharges() - 1);
  gameState.remote.battle.lastAttackAt = performance.now();
  gameState.remote.battle.attackSequence += 1;

  const attackId = [
    gameState.remote.roomCode,
    gameState.remote.playerSlot,
    Date.now(),
    gameState.remote.battle.attackSequence
  ].join(":");

  gameState.remote.battle.processedAttacks.add(attackId);
  flashPunchOverlay();
  playAttackSound();
  renderStats();
  await broadcastBattleState("attack-spent");
  await sendRoomBroadcast("attack", {
    id: attackId,
    fromSlot: gameState.remote.playerSlot
  });
}

function trackBattleGesture(landmarks, stateInfo) {
  if (
    gameState.mode !== "versus" ||
    !isVersusMatchActive() ||
    getLocalBattleCharges() < 1 ||
    stateInfo.state !== "Up" ||
    !isAttackGesture(landmarks)
  ) {
    gameState.remote.battle.gestureHoldStartedAt = 0;
    return;
  }

  const now = performance.now();
  if (now - gameState.remote.battle.lastAttackAt < ATTACK_COOLDOWN_MS) {
    return;
  }

  if (!gameState.remote.battle.gestureHoldStartedAt) {
    gameState.remote.battle.gestureHoldStartedAt = now;
    return;
  }

  if (now - gameState.remote.battle.gestureHoldStartedAt >= ATTACK_GESTURE_HOLD_MS) {
    gameState.remote.battle.gestureHoldStartedAt = 0;
    triggerAttack();
  }
}

function registerRep() {
  gameState.totalReps += 1;
  const session = ensureProgressSession();
  session.reps += 1;

  if (gameState.mode === "single") {
    gameState.singleStageReps += 1;

    if (gameState.soloVariant === "daily") {
      if (gameState.totalReps >= DAILY_CHALLENGE_TARGET && !gameState.dailyChallenge.resolved) {
        finalizeDailyChallenge(true);
      }
    } else if (gameState.singleStageReps >= gameState.currentTarget) {
      session.stageClears += 1;
      session.bestStage = Math.max(session.bestStage, gameState.stage);
      gameState.stage += 1;
      gameState.singleStageReps = 0;
      gameState.currentTarget = STAGE_START + (gameState.stage - 1) * STAGE_STEP;
      arenaAlertText.textContent = "STAGE CLEAR!";
      statusText.textContent = `Stage cleared. Welcome to Stage ${gameState.stage}. New target: ${gameState.currentTarget}.`;
    }
  } else if (gameState.totalReps % ATTACK_CHARGE_REPS === 0 && gameState.remote.playerSlot) {
    setBattleCharges(
      gameState.remote.playerSlot,
      getLocalBattleCharges() + 1
    );
    arenaAlertText.classList.remove("danger", "blocked");
    broadcastBattleState("charge");
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
    updateDailyChallengeState();
    animationFrameId = requestAnimationFrame(predictLoop);
    return;
  }

  resizeCanvas();
  updateDailyChallengeState();

  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    const result = poseLandmarker.detectForVideo(video, performance.now());

    if (result.landmarks?.[0]) {
      lastStableLandmarks = result.landmarks;
      lastStablePoseAt = performance.now();
      drawPose(result.landmarks);
      const stateInfo = estimateSquatState(result.landmarks[0]);
      trackSquat(stateInfo);
      trackBattleGesture(result.landmarks[0], stateInfo);
      updateDailyChallengeState();
      poseStatus.textContent =
        stateInfo.angle == null
          ? "Find a full side view"
          : `${stateInfo.state} | knee angle ${Math.round(stateInfo.angle)} deg`;
      renderPreparationState();
    } else {
      gameState.remote.battle.gestureHoldStartedAt = 0;
      formState.textContent = "Searching";
      if (lastStableLandmarks && performance.now() - lastStablePoseAt < 180) {
        drawPose(lastStableLandmarks);
        poseStatus.textContent = "Hold position";
      } else {
        drawPose(null);
        poseStatus.textContent = "Searching for your pose";
      }
      renderPreparationState();
    }
  }

  animationFrameId = requestAnimationFrame(predictLoop);
}

startCameraBtn.addEventListener("click", startCamera);
switchCameraBtn.addEventListener("click", async () => {
  gameState.facingMode = gameState.facingMode === "user" ? "environment" : "user";
  await startCamera();
});

lobbySoloBtn.addEventListener("click", () => {
  gameState.soloVariant = "stages";
  enterSetup("single");
});

lobbyBattleBtn.addEventListener("click", () => {
  enterSetup("versus");
});

dailyChallengeBtn.addEventListener("click", () => {
  gameState.soloVariant = "daily";
  enterSetup("single");
});

authGoogleBtn.addEventListener("click", () => {
  signInWithGoogle().catch(() => {});
});

authSignOutBtn.addEventListener("click", () => {
  signOutProfile().catch(() => {});
});

dailyCheckInBtn.addEventListener("click", () => {
  claimDailyCheckIn().catch(() => {});
});

globalLobbyBtn.addEventListener("click", () => {
  returnToMainMenu().catch(() => {});
});
backToLobbySetupBtn.addEventListener("click", () => {
  returnToMainMenu().catch(() => {});
});
backToLobbyResultsBtn.addEventListener("click", returnToMainMenu);

howToPlayBtn.addEventListener("click", () => openHowToPlay(true));
lobbyHowToPlayBtn.addEventListener("click", () => openHowToPlay(true));
lobbyTipsBtn.addEventListener("click", showCameraTips);
openProfileHubBtn.addEventListener("click", () => {
  openProfileHub();
});
openLeaderboardBtn.addEventListener("click", () => {
  openProfileHub();
});
backToLobbyProfileBtn.addEventListener("click", () => {
  returnToMainMenu().catch(() => {});
});
closeHowToPlayBtn.addEventListener("click", () => openHowToPlay(false));
howToPlayBackdrop.addEventListener("click", () => openHowToPlay(false));

stageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    gameState.selectedStage = Number(button.dataset.stage);
    if (gameState.mode === "single") {
      applySelectedSoloStage();
    }
    renderStats();
  });
});

soloVariantButtons.forEach((button) => {
  button.addEventListener("click", () => {
    gameState.soloVariant = button.dataset.variant === "daily" ? "daily" : "stages";
    applySelectedSoloStage();
    renderStats();
  });
});

privateMatchToggleBtn.addEventListener("click", () => {
  gameState.remote.privatePanelOpen = !gameState.remote.privatePanelOpen;
  renderStats();
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

startBattleOverlayBtn.addEventListener("click", async () => {
  try {
    await triggerSharedBattleCountdown();
  } catch (error) {
    roomHelpText.textContent = error.message;
  }
});

matchReadyBtn.addEventListener("click", async () => {
  try {
    await beginArena();
  } catch (error) {
    roomHelpText.textContent = error.message;
  }
});

startArenaBtn.addEventListener("click", async () => {
  try {
    await beginArena();
  } catch (error) {
    roomHelpText.textContent = error.message;
  }
});

arenaMenuBtn.addEventListener("click", () => {
  openArenaMenu(true);
});

arenaResumeBtn.addEventListener("click", () => {
  openArenaMenu(false);
});

arenaQuitBtn.addEventListener("click", () => {
  returnToMainMenu().catch(() => {});
});

playAgainBtn.addEventListener("click", async () => {
  if (gameState.mode === "versus") {
    await resetRemoteMatch().catch(() => {});
  } else {
    clearGameplayCounters();
    resetProgressSession();
    applySelectedSoloStage();
  }
  setScreen("setup");
  renderStats();
});

backToMenuBtn.addEventListener("click", () => {
  returnToMainMenu().catch(() => {});
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pagehide", () => {
  leaveRoomKeepalive();
});

setScreen("lobby");
applySelectedSoloStage();
renderStats();
loadOnlineConfig();
setupPoseLandmarker().catch((error) => {
  console.error(error);
  poseStatus.textContent = "Pose model failed to load";
  poseProgressLabel.textContent = "Error";
  poseProgressFill.style.width = "100%";
  statusText.textContent =
    "The pose model could not load. Check your internet connection, then refresh the page.";
});

