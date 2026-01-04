// THE TECHNICIAN — Weekly Discipline
// Tap-to-complete + Mission Mode (simple UI) + Streaks + KPI Dashboard + Haptics + Mission Complete
const STORAGE_KEY = "technician_weekly_timeblocks_v4";
const MODE_KEY = "technician_mission_mode_v4";
const STREAK_BEST_KEY = "technician_best_streak_v4";
const KPI_KEY = "technician_kpis_v1";
const ACTIVE_Q_KEY = "technician_active_quarter_v1";

const CATS = {
  crash: { label: "Crash Cart", badge: "cc", left: "ccL" },
  jkd:   { label: "JKD",        badge: "jkd", left: "jkdL" },
  rt:    { label: "Resistance", badge: "rt", left: "rtL" },
  tech:  { label: "Technician", badge: "tech", left: "techL" },
  work:  { label: "Work",       badge: "work", left: "workL" },
  other: { label: "Other",      badge: "neutral", left: "neutralL" }
};

// ===== Schedule =====
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

// ===== KPIs (Quarterly) =====
const KPI_DATA = {
  Q1: {
    crash: [
      "MVP usable end-to-end by 1 real user",
      "Demoable in under 3 minutes",
      "10+ confirmed pain points from real conversations",
      "1 pilot conversation scheduled or completed",
      "Weekly build streak ≥ 10/12 weeks"
    ],
    technician: [
      "Script locked (no structural changes)",
      "Proof-of-concept format chosen",
      "1 concrete asset started (short/teaser/scene)",
      "Voice consistency maintained in scenes",
      "Zero new ideas added (focus discipline)"
    ],
    body: [
      "JKD attendance ≥ 80%",
      "Resistance ≥ 5x/week average",
      "Zero major injuries",
      "Energy stable (no repeated crashes)",
      "Visual presence improving (photos/video)"
    ]
  },
  Q2: {
    crash: [
      "1 live pilot actively used OR LOI OR paid invoice",
      "1 department workflow mapped + validated",
      "Before vs after outcome documented",
      "Onboarding doc written (simple)",
      "Weekly build cadence sustained"
    ],
    technician: [
      "Proof-of-concept finished",
      "Shown to 5–10 trusted peers",
      "2 unsolicited follow-ups received",
      "Feedback includes tone/presence/market",
      "You feel proud showing it"
    ],
    body: [
      "JKD attendance ≥ 80%",
      "Resistance ≥ 5x/week average",
      "No injuries that stop training > 7 days",
      "Recovery improving",
      "Looks/conditioning trending up"
    ]
  },
  Q3: {
    crash: [
      "Pitch works with 2+ departments",
      "Pricing hypothesis stated clearly",
      "Onboarding < 30 minutes",
      "3–5 warm intros identified",
      "One-sentence value statement memorized"
    ],
    technician: [
      "Shown selectively to producers/actors/reps",
      "3 real conversations (not compliments)",
      "Clear audience statement (who it’s for)",
      "No chasing, only responses",
      "Confidence quieter, more grounded"
    ],
    body: [
      "JKD attendance ≥ 80%",
      "Resistance ≥ 5x/week average",
      "Durability maintained (no chronic pain escalation)",
      "Mobility maintained",
      "Presence stronger on camera"
    ]
  },
  Q4: {
    crash: [
      "Monthly revenue OR clear path to it",
      "Second pilot lined up OR expansion path",
      "Time required ≤ 20 hrs/week",
      "Confidence: ‘This funds part of my life’",
      "No burnout symptoms"
    ],
    technician: [
      "At least one door stays open (momentum)",
      "People associate you with a specific tone",
      "Next creative move is crystal clear",
      "No desperation for validation",
      "You want to keep going"
    ],
    body: [
      "JKD attendance ≥ 80%",
      "Resistance ≥ 5x/week average",
      "Injury-free quarter",
      "Energy stable",
      "Photos/video show clear improvement"
    ]
  }
};

// ===== State =====
let state = loadState();
let selectedDay = dayKeyToday();
let missionMode = loadMissionMode();

let kpiState = loadKpis(); // {Q1:{crash:{0:true}, technician:{}, body:{}}, ...}
let activeQuarter = loadActiveQuarter();

// ===== Elements =====
const tabsEl = document.getElementById("tabs");
const dayViewEl = document.getElementById("dayView");
const totalsEl = document.getElementById("totals");

const kpiOverlay = document.getElementById("kpiOverlay");
const kpiQuarterPills = document.getElementById("kpiQuarterPills");
const kpiSummary = document.getElementById("kpiSummary");
const kpiSections = document.getElementById("kpiSections");

// ===== Haptics + Mission Complete =====
function haptic(ms = 20){
  if (navigator.vibrate) navigator.vibrate(ms);
}

function showMissionComplete(){
  const el = document.getElementById("missionComplete");
  if (!el) return;

  el.classList.remove("hidden");
  el.classList.add("show");
  el.setAttribute("aria-hidden", "false");

  // Stronger haptic for the moment
  haptic(60);

  setTimeout(() => {
    el.classList.remove("show");
    el.classList.add("hidden");
    el.setAttribute("aria-hidden", "true");
  }, 1200);
}

// ===== Buttons =====
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

// KPI overlay controls
document.getElementById("btnKPIs").addEventListener("click", () => openKpis());
document.getElementById("btnCloseKPIs").addEventListener("click", () => closeKpis());
document.getElementById("btnResetQuarterKPIs").addEventListener("click", () => {
  if (!confirm(`Reset KPI checkboxes for ${activeQuarter}?`)) return;
  kpiState[activeQuarter] = { crash:{}, technician:{}, body:{} };
  saveKpis(kpiState);
  renderKpis();
});

