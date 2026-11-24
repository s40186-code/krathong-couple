const firebaseConfig = {
  apiKey: "AIzaSyBrcIEE6mc1f1LMSavCesvpCvjIRy7wzRI",
  authDomain: "kathong-couple-9e28c.firebaseapp.com",
  projectId: "kathong-couple-9e28c",
  storageBucket: "kathong-couple-9e28c.firebasestorage.app",
  messagingSenderId: "891643168755",
  appId: "1:891643168755:web:1a08fd0518ccffda28b486",
  measurementId: "G-RQ705EZZDC",
  databaseURL: "https://kathong-couple-9e28c-default-rtdb.asia-southeast1.firebasedatabase.app"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const $ = id => document.getElementById(id);

let room = "our-love";
let side = "left";
let selectedType = "rose";
let roomRef = null;
let roomData = {};
let animationStarted = false;
let saveTimer = null;
let draggingId = null;
let dragElement = null;
let decorations = {};

const flowerTypes = ["rose", "lotus", "tulip", "daisy", "orchid"];

function escapeId(value) {
  return String(value).replace(/[^a-zA-Z0-9]/g, "");
}

function flowerSVG(type, uid) {
  const palettes = {
    rose: ["#ffb0c5", "#ec668d", "#c52e63", "#8c2048"],
    lotus: ["#fff0f5", "#f5a9ca", "#dc73a8", "#a94880"],
    tulip: ["#ffc0d1", "#f0719c", "#c83e70", "#8f294f"],
    daisy: ["#fffdf3", "#fff8d9", "#f6d66b", "#d9a52f"],
    orchid: ["#f8c5ef", "#d98bd0", "#aa5ba9", "#703d83"]
  };

  const p = palettes[type] || palettes.rose;
  let petals = "";

  if (type === "rose") {
    petals = `
      <ellipse cx="50" cy="31" rx="17" ry="25" fill="${p[0]}" transform="rotate(-42 50 50)"/>
      <ellipse cx="50" cy="31" rx="17" ry="25" fill="${p[1]}" transform="rotate(42 50 50)"/>
      <ellipse cx="69" cy="50" rx="17" ry="25" fill="${p[0]}" transform="rotate(90 50 50)"/>
      <ellipse cx="50" cy="69" rx="17" ry="25" fill="${p[1]}" transform="rotate(138 50 50)"/>
      <ellipse cx="31" cy="50" rx="17" ry="25" fill="${p[0]}" transform="rotate(180 50 50)"/>
      <ellipse cx="50" cy="50" rx="16" ry="21" fill="${p[2]}"/>
      <path d="M42 51 C32 38 52 29 58 42 C64 54 45 64 43 51 C41 44 52 40 55 47" fill="none" stroke="${p[3]}" stroke-width="6" stroke-linecap="round"/>
      <path d="M45 46 Q50 38 56 46" fill="none" stroke="#ffb8ca" stroke-width="3"/>
    `;
  } else if (type === "lotus") {
    for (let i = 0; i < 10; i++) {
      petals += `<path d="M50 57 C29 45 33 17 50 8 C67 17 71 45 50 57Z"
        fill="${i % 2 ? p[1] : p[0]}" stroke="${p[2]}" stroke-width="1.5"
        transform="rotate(${i * 36} 50 55)"/>`;
    }
    petals += `<circle cx="50" cy="52" r="13" fill="${p[2]}"/>
      <circle cx="50" cy="52" r="7" fill="#ffe2a3"/>`;
  } else if (type === "tulip") {
    petals = `
      <path d="M18 69 Q12 26 35 17 Q43 28 50 15 Q59 28 66 17 Q89 27 82 69 Q50 91 18 69Z" fill="${p[1]}" stroke="${p[2]}" stroke-width="2"/>
      <path d="M18 69 Q28 31 43 26 Q47 50 50 72Z" fill="${p[0]}"/>
      <path d="M50 72 Q55 36 66 26 Q80 36 82 69 Q67 83 50 72Z" fill="${p[1]}"/>
      <path d="M50 72 Q46 32 50 15 Q61 30 62 66Z" fill="${p[0]}"/>
      <path d="M50 76 L50 94" stroke="#4c8b50" stroke-width="5" stroke-linecap="round"/>
    `;
  } else if (type === "daisy") {
    for (let i = 0; i < 12; i++) {
      petals += `<ellipse cx="50" cy="24" rx="9" ry="22"
        fill="${i % 2 ? p[0] : "#fff"}"
        stroke="#e8d9c8" stroke-width="1"
        transform="rotate(${i * 30} 50 50)"/>`;
    }
    petals += `<circle cx="50" cy="50" r="15" fill="${p[2]}"/>
      <circle cx="45" cy="45" r="4" fill="#fff0a8" opacity=".8"/>`;
  } else if (type === "orchid") {
    petals = `
      <ellipse cx="50" cy="28" rx="17" ry="27" fill="${p[0]}" stroke="${p[2]}" stroke-width="1.5"/>
      <ellipse cx="27" cy="44" rx="17" ry="25" fill="${p[1]}" transform="rotate(-45 27 44)" stroke="${p[2]}" stroke-width="1.5"/>
      <ellipse cx="73" cy="44" rx="17" ry="25" fill="${p[1]}" transform="rotate(45 73 44)" stroke="${p[2]}" stroke-width="1.5"/>
      <ellipse cx="38" cy="72" rx="16" ry="23" fill="${p[0]}" transform="rotate(25 38 72)" stroke="${p[2]}" stroke-width="1.5"/>
      <ellipse cx="62" cy="72" rx="16" ry="23" fill="${p[0]}" transform="rotate(-25 62 72)" stroke="${p[2]}" stroke-width="1.5"/>
      <path d="M50 38 C69 46 65 72 50 76 C35 72 31 46 50 38Z" fill="${p[3]}"/>
      <circle cx="50" cy="54" r="6" fill="#ffe6a2"/>
    `;
  }

  return `
    <svg viewBox="0 0 100 100" aria-label="${type}">
      <defs>
        <radialGradient id="shine${escapeId(uid)}" cx="35%" cy="25%">
          <stop offset="0" stop-color="#fff" stop-opacity=".8"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <g>${petals}</g>
      <ellipse cx="36" cy="27" rx="13" ry="7" fill="url(#shine${escapeId(uid)})" opacity=".55"/>
    </svg>
  `;
}

function candleSVG() {
  return `
    <svg viewBox="0 0 60 100">
      <path d="M30 5 C13 27 25 34 30 39 C35 32 47 24 30 5Z" fill="#ffae42">
        <animate attributeName="d" dur=".8s" repeatCount="indefinite"
          values="M30 5 C13 27 25 34 30 39 C35 32 47 24 30 5Z;M30 7 C18 25 24 34 30 39 C38 31 43 23 30 7Z;M30 5 C13 27 25 34 30 39 C35 32 47 24 30 5Z"/>
      </path>
      <path d="M30 15 C23 28 29 31 30 34 C35 27 35 22 30 15Z" fill="#fff4b2"/>
      <rect x="22" y="37" width="16" height="53" rx="4" fill="#fff0d4" stroke="#d9b98d" stroke-width="2"/>
      <path d="M24 48 L36 48 M24 59 L36 59 M24 70 L36 70" stroke="#e6c69e" opacity=".7"/>
      <path d="M30 37 L30 30" stroke="#4a3027" stroke-width="2"/>
    </svg>
  `;
}

function incenseSVG() {
  return `
    <svg viewBox="0 0 50 110">
      <path d="M24 102 L29 12" stroke="#a66b42" stroke-width="5" stroke-linecap="round"/>
      <path d="M29 12 L29 7" stroke="#ed6a52" stroke-width="5" stroke-linecap="round"/>
      <path d="M28 7 C14 -2 41 -2 27 -15" fill="none" stroke="#eee" stroke-width="3" opacity=".8">
        <animate attributeName="d" dur="2s" repeatCount="indefinite"
          values="M28 7 C14 -2 41 -2 27 -15;M28 7 C40 -2 12 -5 30 -17;M28 7 C14 -2 41 -2 27 -15"/>
      </path>
    </svg>
  `;
}

function createDecorationElement(id, item) {
  const el = document.createElement("div");
  el.className = "decoration";
  el.dataset.id = id;
  el.dataset.type = item.type;
  el.style.left = `${item.x}%`;
  el.style.top = `${item.y}%`;

  if (flowerTypes.includes(item.type)) {
    el.classList.add("flower");
    el.innerHTML = flowerSVG(item.type, id);
  } else if (item.type === "candle") {
    el.classList.add("candle");
    el.innerHTML = candleSVG();
  } else {
    el.classList.add("incense");
    el.innerHTML = incenseSVG();
  }

  el.addEventListener("pointerdown", startDrag);
  return el;
}

function renderDecorations() {
  const layer = $("decorLayer");
  if (!layer) return;

  layer.innerHTML = "";
  decorations = roomData.decorations || {};

  Object.entries(decorations).forEach(([id, item]) => {
    if (!item || typeof item.x !== "number" || typeof item.y !== "number") return;
    layer.appendChild(createDecorationElement(id, item));
  });
}

function scenePosition(event) {
  const rect = $("mainScene").getBoundingClientRect();
  return {
    x: Math.max(5, Math.min(95, ((event.clientX - rect.left) / rect.width) * 100)),
    y: Math.max(5, Math.min(95, ((event.clientY - rect.top) / rect.height) * 100))
  };
}

function addDecoration(event) {
  if (event.target.closest(".decoration")) return;
  if (!roomRef || !auth.currentUser) return;
  if (roomData.phase && roomData.phase !== "editing") return;

  const point = scenePosition(event);
  const newItem = {
    type: selectedType,
    side,
    x: point.x,
    y: point.y,
    createdAt: Date.now()
  };

  roomRef.child("decorations").push(newItem);
}

function startDrag(event) {
  if (roomData.phase && roomData.phase !== "editing") return;
  event.preventDefault();
  event.stopPropagation();

  draggingId = event.currentTarget.dataset.id;
  dragElement = event.currentTarget;
  dragElement.classList.add("dragging");
  dragElement.setPointerCapture(event.pointerId);

  dragElement.addEventListener("pointermove", moveDrag);
  dragElement.addEventListener("pointerup", endDrag);
  dragElement.addEventListener("pointercancel", endDrag);
}

function moveDrag(event) {
  if (!dragElement) return;
  const point = scenePosition(event);
  dragElement.style.left = `${point.x}%`;
  dragElement.style.top = `${point.y}%`;
}

function endDrag(event) {
  if (!dragElement || !draggingId) return;

  const trashRect = $("trash").getBoundingClientRect();
  const overTrash =
    event.clientX >= trashRect.left &&
    event.clientX <= trashRect.right &&
    event.clientY >= trashRect.top &&
    event.clientY <= trashRect.bottom;

  if (overTrash) {
    roomRef.child("decorations").child(draggingId).remove();
  } else {
    const point = scenePosition(event);
    const oldItem = decorations[draggingId];

    if (oldItem) {
      roomRef.child("decorations").child(draggingId).set({
        ...oldItem,
        x: point.x,
        y: point.y
      });
    }
  }

  dragElement.classList.remove("dragging");
  dragElement.removeEventListener("pointermove", moveDrag);
  dragElement.removeEventListener("pointerup", endDrag);
  dragElement.removeEventListener("pointercancel", endDrag);

  dragElement = null;
  draggingId = null;
}

function selectTool(type) {
  selectedType = type;
  document.querySelectorAll(".tool").forEach(button => {
    button.classList.toggle("selected", button.dataset.type === type);
  });
}

function selectSide(newSide) {
  side = newSide;
  document.querySelectorAll(".side-btn").forEach(button => {
    button.classList.toggle("selected", button.dataset.side === side);
  });

  const wish = safeText((roomData.wishes || {})[side]);
  $("myWish").value = wish;
  updateCharCount();
}

function updateCharCount() {
  $("charCount").textContent = `${$("myWish").value.length} / 5000`;
}

function saveWish() {
  if (!roomRef || !auth.currentUser) return;

  const value = $("myWish").value.slice(0, 5000);
  $("saveStatus").textContent = "กำลังบันทึก...";

  roomRef.child("wishes").child(side).set(value)
    .then(() => {
      $("saveStatus").textContent = "บันทึกแล้ว อีกฝ่ายเห็นได้แล้ว ♡";
    })
    .catch(error => {
      $("saveStatus").textContent = "บันทึกไม่สำเร็จ";
      console.error(error);
    });
}

function scheduleSaveWish() {
  updateCharCount();
  $("saveStatus").textContent = "กำลังพิมพ์...";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveWish, 500);
}

