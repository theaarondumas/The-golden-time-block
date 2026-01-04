// THE TECHNICIAN — Weekly Discipline
// Tap-to-complete + Mission Mode (simple UI) + Streak Counter
const STORAGE_KEY = "technician_weekly_timeblocks_v2";
const MODE_KEY = "technician_mission_mode_v2";
const STREAK_BEST_KEY = "technician_best_streak_v2";

const CATS = {
  crash: { label: "Crash Cart", badge: "cc", left: "ccL" },
  jkd:   { label: "JKD",        badge: "jkd", left: "jkdL" },
  rt:    { label: "Resistance", badge: "rt", left: "rtL" },
  tech:  { label: "Technician", badge: "tech", left: "techL" },
  work:  { label: "Work",       badge: "work", left: "workL" },
  other: { label: "Other",      badge: "neutral", left: "neutralL" }
};

// Schedule
const SCHEDULE = {
  Mon: [
    { time:"4:15–4:45 AM", title:"Prime Body", focus:"Mobility + breath", cat:"other" },
    { time:"5:00–1:30 PM", title:"Work", focus:"Job + observe hospital workflow", cat:"work" },
    { time:"2:30–3:00 PM", title:"Decompress", focus:"Reset", cat:"other" },
    { time:"3:00–4:45 PM", title:"Crash Cart – Deep Work", focus:"MVP, pilots, docs", cat:"crash" },
    { time:"5:30–7:00 PM", title:"JKD @ Inosanto", focus:"JKD, Kali, economy", cat:"jkd" },
    { time:"7:00–8:00 PM", title:"Drive Home", focus:"Integration time", cat:"other" },
    { time:"8:00–9:00 PM", title:"Resistance Training", focus:"Strength / joints", cat:"rt" },
    { time:"8:30–9:00 PM", title:"Technician (Light)", focus:"Notes / visualization", cat:"tech" },
    { time:"9:30 PM", title:"Sleep", focus:"Non-negotiable", cat:"other" }
  ],
  Tue: [
    { time:"4:15–4:45 AM", title:"Prime Body", focus:"Mobility + breath", cat:"other" },
    { time:"5:00–1:30 PM", title:"Work", focus:"Job", cat:"work" },
    { time:"2:30–3:00 PM", title:"Decompress", focus:"Reset", cat:"other" },
    { time:"3:00–5:00 PM", title:"Crash Cart – Light / Strategy", focus:"Emails, deck, research", cat:"crash" },
    { time:"5:30–6:30 PM", title:"Resistance Training", focus:"Strength / mobility", cat:"rt" },
    { time:"7:30–9:00 PM", title:"Technician – Deep", focus:"Writing, rehearsal, planning", cat:"tech" }
  ],
  Wed: [],
  Thu: [],
  Fri: [],
  Sat: [
    { time:"8:00–9:00 AM", title:"Resistance Training", focus:"Full body", cat:"rt" },
    { time:"10:30–12:30 PM", title:"Technician – Deep", focus:"Scenes, proof-of-concept work", cat:"tech" },
    { time:"3:00–5:00 PM", title:"Crash Cart – Strategy", focus:"Roadmap, pricing, pilots", cat:"crash" }
  ],
  Sun: [
    { time:"Morning", title:"Walk + Journal", focus:"Reset", cat:"other" },
    { time:"60 mins", title:"Weekly Review", focus:"Wins, cuts, adjust next week", cat:"other" },
    { time:"(Optional) 1 hr", title:"Resistance", focus:"Light pump + mobility", cat:"rt" }
  ]
};

// Clone repeating days
SCHEDULE.Wed = structuredClone(SCHEDULE.Mon);
SCHEDULE.Fri = structuredClone(SCHEDULE.Mon);
SCHEDULE.Thu = structuredClone(SCHEDULE.Tue);

// State
let state = loadState();
let selectedDay = dayKeyToday();
let missionMode = loadMissionMode();

// Elements
const tabsEl = document.getElementById("tabs");
const dayViewEl = document.getElementById("dayView");
const totalsEl = document.getElementById("totals");

// Buttons
document.getElementById("btnToday").addEventListener("click", () => {
  selectedDay = dayKeyToday();
  render();
});

document.getElementById("btnMission").addEventListener("click", () => {
  missionMode = !missionMode;
  saveMissionMode(missionMode);
  render();
});

document.getElementById("btnResetDay").addEventListener("click", () => {
  if (!confirm(`Reset completions for ${selectedDay}?`)) return;
  const wk = weekKey();
  state[wk] ??= {};
  state[wk][selectedDay] = {};
  saveState(state);
  render();
});

document.getElementById("btnResetAll").addEventListener("click", () => {
  if (!confirm("Reset ALL completions for this week?")) return;
  state[weekKey()] = {};
  saveState(state);
  render();
});

// ===== Dates =====
function weekKey(date = new Date()){
  // Monday-based week key (UTC)
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - (day - 1));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth()+1).padStart(2,"0");
  const dd = String(d.getUTCDate()).padStart(2,"0");
  return `${y}-${m}-${dd}`;
}