kpiOverlay.addEventListener("click", (e) => {
  if (e.target === kpiOverlay) closeKpis();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !kpiOverlay.classList.contains("hidden")) closeKpis();
});

// ===== Dates =====
function weekKey(date = new Date()){
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
function saveState(s){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

function loadMissionMode(){
  try { return (localStorage.getItem(MODE_KEY) === "true"); }
  catch { return false; }
}
function saveMissionMode(v){ localStorage.setItem(MODE_KEY, String(!!v)); }

function loadKpis(){
  try { return JSON.parse(localStorage.getItem(KPI_KEY) || "{}"); }
  catch { return {}; }
}
function saveKpis(s){ localStorage.setItem(KPI_KEY, JSON.stringify(s)); }

function loadActiveQuarter(){
  try { return localStorage.getItem(ACTIVE_Q_KEY) || "Q1"; }
  catch { return "Q1"; }
}
function saveActiveQuarter(q){ localStorage.setItem(ACTIVE_Q_KEY, q); }

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
function setBestStreak(v){ localStorage.setItem(STREAK_BEST_KEY, String(v)); }

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
  if (btn) btn.textContent = missionMode ? "Mission ✓" : "Mission";
}

function renderTotals(){
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
      // HAPTIC on every tap
      haptic(18);

      // Toggle completion
      toggleDone(selectedDay, i);

      // Re-render
      renderDay();
      renderTotals();

      // If day is now 100% complete → blast overlay
      const blocksNow = SCHEDULE[selectedDay] || [];
      const doneNow = blocksNow.reduce((acc, _, idx) => acc + (isDone(selectedDay, idx) ? 1 : 0), 0);
      if (blocksNow.length && doneNow === blocksNow.length) {
        showMissionComplete();
      }
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

// ===== KPI Overlay =====
function openKpis(){
  kpiOverlay.classList.remove("hidden");
  renderKpis();
}
function closeKpis(){
  kpiOverlay.classList.add("hidden");
}

function ensureQuarterState(q){
  kpiState[q] ??= { crash:{}, technician:{}, body:{} };
}

function kpiCountsForQuarter(q){
  ensureQuarterState(q);

  const sections = [
    { key:"crash", name:"Crash Cart", items: KPI_DATA[q].crash },
    { key:"technician", name:"The Technician", items: KPI_DATA[q].technician },
    { key:"body", name:"Body / JKD", items: KPI_DATA[q].body }
  ];

  let total = 0, done = 0;
  const perSection = {};

  sections.forEach(sec => {
    const n = sec.items.length;
    total += n;
    let secDone = 0;
    for (let i=0;i<n;i++){
      if (kpiState[q][sec.key]?.[i]) secDone++;
    }
    done += secDone;
    perSection[sec.key] = { done: secDone, total: n };
  });

  return { done, total, perSection };
}

function renderKpis(){
  const quarters = ["Q1","Q2","Q3","Q4"];

  // Pills
  kpiQuarterPills.innerHTML = "";
  quarters.forEach(q => {
    const p = document.createElement("button");
    p.className = "pill" + (q === activeQuarter ? " active" : "");
    p.textContent = q;
    p.onclick = () => {
      activeQuarter = q;
      saveActiveQuarter(q);
      renderKpis();
    };
    kpiQuarterPills.appendChild(p);
  });

  // Summary
  const counts = kpiCountsForQuarter(activeQuarter);
  const pct = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;

  kpiSummary.innerHTML = `
    <div><b>${activeQuarter} Progress:</b> ${counts.done}/${counts.total} complete • <b>${pct}%</b></div>
    <div style="margin-top:6px;">
      🔵 Crash Cart: <b>${counts.perSection.crash.done}/${counts.perSection.crash.total}</b> &nbsp;|&nbsp;
      🟣 Technician: <b>${counts.perSection.technician.done}/${counts.perSection.technician.total}</b> &nbsp;|&nbsp;
      🟠 Body/JKD: <b>${counts.perSection.body.done}/${counts.perSection.body.total}</b>
    </div>
  `;

  // Sections
  ensureQuarterState(activeQuarter);
  kpiSections.innerHTML = "";

  const renderSection = (key, title, items) => {
    const meta = kpiCountsForQuarter(activeQuarter).perSection[key];
    const card = document.createElement("div");
    card.className = "kpiCard";
    card.innerHTML = `
      <div class="kpiCardTitleRow">
        <div class="kpiCardTitle">${title}</div>
        <div class="kpiCardMeta">${meta.done}/${meta.total}</div>
      </div>
    `;

    items.forEach((label, idx) => {
      const row = document.createElement("label");
      row.className = "kpiItem";
      const checked = !!kpiState[activeQuarter][key][idx];

      row.innerHTML = `
        <input type="checkbox" ${checked ? "checked" : ""} />
        <div class="kpiItemLabel">${label}</div>
      `;

      row.querySelector("input").addEventListener("change", (e) => {
        kpiState[activeQuarter][key][idx] = !!e.target.checked;
        saveKpis(kpiState);
        renderKpis();
      });

      card.appendChild(row);
    });

    kpiSections.appendChild(card);
  };

  renderSection("crash", "Crash Cart", KPI_DATA[activeQuarter].crash);
  renderSection("technician", "The Technician", KPI_DATA[activeQuarter].technician);
  renderSection("body", "Body / JKD", KPI_DATA[activeQuarter].body);
}

// Init
render();