function renderWishes() {
  const wishes = roomData.wishes || {};
  const ownWish = safeText(wishes[side]);
  const partnerSide = side === "left" ? "right" : "left";
  const partnerWish = safeText(wishes[partnerSide]);

  if (document.activeElement !== $("myWish")) {
    $("myWish").value = ownWish;
  }

  $("partnerWish").textContent = partnerWish || "รอคำอธิษฐานจากอีกฝ่ายอยู่นะ...";
  updateCharCount();
}

function renderReadyStatus() {
  const ready = roomData.ready || {};
  const leftReady = !!ready.left;
  const rightReady = !!ready.right;

  if (leftReady && rightReady) {
    $("readyStatus").textContent = "ทั้งสองคนพร้อมแล้ว กำลังส่งกระทงออกเดินทาง...";
  } else if (leftReady || rightReady) {
    $("readyStatus").textContent = "อีกคนกดตกลงแล้ว รออีกฝ่ายอีกนิดนะ ♡";
  } else {
    $("readyStatus").textContent = "เมื่อตกแต่งและเขียนคำอธิษฐานเสร็จแล้ว กดตกลงได้เลย";
  }

  $("readyBtn").textContent = ready[side]
    ? "ตกลงแล้ว ✓"
    : "ตกลง พร้อมลอยกระทง ♡";
}