function dayKeyToday(date = new Date()){
  const map = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return map[date.getDay()];
}

// ===== Storage =====
function loadState(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function saveState(s){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}
function loadMissionMode(){
  try { return (localStorage.getItem(MODE_KEY) === "true"); }
  catch { return false; }
}
function saveMissionMode(v){
  localStorage.setItem(MODE_KEY, String(!!v));
}

// ===== Blocks =====
function blockId(day, idx){ return `${day}::${idx}`; }

function isDone(day, idx){
  const wk = weekKey();
  return !!(state?.[wk]?.[day]?.[blockId(day, idx)]);
}

function toggleDone(day, idx){
  const wk = weekKey();
  state[wk] ??= {};
  state[wk][day] ??= {};
  const id = blockId(day, idx);
  state[wk][day][id] = !state[wk][day][id];
  saveState(state);
}

// ===== Streaks =====
function getBestStreak(){
  try { return parseInt(localStorage.getItem(STREAK_BEST_KEY) || "0", 10) || 0; }
  catch { return 0; }
}
function setBestStreak(v){
  localStorage.setItem(STREAK_BEST_KEY, String(v));
}

function isDayCompleteForDate(date){
  const dayKey = dayKeyToday(date);
  const blocks = SCHEDULE[dayKey] || [];
  if (!blocks.length) return false;

  const wk = weekKey(date);
  const dayState = (state?.[wk]?.[dayKey]) || {};
  let doneCount = 0;
  for (let i = 0; i < blocks.length; i++){
    const id = blockId(dayKey, i);
    if (dayState[id]) doneCount++;
  }
  return doneCount === blocks.length;
}

function computeStreak(maxDays = 365){
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < maxDays; i++){
    const check = new Date(d);
    check.setDate(d.getDate() - i);
    if (isDayCompleteForDate(check)) streak++;
    else break;
  }
  return streak;
}

// ===== UI =====
function updateMissionButton(){
  const btn = document.getElementById("btnMission");
  if (!btn) return;
  btn.textContent = missionMode ? "Mission ✓" : "Mission";
}

function renderTabs(){
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  tabsEl.innerHTML = "";
  days.forEach(d => {
    const btn = document.createElement("button");
    btn.className = "tab" + (d === selectedDay ? " active" : "");
    btn.textContent = d + (d === dayKeyToday() ? " •" : "");
    btn.onclick = () => { selectedDay = d; render(); };
    tabsEl.appendChild(btn);
  });
}

function renderTotals(){
  // Best streak updates silently (even though totals may be hidden in mission mode)
  const current = computeStreak();
  const best = getBestStreak();
  if (current > best) setBestStreak(current);

  totalsEl.innerHTML = `
    <div><b>This week (target totals)</b></div>
    <div style="margin-top:6px;">
      🔵 Crash Cart: <b>18–22 hrs</b> &nbsp;|&nbsp;
      🟢 JKD: <b>5–6 hrs</b> &nbsp;|&nbsp;
      🟠 Resistance: <b>6 hrs</b> &nbsp;|&nbsp;
      🟣 Technician: <b>6–8 hrs</b> &nbsp;|&nbsp;
      ⚪ Work: <b>42.5 hrs</b>
    </div>
    <div style="margin-top:6px;">Week starts: <b>${weekKey()}</b></div>
    <div style="margin-top:8px;">🔥 Streak: <b>${computeStreak()}</b> days &nbsp;|&nbsp; 🏆 Best: <b>${getBestStreak()}</b></div>
  `;
}

function renderDay(){
  const blocks = SCHEDULE[selectedDay] || [];
  const doneCount = blocks.reduce((acc, _, i) => acc + (isDone(selectedDay, i) ? 1 : 0), 0);
  const pct = blocks.length ? Math.round((doneCount / blocks.length) * 100) : 0;

  dayViewEl.innerHTML = "";

  const titleRow = document.createElement("div");
  titleRow.className = "dayTitle";
  titleRow.innerHTML = `<h2>${selectedDay}</h2><div class="meta">${doneCount}/${blocks.length} completed • ${pct}%</div>`;
  dayViewEl.appendChild(titleRow);

  blocks.forEach((b, i) => {
    const cat = CATS[b.cat] || CATS.other;
    const row = document.createElement("div");
    row.className = `block ${cat.left} ${isDone(selectedDay,i) ? "done" : ""}`;
    row.innerHTML = `
      <div class="time">${b.time}</div>
      <div class="info">
        <p class="title"><b>${b.title}</b></p>
        <p class="focus">${b.focus || ""}</p>
      </div>
      <div class="badge ${cat.badge}">${cat.label}</div>
    `;
    row.onclick = () => {
      toggleDone(selectedDay, i);
      renderDay();
      renderTotals(); // keep streak updates accurate
    };
    dayViewEl.appendChild(row);
  });
}

function render(){
  document.body.classList.toggle("mission", missionMode);
  updateMissionButton();
  renderTotals();
  renderTabs();
  renderDay();
}

render();