function renderFinalWishes() {
  const wishes = roomData.wishes || {};
  $("finalLeftWish").textContent = safeText(wishes.left) || "ไม่ได้เขียนคำอธิษฐานไว้";
  $("finalRightWish").textContent = safeText(wishes.right) || "ไม่ได้เขียนคำอธิษฐานไว้";
}

function createFloatingCraft() {
  const target = $("floatingCraft");
  target.innerHTML = "";

  const clone = $("mainScene").cloneNode(true);
  clone.id = "floatingSceneCraft";
  clone.classList.add("joined");
  clone.querySelectorAll(".decoration").forEach(el => {
    el.style.pointerEvents = "none";
  });

  target.appendChild(clone);
}

function startFloatingAnimation() {
  if (animationStarted) return;
  animationStarted = true;

  $("workArea").hidden = true;
  $("floatingScene").hidden = false;
  $("wishReveal").hidden = true;

  createFloatingCraft();

  setTimeout(() => {
    if (!roomRef) return;
    roomRef.child("phase").set("wishes");
  }, 8200);
}

function showFinalWishes() {
  $("workArea").hidden = true;
  $("floatingScene").hidden = true;
  $("wishReveal").hidden = false;
  renderFinalWishes();
}

function handlePhase(phase) {
  if (phase === "floating") {
    startFloatingAnimation();
  } else if (phase === "wishes") {
    animationStarted = true;
    showFinalWishes();
  } else {
    animationStarted = false;
    $("workArea").hidden = false;
    $("floatingScene").hidden = true;
    $("wishReveal").hidden = true;
    $("mainScene").classList.remove("joined");
  }
}

function updateRoomUI() {
  renderDecorations();
  renderWishes();
  renderReadyStatus();

  const ready = roomData.ready || {};
  if (ready.left && ready.right && roomData.phase !== "floating" && roomData.phase !== "wishes") {
    roomRef.child("phase").set("floating");
  }

  if (roomData.phase === "floating") {
    $("mainScene").classList.add("joined");
  }

  handlePhase(roomData.phase || "editing");
}

function listenToRoom() {
  if (roomRef) roomRef.off();

  roomRef = db.ref(`rooms/${room}`);

  roomRef.on("value", snapshot => {
    roomData = snapshot.val() || {};

    if (!roomData.phase) {
      roomRef.child("phase").set("editing");
      return;
    }

    updateRoomUI();
  }, error => {
    $("connectionStatus").textContent = "เชื่อมต่อห้องไม่สำเร็จ: " + error.message;
  });

  $("connectionStatus").textContent = `เชื่อมต่อห้อง ${room} แล้ว`;
  $("workArea").hidden = false;
}

function joinRoom() {
  const entered = $("roomCode").value.trim().toLowerCase();
  if (!entered) {
    alert("กรุณาใส่รหัสห้องก่อนนะ");
    return;
  }

  room = entered.replace(/[^a-z0-9-_]/g, "-").slice(0, 30);
  $("roomCode").value = room;

  if (!auth.currentUser) {
    $("connectionStatus").textContent = "กำลังเข้าสู่ระบบ...";
    return;
  }

  listenToRoom();
}

function markReady() {
  if (!roomRef || !auth.currentUser) return;

  const readyPath = roomRef.child("ready").child(side);
  const currentlyReady = !!((roomData.ready || {})[side]);

  readyPath.set(!currentlyReady);
}

function setupEvents() {
  $("joinBtn").addEventListener("click", joinRoom);

  document.querySelectorAll(".side-btn").forEach(button => {
    button.addEventListener("click", () => selectSide(button.dataset.side));
  });

  document.querySelectorAll(".tool").forEach(button => {
    button.addEventListener("click", () => selectTool(button.dataset.type));
  });

  $("mainScene").addEventListener("pointerup", addDecoration);
  $("myWish").addEventListener("input", scheduleSaveWish);
  $("readyBtn").addEventListener("click", markReady);
}

auth.signInAnonymously()
  .then(() => {
    $("connectionStatus").textContent = "เข้าสู่ระบบสำเร็จแล้ว";
    setupEvents();
    listenToRoom();
  })
  .catch(error => {
    $("connectionStatus").textContent = "เข้าสู่ระบบไม่สำเร็จ: " + error.message;
    console.error(error);
  });
