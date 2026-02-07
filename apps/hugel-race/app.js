// Online monster image sources
const monsters = [
  { id: 1, name: "Poring",  url: "https://static.divine-pride.net/images/mobs/png/1002.png" },
  { id: 2, name: "Lunatic", url: "https://static.divine-pride.net/images/mobs/png/1063.png" },
  { id: 3, name: "Savage",  url: "https://static.divine-pride.net/images/mobs/png/1167.png" },
  { id: 4, name: "Wolf",    url: "https://static.divine-pride.net/images/mobs/png/1107.png" },
  { id: 5, name: "Devi",    url: "https://static.divine-pride.net/images/mobs/png/1109.png" },
  { id: 6, name: "Bapho",   url: "https://static.divine-pride.net/images/mobs/png/1101.png" } // Bapho Jr yerine benzer ikon
];
const MONSTER_COUNT = monsters.length;
const JOURNAL_LIST_LIMIT = 20;
const CONFIG_KEY = "hugel_config_v2";
const ENTRY_COST_ZENY = 2000;
const CONFIG_DEFAULTS = {
  entryCount: 12,
  entryCostZeny: ENTRY_COST_ZENY,
  medalsPerWin: 15,
  rewardCostMedals: 25
};
const CHARACTER_COUNT = 19;

let state = {
  language: "en",
  mode: "single",
  bet: [],
  result: [],
  history: [],
  journal: [],
  journalSelected: 0,
  journalErrors: [],
  extraMedals: 0,
  characters: [],
  config: { ...CONFIG_DEFAULTS },
  journalSettings: { thresholdSingle: 2, thresholdPair: 2 },
  streaks: {
    singles: {},
    singlesPairAny: {},
    singlesFirst: {},
    singlesSecond: {},
    missesSingle: {},
    missesPairAny: {},
    pair: { key: null, len: 0 }
  },
  _streakSnapshot: {
    singles: {},
    singlesPairAny: {},
    singlesFirst: {},
    singlesSecond: {},
    missesSingle: {},
    missesPairAny: {},
    pair: { key: null, len: 0 }
  }
};

const translations = {
  en: {
    "nav.main": "Main",
    "nav.characters": "Characters",
    "nav.archive": "Archive",
    "button.undo": "Undo",
    "step.bet": "1. BET SELECTION",
    "step.result": "2. RACE RESULT",
    "button.process": "Process Data",
    "status.waiting": "Waiting for bet...",
    "status.enterResults": "Bet: {bet} (Enter results)",
    "status.result": "Bet: {bet} -> Result: {result}",
    "panel.cash": "Cash Status",
    "label.totalMedals": "TOTAL MEDALS",
    "label.spent": "TOTAL SPEND",
    "label.winRate": "WIN RATE",
    "label.rewardCount": "REWARD COUNT",
    "label.totalEarnedMedals": "TOTAL EARNED MEDALS",
    "panel.manualMedals": "Manual Medals",
    "button.add": "Add",
    "label.totalManual": "Manual Total",
    "button.reset": "Reset",
    "alert.raw": "IMPORTANT: NO RAW FOR A LONG TIME!",
    "panel.heatmap": "Win Frequency",
    "panel.settings": "Advanced Settings",
    "panel.phenomenon": "🔥 Phenomena (Rarest Evidence)",
    "panel.topPairsToday": "Top 6 Pairs Today",
    "panel.todaySummary": "Today's Summary",
    "label.todayWins": "Wins Today",
    "label.todayMedals": "Medals Today",
    "label.todayRewards": "Rewards Today",
    "panel.characters": "Characters",
    "panel.charactersSummary": "Character Summary",
    "panel.charactersInfo": "Info",
    "panel.rewardSpend": "Spend Medals",
    "panel.charactersManage": "Manage Characters",
    "button.addCharacter": "+ Add Character",
    "label.characterName": "Name",
    "label.characterMedals": "Medals",
    "label.characterZeny": "Zeny",
    "label.characterRewards": "Rewards",
    "label.characterCount": "Character Count",
    "label.totalCharacterMedals": "Total Medals",
    "label.totalCharacterZeny": "Total Zeny",
    "text.characterHint": "Entry fee is deducted each race; on win, medals are added per character.",
    "text.spendRewardsHint": "Spends medals equal to available rewards per character; leftover remainder stays.",
    "modal.addCharacterTitle": "New Character",
    "modal.addCharacterHint": "Enter details and add.",
    "button.cancel": "Cancel",
    "button.save": "Save",
    "button.removeCharacter": "Remove",
    "confirm.removeCharacter": "Remove this character?",
    "button.spendRewards": "Spend Rewards",
    "label.entryCount": "Characters this run",
    "label.entryCostFixed": "Entry cost (per character)",
    "label.medalsPerWin": "Medals per win",
    "label.medalsPerWinTotal": "Total gain (win)",
    "label.rewardCostMedals": "Medals needed per reward",
    "label.entrySummary": "Entry Summary",
    "label.status": "Status",
    "label.totalRounds": "Total Rounds",
    "label.totalWins": "Total Wins",
    "label.totalLosses": "Total Losses",
    "button.resetAll": "RESET",
    "panel.archiveControl": "Archive Control",
    "button.compute": "Rebuild",
    "button.list": "List",
    "button.importHistory": "Import History (JSON)",
    "button.downloadCsv": "Download Archive (CSV)",
    "button.downloadJson": "Download Archive (JSON)",
    "button.copyJson": "Copy JSON",
    "button.clearArchive": "Clear Archive",
    "panel.errorLog": "Error Log",
    "text.noErrors": "No errors yet.",
    "panel.allRecords": "Last 20 Records",
    "label.total": "Total",
    "label.len": "Length",
    "label.type": "TYPE",
    "label.mode": "MODE",
    "text.noRecords": "No records yet.",
    "panel.last20": "Last 20 Races",
    "panel.selected": "Selected Record",
    "panel.summary": "Summary",
    "panel.streaksProb": "Streaks & Odds",
    "text.noActiveStreak": "No active streaks.",
    "panel.topProb": "Top 3 Lowest Odds",
    "panel.top3": "Top 3 Luckiest Streaks",
    "panel.dailyStats": "Daily Play Summary",
    "error.label": "Error",
    "text.noEntry": "No record.",
    "text.noData": "No data.",
    "text.noEnd": "No END yet.",
    "text.noProb": "No data.",
    "text.noPhenomenon": "No phenomena yet.",
    "text.noTopPairs": "No records today.",
    "text.noDailyStats": "No daily records yet.",
    "summary.title": "Archive Summary",
    "journal.round": "Round entry",
    "label.winFrequencySnapshot": "Win Frequency (snapshot)",
    "label.roundsShort": "Rounds",
    "label.winsShort": "Wins",
    "label.lossesShort": "Losses",
    "confirm.clearArchive": "Do you want to clear the archive?",
    "confirm.resetAll": "Reset all history and archive?",
    "error.archiveEmpty": "Archive not created: history exists but archive is empty.",
    "error.archiveRebuildEmpty": "Archive rebuilt but no entries were produced.",
    "error.importInvalid": "Import failed: no valid history found.",
    "status.win": "WIN ✅ Round processed.",
    "status.lose": "LOSE ❌ Round processed.",
    "validation.singleBet": "Single mode: select 1 bet.",
    "validation.doubleBet": "Double mode: select 2 bets.",
    "validation.doubleSame": "Double mode: bets cannot be the same.",
    "validation.resultOne": "Single mode: select 1 winner in the result.",
    "validation.resultTwo": "Select 2 winners in the result.",
    "validation.resultSame": "Result cannot contain the same monster twice."
  }
};

function buildDefaultCharacters() {
  return Array.from({ length: CHARACTER_COUNT }, (_, i) => ({
    id: i + 1,
    name: "",
    medals: 0,
    zeny: 0
  }));
}

function normalizeCharacters(input) {
  const list = Array.isArray(input) ? input : [];
  const next = list.map((item, idx) => {
    const raw = item && typeof item === "object" ? item : {};
    const medals = parseInt(raw.medals, 10);
    const zeny = parseInt(raw.zeny, 10);
    return {
      id: idx + 1,
      name: String(raw.name ?? ""),
      medals: Number.isFinite(medals) ? Math.max(0, medals) : 0,
      zeny: Number.isFinite(zeny) ? Math.max(0, zeny) : 0
    };
  });
  while (next.length < CHARACTER_COUNT) {
    next.push({
      id: next.length + 1,
      name: "",
      medals: 0,
      zeny: 0
    });
  }
  return next;
}

function ensureCharacters() {
  if (!Array.isArray(state.characters) || !state.characters.length) {
    state.characters = buildDefaultCharacters();
  } else {
    state.characters = normalizeCharacters(state.characters);
  }
  return state.characters;
}

function getCharacterCount() {
  return ensureCharacters().length;
}

function getCharacterTotals() {
  const list = ensureCharacters();
  return list.reduce((acc, c) => {
    acc.medals += c.medals || 0;
    acc.zeny += c.zeny || 0;
    return acc;
  }, { medals: 0, zeny: 0 });
}

function t(key, vars = {}) {
  let value = translations.en[key] || key;
  Object.entries(vars).forEach(([k, v]) => {
    value = value.replaceAll(`{${k}}`, v);
  });
  return value;
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });
}

function setLanguage() {
  state.language = "en";
  applyTranslations();
  render();
  renderCharactersPage();
  renderJournal();
  updateStats();
  renderJournalErrors();
}

const LS_KEYS = ["prob_hugel_state_v2", "prob_hugel_state", "prob_hugel_state_v1"];

function normalizeConfig(input = {}) {
  const base = { ...CONFIG_DEFAULTS };
  const toInt = (value, fallback) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  return {
    entryCount: Math.max(1, toInt(input.entryCount ?? input.analysisWindowRounds, base.entryCount)),
    entryCostZeny: ENTRY_COST_ZENY,
    medalsPerWin: Math.max(1, toInt(input.medalsPerWin ?? input.medalsPerReward ?? input.medalReward, base.medalsPerWin)),
    rewardCostMedals: Math.max(1, toInt(input.rewardCostMedals ?? input.rewardValue ?? input.prizeCost, base.rewardCostMedals))
  };
}

function loadLegacyConfig() {
  const legacyKeys = ["hugel_config", "prob_hugel_config", "prob_hugel_settings"];
  for (const key of legacyKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {}
  }
  for (const key of LS_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const mapped = {
          entryCount: parsed.entryCount ?? parsed.analysisWindowRounds ?? parsed.charCount,
          entryCostZeny: parsed.entryCostZeny ?? parsed.ticketCost,
          medalsPerWin: parsed.medalsPerWin ?? parsed.medalReward ?? parsed.medalsPerReward,
          rewardCostMedals: parsed.rewardCostMedals ?? parsed.rewardValue ?? parsed.prizeCost
        };
        if (Object.values(mapped).some(v => v != null)) return mapped;
      }
    } catch {}
  }
  return null;
}

function saveConfig() {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(state.config));
  } catch (err) {
    console.warn("Config not saved:", err);
  }
}

function loadConfig() {
  let config = null;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) config = JSON.parse(raw);
  } catch {}
  if (!config) config = loadLegacyConfig();
  state.config = normalizeConfig(config || CONFIG_DEFAULTS);
  saveConfig();
}

function setConfig(patch = {}) {
  state.config = normalizeConfig({ ...state.config, ...patch });
  saveConfig();
  renderSettingsInputs();
  updateStats();
}

function handleConfigInput(field, rawValue) {
  if (!field) return;
  const parsed = parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    renderSettingsInputs();
    return;
  }
  setConfig({ [field]: parsed });
}

function resetConfig() {
  state.config = { ...CONFIG_DEFAULTS };
  saveConfig();
  renderSettingsInputs();
  updateStats();
  renderJournal();
}

window.addEventListener("DOMContentLoaded", () => {
  bindUiActions();
  loadConfig();
  loadState();
  state.language = "en";
  if (state.history.length && (!Array.isArray(state.journal) || !state.journal.length)) {
    rebuildJournalFromHistory();
    saveState();
  }
  if (state.history.length && (!Array.isArray(state.journal) || !state.journal.length)) {
    logJournalError(t("error.archiveEmpty"), {
      historyCount: state.history.length
    });
  }
  const hashPage =
    location.hash === "#journal" ? "journal" :
    (location.hash === "#characters" ? "characters" :
    (location.hash === "#main" ? "main" : null));
  const lastPage = hashPage || localStorage.getItem("prob_hugel_last_page") || "main";

  showPage(lastPage);
  applyTranslations();
  render();
  renderCharactersPage();
  updateStats();
  renderJournal();
  renderJournalErrors();
});

let uiActionsBound = false;
function bindUiActions() {
  if (uiActionsBound) return;
  uiActionsBound = true;
  const singleBtn = document.getElementById("btn-single");
  const doubleBtn = document.getElementById("btn-double");
  if (singleBtn) singleBtn.addEventListener("click", () => setMode("single"));
  if (doubleBtn) doubleBtn.addEventListener("click", () => setMode("double"));
}

function showPage(target) {
  const main = document.getElementById("page-main");
  const characters = document.getElementById("page-characters");
  const journal = document.getElementById("page-journal");
  const navMain = document.getElementById("nav-main");
  const navCharacters = document.getElementById("nav-characters");
  const navJournal = document.getElementById("nav-journal");
  if (!main || !characters || !journal || !navMain || !navCharacters || !navJournal) return;

  const isMain = target === "main";
  const isCharacters = target === "characters";
  const isJournal = target === "journal";
  main.classList.toggle("active", isMain);
  characters.classList.toggle("active", isCharacters);
  journal.classList.toggle("active", isJournal);
  navMain.classList.toggle("active", isMain);
  navCharacters.classList.toggle("active", isCharacters);
  navJournal.classList.toggle("active", isJournal);

  const newHash = isJournal ? "#journal" : (isCharacters ? "#characters" : "#main");
  if (location.hash !== newHash) location.hash = newHash;

  try { localStorage.setItem("prob_hugel_last_page", isJournal ? "journal" : (isCharacters ? "characters" : "main")); }
  catch (err) { console.warn("Page state not persisted:", err); }

  if (isCharacters) renderCharactersPage();
  if (isJournal) renderJournal();
}

function syncModeButtons() {
  const singleBtn = document.getElementById("btn-single");
  const doubleBtn = document.getElementById("btn-double");
  if (!singleBtn || !doubleBtn) return;
  singleBtn.className = state.mode === "single" ? "mode-btn active" : "mode-btn";
  doubleBtn.className = state.mode === "double" ? "mode-btn active" : "mode-btn";
}

function getEffectiveMode() {
  const singleBtn = document.getElementById("btn-single");
  const doubleBtn = document.getElementById("btn-double");
  const singleActive = !!singleBtn?.classList.contains("active");
  const doubleActive = !!doubleBtn?.classList.contains("active");

  if (singleActive && !doubleActive) return "single";
  if (doubleActive && !singleActive) return "double";

  // Fallback when button state is missing/ambiguous.
  if (Array.isArray(state.bet)) {
    if (state.bet.length >= 2) return "double";
    if (state.bet.length === 1) return "single";
  }
  return state.mode === "double" ? "double" : "single";
}

function setMode(m) {
  state.mode = m === "double" ? "double" : "single";
  state.bet = [];
  state.result = [];
  syncModeButtons();
  saveState();
  render();
}

function sanitizeSelections() {
  state.mode = getEffectiveMode();
  const validIds = new Set(monsters.map(m => m.id));
  const fixArr = (arr, limit) => (Array.isArray(arr) ? arr : [])
    .map(v => parseInt(v, 10))
    .filter(v => validIds.has(v))
    .slice(0, limit);

  state.bet = fixArr(state.bet, state.mode === "single" ? 1 : 2);
  state.result = fixArr(state.result, state.mode === "single" ? 1 : 2);
}

function toggleBet(id) {
  id = parseInt(id, 10);
  const mode = getEffectiveMode();
  const limit = mode === "single" ? 1 : 2;

  if (state.bet.includes(id)) state.bet = state.bet.filter(x => x !== id);
  else {
    if (state.bet.length < limit) state.bet.push(id);
    else if (mode === "single") state.bet = [id];
  }
  render();
}

function toggleRes(id) {
  id = parseInt(id, 10);
  const mode = getEffectiveMode();
  const limit = mode === "single" ? 1 : 2;
  if (state.result.includes(id)) state.result = state.result.filter(x => x !== id);
  else if (state.result.length < limit) state.result.push(id);
  else if (mode === "single") state.result = [id];
  render();
}

function renderSettingsInputs() {
  const cfg = state.config || CONFIG_DEFAULTS;
  const map = {
    entryCount: "entryCount",
    medalsPerWin: "medalsPerWin",
    rewardCostMedals: "rewardCostMedals"
  };
  Object.entries(map).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (key === "entryCount") {
      const nextValue = getCharacterCount();
      if (el.value !== String(nextValue)) el.value = String(nextValue);
      el.readOnly = true;
      return;
    }
    const nextValue = cfg[key];
    if (el.value !== String(nextValue)) el.value = String(nextValue);
  });
}

function render() {
  state.mode = getEffectiveMode();
  syncModeButtons();
  sanitizeSelections();
  renderSettingsInputs();

  // Bet Grid
  document.getElementById("bet-grid").innerHTML = monsters.map(m => {
    const isSel = state.bet.includes(m.id);
    return `<div class="card ${isSel ? "selected" : ""}" onclick="toggleBet(${m.id})">
      <span class="card-id">#${m.id}</span>
      <img src="${m.url}">
      <span class="card-name">${escapeHtml(m.name)}</span>
    </div>`;
  }).join("");

  // Result Grid
  document.getElementById("res-grid").innerHTML = monsters.map(m => {
    let cls = "", badge = "";
    if (state.result[0] === m.id) { cls = "winner-1"; badge = `<div class="badge" style="background:#f59e0b">1.</div>`; }
    else if (state.result[1] === m.id) { cls = "winner-2"; badge = `<div class="badge" style="background:#fff">2.</div>`; }

    return `<div class="card ${cls}" onclick="toggleRes(${m.id})">
      <span class="card-id">#${m.id}</span> ${badge}
      <img src="${m.url}" style="opacity:${cls ? 1 : 0.3}">
      <span class="card-name">${escapeHtml(m.name)}</span>
    </div>`;
  }).join("");

  const bNames = state.bet.map(i => (getMonsterById(i) || {}).name).filter(Boolean).join(" & ");
  const rNames = state.result.map(i => (getMonsterById(i) || {}).name).filter(Boolean).join(", ");
  const status = document.getElementById("status-text");
  if (!status) return;
  const requiredResults = state.mode === "single" ? 1 : 2;

  if (!state.bet.length) status.innerText = t("status.waiting");
  else if (state.result.length < requiredResults) {
    status.innerHTML = t("status.enterResults", {
      bet: `<b style="color:#fff">${escapeHtml(bNames)}</b>`
    });
  } else {
    status.innerHTML = t("status.result", {
      bet: `<b>${escapeHtml(bNames)}</b>`,
      result: `<b style="color:var(--kick-green)">${escapeHtml(rNames)}</b>`
    });
  }
}

function renderCharactersPage() {
  const grid = document.getElementById("character-grid");
  if (!grid) return;

  const list = ensureCharacters();
  const namePlaceholder = "Character";
  const cfg = normalizeConfig(state.config || CONFIG_DEFAULTS);
  const rewardCostMedals = clampInt(cfg.rewardCostMedals, 1, 999999);

  const cards = list.map((c, idx) => {
    const medals = Number.isFinite(c.medals) ? c.medals : 0;
    const rewards = Math.floor((medals || 0) / rewardCostMedals);
    const removeLabel = escapeHtml(t("button.removeCharacter"));
    return `
      <div class="character-card">
        <div class="character-card-top">
          <div class="character-badge">#${idx + 1}</div>
          <div class="character-name-wrap">
            <input class="character-input name" type="text" placeholder="${namePlaceholder} ${idx + 1}"
              value="${escapeHtml(c.name || "")}" oninput="handleCharacterInput(${idx}, 'name', this.value)">
            <div class="character-sub">${escapeHtml(t("label.characterRewards"))}: <b>${fmtNum(rewards)}</b></div>
          </div>
          <button class="character-remove-btn" type="button" title="${removeLabel}" onclick="removeCharacter(${idx})">${removeLabel}</button>
        </div>
        <div class="character-card-metrics">
          <label>
            <span>${escapeHtml(t("label.characterMedals"))}</span>
            <input class="character-input" type="number" min="0" value="${escapeHtml(c.medals ?? 0)}"
              oninput="handleCharacterInput(${idx}, 'medals', this.value)">
          </label>
          <label>
            <span>${escapeHtml(t("label.characterZeny"))}</span>
            <input class="character-input" type="number" min="0" value="${escapeHtml(c.zeny ?? 0)}"
              oninput="handleCharacterInput(${idx}, 'zeny', this.value)">
          </label>
        </div>
      </div>
    `;
  }).join("");
  grid.innerHTML = cards;

  renderCharactersSummaryInfo();
}

function removeCharacter(index) {
  const list = ensureCharacters();
  if (!list.length || index < 0 || index >= list.length) return;
  const confirmText = t("confirm.removeCharacter");
  if (confirmText && !window.confirm(confirmText)) return;

  if (list.length > CHARACTER_COUNT) {
    list.splice(index, 1);
  } else {
    list[index] = { id: index + 1, name: "", medals: 0, zeny: 0 };
  }

  state.characters = list.map((c, i) => ({
    id: i + 1,
    name: String(c?.name ?? ""),
    medals: Number.isFinite(parseInt(c?.medals, 10)) ? Math.max(0, parseInt(c.medals, 10)) : 0,
    zeny: Number.isFinite(parseInt(c?.zeny, 10)) ? Math.max(0, parseInt(c.zeny, 10)) : 0
  }));
  saveState();
  renderCharactersPage();
  renderCharactersSummaryInfo();
  updateStats();
}

function handleCharacterInput(index, field, rawValue) {
  const list = ensureCharacters();
  const target = list[index];
  if (!target) return;
  if (field === "name") {
    target.name = String(rawValue ?? "");
  } else if (field === "medals") {
    const v = parseInt(rawValue, 10);
    target.medals = Number.isFinite(v) ? Math.max(0, v) : 0;
  } else if (field === "zeny") {
    const v = parseInt(rawValue, 10);
    target.zeny = Number.isFinite(v) ? Math.max(0, v) : 0;
  }
  saveState();
  updateStats();
}

function openAddCharacterModal() {
  const modal = document.getElementById("character-add-modal");
  if (!modal) return;
  const nameInput = document.getElementById("character-add-name");
  const medalInput = document.getElementById("character-add-medals");
  const zenyInput = document.getElementById("character-add-zeny");
  if (nameInput) nameInput.value = "";
  if (medalInput) medalInput.value = "0";
  if (zenyInput) zenyInput.value = "0";
  modal.classList.add("active");
}

function closeAddCharacterModal() {
  const modal = document.getElementById("character-add-modal");
  if (!modal) return;
  modal.classList.remove("active");
}

function submitAddCharacter() {
  const nameInput = document.getElementById("character-add-name");
  const medalInput = document.getElementById("character-add-medals");
  const zenyInput = document.getElementById("character-add-zeny");
  const name = String(nameInput?.value ?? "").trim();
  const medals = parseInt(medalInput?.value ?? "0", 10);
  const zeny = parseInt(zenyInput?.value ?? "0", 10);

  const list = ensureCharacters();
  list.push({
    id: list.length + 1,
    name,
    medals: Number.isFinite(medals) ? Math.max(0, medals) : 0,
    zeny: Number.isFinite(zeny) ? Math.max(0, zeny) : 0
  });
  state.characters = list;
  saveState();
  renderCharactersPage();
  renderCharactersSummaryInfo();
  updateStats();
  closeAddCharacterModal();
}

function renderCharactersSummaryInfo() {
  const summary = document.getElementById("character-summary");
  const info = document.getElementById("character-info");
  if (!summary && !info) return;

  const list = ensureCharacters();
  const totals = getCharacterTotals();
  const cfg = normalizeConfig(state.config || CONFIG_DEFAULTS);
  const medalsPerWin = clampInt(cfg.medalsPerWin, 1, 999999);
  const entryCostZeny = ENTRY_COST_ZENY;
  const winTotal = medalsPerWin * list.length;

  if (summary) {
    summary.innerHTML = `
      <div class="character-summary-row">
        <span>${escapeHtml(t("label.characterCount"))}</span>
        <b>${fmtNum(list.length)}</b>
      </div>
      <div class="character-summary-row">
        <span>${escapeHtml(t("label.totalCharacterMedals"))}</span>
        <b>${fmtNum(totals.medals)}</b>
      </div>
      <div class="character-summary-row">
        <span>${escapeHtml(t("label.totalCharacterZeny"))}</span>
        <b>${fmtNum(totals.zeny)}z</b>
      </div>
    `;
  }

  if (info) {
    info.innerHTML = `
      <div>${escapeHtml(t("label.entryCostFixed"))}: <b>${fmtNum(entryCostZeny)}z</b></div>
      <div>${escapeHtml(t("label.medalsPerWin"))}: <b>${fmtNum(medalsPerWin)}</b></div>
      <div>${escapeHtml(t("label.medalsPerWinTotal"))}: <b>${fmtNum(winTotal)}</b></div>
      <div>${escapeHtml(t("text.characterHint"))}</div>
    `;
  }
}

function applyCharacterDeltas(medalDelta, zenyDelta) {
  const list = ensureCharacters();
  if (!list.length) return;
  list.forEach(c => {
    const medals = parseInt(c.medals, 10) || 0;
    const zeny = parseInt(c.zeny, 10) || 0;
    c.medals = Math.max(0, medals + medalDelta);
    c.zeny = Math.max(0, zeny + zenyDelta);
  });
}

function spendRewardsFromCharacters() {
  const cfg = normalizeConfig(state.config || CONFIG_DEFAULTS);
  const rewardCostMedals = clampInt(cfg.rewardCostMedals, 1, 999999);
  const list = ensureCharacters();
  if (!list.length) return;
  list.forEach(c => {
    const medals = parseInt(c.medals, 10) || 0;
    const rewards = Math.floor(Math.max(0, medals) / rewardCostMedals);
    const spent = rewards * rewardCostMedals;
    c.medals = Math.max(0, medals - spent);
  });
  saveState();
  renderCharactersPage();
  updateStats();
}

// ---------- STREAK / PROB ----------
function normalizeStreakState(input) {
  const base = input || {};
  return {
    config: normalizeConfig(base.config || state.config || CONFIG_DEFAULTS),
    singles: base.singles || {},
    singlesPairAny: base.singlesPairAny || base.singles || {},
    singlesFirst: base.singlesFirst || {},
    singlesSecond: base.singlesSecond || {},
    missesSingle: base.missesSingle || {},
    missesPairAny: base.missesPairAny || {},
    pair: base.pair || { key: base.pairKey || null, len: base.pairLen || 0 }
  };
}

function snapshotWithCompat(curr) {
  return {
    config: normalizeConfig(curr.config || state.config || CONFIG_DEFAULTS),
    singles: curr.singles || {},
    singlesPairAny: curr.singlesPairAny || {},
    singlesFirst: curr.singlesFirst || {},
    singlesSecond: curr.singlesSecond || {},
    missesSingle: curr.missesSingle || {},
    missesPairAny: curr.missesPairAny || {},
    pair: curr.pair || { key: null, len: 0 }
  };
}

function computeCurrentStreakState(history, monstersList) {
  const singles = {};
  const singlesPairAny = {};
  const singlesFirst = {};
  const singlesSecond = {};
  const missesSingle = {};
  const missesPairAny = {};
  monstersList.forEach(m => {
    const id = m.id;
    let sAny = 0;
    let sPairAny = 0;
    let sFirst = 0;
    let sSecond = 0;
    let missSingle = 0;
    let missPairAny = 0;
    for (let i = 0; i < history.length; i++) {
      const round = history[i];
      const res = Array.isArray(round?.result) ? round.result : [];
      if (res.includes(id)) sAny++;
      else break;
    }
    for (let i = 0; i < history.length; i++) {
      const round = history[i];
      const res = Array.isArray(round?.result) ? round.result : [];
      if (round?.mode === "double" && res.includes(id)) sPairAny++;
      else break;
    }
    for (let i = 0; i < history.length; i++) {
      const round = history[i];
      const res = Array.isArray(round?.result) ? round.result : [];
      if (round?.mode === "double" && res[0] === id) sFirst++;
      else break;
    }
    for (let i = 0; i < history.length; i++) {
      const round = history[i];
      const res = Array.isArray(round?.result) ? round.result : [];
      if (round?.mode === "double" && res[1] === id && res[0] !== id) sSecond++;
      else break;
    }
    for (let i = 0; i < history.length; i++) {
      const round = history[i];
      const res = Array.isArray(round?.result) ? round.result : [];
      if (round?.mode !== "single") continue;
      if (res[0] !== id) missSingle++;
      else break;
    }
    for (let i = 0; i < history.length; i++) {
      const round = history[i];
      const res = Array.isArray(round?.result) ? round.result : [];
      if (round?.mode !== "double") continue;
      if (!res.includes(id)) missPairAny++;
      else break;
    }
    singles[id] = sAny;
    singlesPairAny[id] = sPairAny;
    singlesFirst[id] = sFirst;
    singlesSecond[id] = sSecond;
    missesSingle[id] = missSingle;
    missesPairAny[id] = missPairAny;
  });

  let pairKey = null;
  let pairLen = 0;
  if (history.length && Array.isArray(history[0]?.result)) {
    const getKey = (h) => (Array.isArray(h?.result) ? h.result : []).slice(0, 2).join("-");
    pairKey = getKey(history[0]) || null;
    if (pairKey) {
      for (let i = 0; i < history.length; i++) {
        if (getKey(history[i]) === pairKey) pairLen++;
        else break;
      }
    }
  }

  return {
    singles,
    singlesPairAny,
    singlesFirst,
    singlesSecond,
    missesSingle,
    missesPairAny,
    pair: { key: pairKey, len: pairLen }
  };
}

function formatPercent(probability) {
  if (!probability || probability <= 0) return "0.00";
  const pct = probability * 100;
  return pct.toFixed(pct >= 1 ? 2 : 3);
}

function formatScientific(probability) {
  if (!probability || probability <= 0) return "0";
  const [mantissa, exp] = probability.toExponential(2).split("e");
  const expNum = Number(exp);
  return `${mantissa}×10^${expNum}`;
}

function formatOddsDenominator(probability) {
  if (!probability || probability <= 0) return "-";
  const oddsIn = 1 / probability;
  return `≈ ${oddsIn.toFixed(2)}'te 1`;
}

function resolveEventType(entry) {
  if (entry?.eventType) return entry.eventType;
  if (entry?.streakType) return entry.streakType;
  if (Array.isArray(entry?.keys) && entry.keys.length === 2) return "PAIR";
  if (typeof entry?.subjectKey === "string" && entry.subjectKey.includes("-")) return "PAIR";
  return "SINGLE";
}

function resolveEntryPhase(entry) {
  return entry?.phase || entry?.type || "ROUND";
}

function resolveEntryModel(entry, phase, length) {
  if (phase === "END" || phase === "END_MISS") return "META";
  if (phase === "EXTEND" || length > 1) return "CHAIN";
  if (entry?.model) return entry.model;
  if (phase === "ROUND") return null;
  return "BASE";
}

function normalizeEntry(entry) {
  const phase = resolveEntryPhase(entry);
  const eventType = resolveEventType(entry);
  let length = entry?.length || entry?.len || 1;
  let model = resolveEntryModel(entry, phase, length);
  if (model === "BASE") length = 1;
  if (length > 1) model = "CHAIN";
  if (phase === "EXTEND") model = "CHAIN";
  if (phase === "END" || phase === "END_MISS") {
    model = "META";
    length = 1;
  }
  let keys = Array.isArray(entry?.keys) ? entry.keys : [];
  if (!keys.length && typeof entry?.subjectKey === "string") {
    keys = entry.subjectKey.split("-").filter(Boolean);
  }
  if (!keys.length && eventType === "SINGLE" && entry?.subjectKey) {
    keys = [String(entry.subjectKey)];
  }
  keys = keys.map(key => Number(key)).filter(Number.isFinite);
  const probability = entry?.probability;
  let odds = entry?.odds;
  if (!odds && entry?.oddsDenominator) {
    odds = typeof entry.oddsDenominator === "object"
      ? entry.oddsDenominator
      : { num: 1, den: entry.oddsDenominator };
  }
  let context = entry?.context ?? null;
  if (context?.mode && !context.roundType) {
    context = {
      ...context,
      roundType: context.mode === "PAIR" ? "PAIR" : "SINGLE",
      slotsPerRound: context.slotsPerRound ?? context.slots ?? (context.mode === "PAIR" ? 2 : 1),
      targetKey: context.targetKey ?? (context.target ? Number(context.target) : null),
      note: context.note || context.mode
    };
  }
  if (context && context.slots != null && context.slotsPerRound == null) {
    context = { ...context, slotsPerRound: context.slots };
  }
  if (context && !context.kind) {
    context = { ...context, kind: "HIT" };
  }
  if (context && eventType === "PAIR" && !context.mode) {
    context = { ...context, mode: "PAIR_ORDERED" };
  }
  if (context?.hit && !context.mode) {
    const hitToMode = { FIRST: "FIRST", SECOND: "SECOND", ANY: "ANY", MISS: "ANY" };
    context = { ...context, mode: hitToMode[context.hit] || context.hit };
  }
  if (context?.roundType === "PAIR" && !context.mode && eventType === "SINGLE") {
    context = { ...context, mode: "ANY" };
  }
  if (context?.kind === "MISS" && !context.mode) {
    context = { ...context, mode: "ANY" };
  }
  const difficulty = entry?.difficulty;
  return {
    ...entry,
    phase,
    eventType,
    model,
    length,
    keys,
    context,
    probability,
    odds,
    difficulty
  };
}

function computeStepProbability(event, N) {
  const safeN = Math.max(1, Number(N) || 1);
  const normalized = normalizeEntry(event);
  const eventType = normalized.eventType;
  const phase = normalized.phase;
  const mode = normalized.context?.mode || "BASE";
  const kind = normalized.context?.kind || "HIT";
  if (!normalized.model || phase === "ROUND" || normalized.model === "META") {
    return { probability: null, odds: null };
  }

  if (kind === "MISS") {
    if (normalized.context?.roundType === "PAIR") {
      const den = safeN * safeN;
      const num = mode === "FIRST" ? (safeN - 1) * safeN : Math.pow(safeN - 1, 2);
      return { probability: num / den, odds: { num, den } };
    }
    const den = safeN;
    const num = safeN - 1;
    return { probability: num / den, odds: { num, den } };
  }

  const stepModel = normalized.model === "CHAIN"
    ? (normalized.stepModel || (normalized.context?.roundType === "PAIR" && eventType === "SINGLE" && mode !== "FIRST" ? "CONDITIONAL" : "BASE"))
    : normalized.model;

  if (stepModel === "BASE") {
    if (eventType === "SINGLE") {
      return { probability: 1 / safeN, odds: { num: 1, den: safeN } };
    }
    if (eventType === "PAIR") {
      const den = safeN * safeN;
      return { probability: 1 / den, odds: { num: 1, den } };
    }
  }

  if (stepModel === "CONDITIONAL") {
    if (eventType === "SINGLE") {
      if (normalized.context?.roundType === "PAIR" && mode === "FIRST") {
        return { probability: 1 / safeN, odds: { num: 1, den: safeN } };
      }
      if (normalized.context?.roundType === "PAIR" && mode === "SECOND") {
        const den = safeN * safeN;
        const num = safeN - 1;
        return { probability: num / den, odds: { num, den } };
      }
      const den = safeN * safeN;
      const num = (2 * safeN - 1);
      return { probability: num / den, odds: { num, den } };
    }
    if (eventType === "PAIR") {
      const den = safeN * safeN;
      return { probability: 1 / den, odds: { num: 1, den } };
    }
  }

  return { probability: null, odds: null };
}

function computeProbability(event, N) {
  const normalized = normalizeEntry(event);
  const length = Math.max(1, Number(normalized.length) || 1);
  const step = computeStepProbability(normalized, N);
  if (step.probability == null) {
    return { probability: null, odds: null, difficulty: null };
  }
  const probability = normalized.model === "CHAIN"
    ? Math.pow(step.probability, length)
    : step.probability;
  const odds = step.odds
    ? {
      num: Math.pow(step.odds.num, normalized.model === "CHAIN" ? length : 1),
      den: Math.pow(step.odds.den, normalized.model === "CHAIN" ? length : 1)
    }
    : null;
  const difficulty = probability ? -Math.log10(probability) : null;
  return { probability, odds, difficulty };
}

function buildProbabilityInfo(entry, N) {
  const normalized = normalizeEntry(entry);
  if (normalized.phase === "START_MISS" || normalized.phase === "END_MISS" || normalized.model === "META") {
    return {
      probability: null,
      odds: null,
      difficulty: null,
      pct: null,
      oddsText: null,
      scientific: null
    };
  }
  let probability = normalized.probability;
  let odds = normalized.odds;
  let difficulty = normalized.difficulty;

  if (probability == null && normalized.prob?.oneIn) {
    probability = 1 / normalized.prob.oneIn;
    odds = { num: 1, den: normalized.prob.oneIn };
  }

  if (probability == null && normalized.model) {
    const computed = computeProbability(normalized, N);
    probability = computed.probability;
    odds = computed.odds;
    difficulty = computed.difficulty;
  }

  if (difficulty == null && probability != null) {
    difficulty = -Math.log10(probability);
  }

  return {
    probability,
    odds,
    difficulty,
    pct: probability != null ? formatPercent(probability) : null,
    oddsText: probability != null ? formatOddsDenominator(probability) : null,
    scientific: probability != null ? formatScientific(probability) : null
  };
}

function getOddsSortValue(probInfo) {
  if (!probInfo?.probability) return 0;
  return 1 / probInfo.probability;
}

function deriveConditionalSinglesFromPair(outcomePair) {
  const ids = Array.isArray(outcomePair) ? outcomePair.filter(Boolean) : [];
  const unique = Array.from(new Set(ids));
  return unique.map(key => ({
    eventType: "SINGLE",
    model: "CONDITIONAL",
    length: 1,
    keys: [Number(key)],
    context: {
      roundType: "PAIR",
      slots: 2,
      targetKey: Number(key),
      note: "single-appears",
      hit: "ANY"
    }
  }));
}

function buildProbabilityFormula(entry) {
  const normalized = normalizeEntry(entry);
  if (!normalized.model || normalized.model === "META") return null;
  const mode = normalized.context?.mode || "BASE";
  const N = "N";
  let stepFormula = null;

  if (normalized.context?.kind === "MISS") {
    if (normalized.context?.roundType === "PAIR" && mode === "FIRST") {
      stepFormula = "(N-1)/N";
    } else if (normalized.context?.roundType === "PAIR") {
      stepFormula = "((N-1)/N)^2";
    } else {
      stepFormula = "(N-1)/N";
    }
  } else if (normalized.eventType === "PAIR") {
    stepFormula = "1/(N*N)";
  } else if (normalized.context?.roundType === "PAIR") {
    if (mode === "FIRST") stepFormula = "1/N";
    else if (mode === "SECOND") stepFormula = "(N-1)/(N*N)";
    else stepFormula = "1-((N-1)/N)^2";
  } else {
    stepFormula = "1/N";
  }

  if (normalized.model === "CHAIN") {
    return `(${stepFormula})^${normalized.length}`;
  }
  return stepFormula;
}

function getMonsterById(id) {
  return monsters.find(m => m.id === id);
}

function namesFromKey(key) {
  if (!key) return [];
  const ids = key.split("-").map(x => parseInt(x, 10)).filter(Boolean);
  return ids.map(id => (getMonsterById(id) || {}).name).filter(Boolean);
}

function resolveJournalThresholds(settings) {
  const cfg = settings || state.journalSettings || {};
  const tSingle = Math.max(1, parseInt(cfg.thresholdSingle ?? 2, 10) || 2);
  const tPair = Math.max(1, parseInt(cfg.thresholdPair ?? 2, 10) || 2);
  return { tSingle, tPair };
}

function buildWinFrequencySnapshot(history = []) {
  const snapshot = {};
  monsters.forEach(m => {
    snapshot[m.name.toLowerCase()] = 0;
  });
  history.forEach(r => {
    (r.result || []).forEach(id => {
      const m = getMonsterById(id);
      if (!m) return;
      const key = m.name.toLowerCase();
      snapshot[key] = (snapshot[key] || 0) + 1;
    });
  });
  return snapshot;
}

// ---------- JOURNAL CORE ----------
function updateJournalFromStreakChange(prevInput, currInput, roundCtx, opts = {}) {
  try {
    const prev = normalizeStreakState(prevInput);
    const curr = normalizeStreakState(currInput);

    const target = Array.isArray(opts.target) ? opts.target : state.journal;
    const thresholds = opts.thresholds || resolveJournalThresholds(opts.settings || state.journalSettings);
    const { tSingle, tPair } = thresholds;
    if (!Array.isArray(target)) return;

    const winFrequencySnapshot = roundCtx?.winFrequencySnapshot || null;
    const addEntry = (phase, streakType, subjectKey, subjectNames, streakLen, extra = {}) => {
      const ts = (roundCtx && roundCtx.id) ? new Date(roundCtx.id).toISOString() : new Date().toISOString();
      const eventType = streakType === "PAIR" ? "PAIR" : "SINGLE";
      const model = phase.startsWith("END") ? "META" : (phase === "EXTEND" ? "CHAIN" : (extra.model || "BASE"));
      const keys = eventType === "PAIR"
        ? String(subjectKey || "").split("-").filter(Boolean)
        : [String(subjectKey || "")].filter(Boolean);
      const roundType = roundCtx?.mode === "double" ? "PAIR" : "SINGLE";
      const baseContext = extra.context ?? (roundCtx
        ? {
          roundType,
          slotsPerRound: roundType === "PAIR" ? 2 : 1,
          targetKey: null,
          note: eventType === "PAIR" ? "pair-ordered" : "round-context",
          mode: eventType === "PAIR" ? "PAIR_ORDERED" : "BASE",
          kind: "HIT"
        }
        : null);
      const entryBase = {
        ts,
        roundId: roundCtx?.id ?? null,
        phase,
        type: phase,
        streakType,
        subjectKey,
        subjectNames,
        len: streakLen,
        eventType,
        model,
        length: model === "CHAIN" ? streakLen : 1,
        keys: keys.map(key => Number(key)).filter(Number.isFinite),
        context: baseContext,
        winFrequencySnapshot
      };
      const probInfo = buildProbabilityInfo(entryBase, MONSTER_COUNT);
      target.unshift({
        ...entryBase,
        probability: probInfo.probability,
        odds: probInfo.odds,
        difficulty: probInfo.difficulty
      });
    };

    const addRoundEntry = () => {
      if (!roundCtx?.id) return;
      const ts = new Date(roundCtx.id).toISOString();
      const streakType = roundCtx.mode === "double" ? "PAIR" : "SINGLE";
      const roundType = roundCtx.mode === "double" ? "PAIR" : "SINGLE";
      const res = Array.isArray(roundCtx.result) ? roundCtx.result : [];
      const subjectNames = res.map(i => (getMonsterById(i) || {}).name).filter(Boolean);
      target.unshift({
        ts,
        roundId: roundCtx.id,
        phase: "ROUND",
        type: "ROUND",
        streakType,
        subjectKey: null,
        subjectNames,
        len: 1,
        eventType: streakType,
        model: null,
        length: 1,
        keys: res.slice(),
        context: { roundType, slotsPerRound: roundType === "PAIR" ? 2 : 1, targetKey: null, note: "round-outcome", mode: "BASE", kind: "HIT" },
        probability: null,
        odds: null,
        difficulty: null,
        winFrequencySnapshot
      });
    };

    // SINGLE streak changes (per monster)
    const applySingleStreak = ({ prevLen, currLen, hit, model, id, name, roundType }) => {
      const context = {
        roundType,
        slotsPerRound: roundType === "PAIR" ? 2 : 1,
        mode: hit,
        kind: "HIT",
        targetKey: id,
        note: "single-appears"
      };
      if (prevLen >= tSingle && currLen < tSingle) {
        addEntry("END", "SINGLE", String(id), [name], prevLen, { model, context });
      } else if (currLen >= tSingle && prevLen < tSingle) {
        addEntry("START", "SINGLE", String(id), [name], currLen, { model, context });
      } else if (currLen >= tSingle && prevLen >= tSingle && currLen > prevLen) {
        addEntry("EXTEND", "SINGLE", String(id), [name], currLen, { model, context });
      }
    };

    monsters.forEach(m => {
      const id = m.id;
      if (roundCtx?.mode === "double") {
        applySingleStreak({
          prevLen: prev.singlesFirst?.[id] || 0,
          currLen: curr.singlesFirst?.[id] || 0,
          hit: "FIRST",
          model: "CONDITIONAL",
          id,
          name: m.name,
          roundType: "PAIR"
        });
        applySingleStreak({
          prevLen: prev.singlesSecond?.[id] || 0,
          currLen: curr.singlesSecond?.[id] || 0,
          hit: "SECOND",
          model: "CONDITIONAL",
          id,
          name: m.name,
          roundType: "PAIR"
        });
        applySingleStreak({
          prevLen: prev.singlesPairAny?.[id] || 0,
          currLen: curr.singlesPairAny?.[id] || 0,
          hit: "ANY",
          model: "CONDITIONAL",
          id,
          name: m.name,
          roundType: "PAIR"
        });
      } else {
        applySingleStreak({
          prevLen: prev.singles?.[id] || 0,
          currLen: curr.singles?.[id] || 0,
          hit: "ANY",
          model: "BASE",
          id,
          name: m.name,
          roundType: "SINGLE"
        });
      }
    });

    const applyMissStreak = ({ prevLen, currLen, id, name, roundType }) => {
      const context = {
        roundType,
        slotsPerRound: roundType === "PAIR" ? 2 : 1,
        mode: "ANY",
        kind: "MISS",
        targetKey: id
      };
      if (prevLen >= tSingle && currLen < tSingle) {
        addEntry("END_MISS", "SINGLE", String(id), [name], prevLen, { model: "CHAIN", context });
      } else if (currLen >= tSingle && prevLen < tSingle) {
        addEntry("START_MISS", "SINGLE", String(id), [name], currLen, { model: "CHAIN", context });
      } else if (currLen >= tSingle && prevLen >= tSingle && currLen > prevLen) {
        addEntry("EXTEND_MISS", "SINGLE", String(id), [name], currLen, { model: "CHAIN", context });
      }
    };

    monsters.forEach(m => {
      const id = m.id;
      if (roundCtx?.mode === "double") {
        applyMissStreak({
          prevLen: prev.missesPairAny?.[id] || 0,
          currLen: curr.missesPairAny?.[id] || 0,
          id,
          name: m.name,
          roundType: "PAIR"
        });
      } else {
        applyMissStreak({
          prevLen: prev.missesSingle?.[id] || 0,
          currLen: curr.missesSingle?.[id] || 0,
          id,
          name: m.name,
          roundType: "SINGLE"
        });
      }
    });

    // PAIR streak changes
    const prevKey = prev.pair?.key || null;
    const prevLen = prev.pair?.len || 0;
    const currKey = curr.pair?.key || null;
    const currLen = curr.pair?.len || 0;

    if (prevKey && (currKey !== prevKey || currLen < tPair)) {
      if (prevLen >= tPair) addEntry("END", "PAIR", prevKey, namesFromKey(prevKey), prevLen);
      if (currKey && currLen >= tPair && prevKey !== currKey) addEntry("START", "PAIR", currKey, namesFromKey(currKey), currLen);
    } else if (currKey) {
      if (currLen >= tPair && prevLen < tPair) addEntry("START", "PAIR", currKey, namesFromKey(currKey), currLen);
      else if (currLen >= tPair && prevLen >= tPair && currLen > prevLen) addEntry("EXTEND", "PAIR", currKey, namesFromKey(currKey), currLen, {
        context: { roundType: "PAIR", slotsPerRound: 2, targetKey: null, note: "pair-ordered", mode: "PAIR_ORDERED", kind: "HIT" }
      });
    }

    // Optional ROUND entry per round: add if previous entry is not the same roundId
    if (roundCtx && roundCtx.id) {
      const currentRoundHasEntry = target[0] && target[0].roundId === roundCtx.id;
      if (!currentRoundHasEntry) addRoundEntry();
    }

  } catch (err) {
    console.error("Journal update failed:", err);
    logJournalError("Journal update failed.", { error: String(err) });
  }
}

function logJournalError(message, details = {}) {
  const list = Array.isArray(state.journalErrors) ? state.journalErrors : [];
  const entry = {
    ts: new Date().toISOString(),
    message,
    details
  };
  list.unshift(entry);
  state.journalErrors = list.slice(0, 50);
  saveState();
  renderJournalErrors();
}

function renderJournalErrors() {
  const list = document.getElementById("journal-error-list");
  const empty = document.getElementById("journal-error-empty");
  if (!list || !empty) return;

  const entries = Array.isArray(state.journalErrors) ? state.journalErrors : [];
  if (!entries.length) {
    list.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  list.innerHTML = entries.map(e => {
    const ts = formatTs(e.ts);
    const detail = e.details ? JSON.stringify(e.details) : "";
    return `
      <div class="journal-item">
        <div class="journal-top">
          <div class="journal-left">
            <div class="journal-title">${escapeHtml(t("error.label"))}</div>
            <div class="journal-meta">${escapeHtml(e.message || "Unknown error")}</div>
          </div>
        </div>
        <div class="journal-ts">${escapeHtml(ts)}${detail ? ` • ${escapeHtml(detail)}` : ""}</div>
      </div>`;
  }).join("");
}


function rebuildJournalFromHistory() {
  try {
    const history = Array.isArray(state.history) ? state.history : [];
    const target = [];
    let prevSnap = snapshotWithCompat({
      singles: {},
      singlesPairAny: {},
      singlesFirst: {},
      singlesSecond: {},
      missesSingle: {},
      missesPairAny: {},
      pair: { key: null, len: 0 }
    });
    const tempHistory = [];
    const ordered = history.slice().reverse();

    ordered.forEach(round => {
      tempHistory.unshift(round);
      const roundWithSnapshot = {
        ...round,
        winFrequencySnapshot: round.winFrequencySnapshot || buildWinFrequencySnapshot(tempHistory)
      };
      const currSnap = computeCurrentStreakState(tempHistory, monsters);
      updateJournalFromStreakChange(prevSnap, currSnap, roundWithSnapshot, {
        target,
        thresholds: resolveJournalThresholds(state.journalSettings),
        settings: state.journalSettings
      });
      prevSnap = snapshotWithCompat(currSnap);
    });

    state.journal = target;
    state.journalSelected = 0;
    state._streakSnapshot = snapshotWithCompat(prevSnap);
    state.streaks = snapshotWithCompat(prevSnap);

    if (history.length && !target.length) {
      logJournalError(t("error.archiveRebuildEmpty"), {
        historyCount: history.length
      });
    }
  } catch (err) {
    console.error("Journal rebuild failed:", err);
    logJournalError("Journal rebuild failed.", { error: String(err) });
  }
}

function startJournalComputation() {
  rebuildJournalFromHistory();
  saveState();
  renderJournal(true);
  updateStats();
  renderJournalErrors();
}




// ---------- JOURNAL UI ----------
function renderJournal(forceRefresh = false) {
  const list = document.getElementById("journal-full-list");
  const empty = document.getElementById("journal-full-empty");
  const total = document.getElementById("journal-total-count");
  const detail = document.getElementById("journal-detail-page");
  const summary = document.getElementById("journal-summary-page");
  const leaderboard = document.getElementById("leaderboard-list");
  if (!list || !empty || !total) return;

  const allEntries = Array.isArray(state.journal) ? state.journal : [];
  const entries = allEntries.slice(0, JOURNAL_LIST_LIMIT);
  total.textContent = String(allEntries.length);

  if (!allEntries.length) {
    list.innerHTML = "";
    empty.style.display = "block";
    if (detail) detail.innerHTML = `<div style="color:#444; font-size:0.8rem; text-align:center;">${escapeHtml(t("text.noEntry"))}</div>`;
    if (summary) summary.innerHTML = renderJournalSummaryHtml();
    renderDailyStats();
    if (leaderboard) leaderboard.innerHTML = `<div style="color:#444; font-size:0.8rem; text-align:center;">${escapeHtml(t("text.noData"))}</div>`;
    return;
  }

  empty.style.display = "none";

  const safeSel = clamp(state.journalSelected || 0, 0, entries.length - 1);
  state.journalSelected = safeSel;

  list.innerHTML = entries.map((e, idx) => renderJournalItemHtml(e, idx, idx === safeSel)).join("");

  // right panels
  if (detail) detail.innerHTML = renderJournalDetailHtml(entries[safeSel]);
  if (summary) summary.innerHTML = renderJournalSummaryHtml();
  renderDailyStats();
  if (leaderboard) leaderboard.innerHTML = renderLeaderboardHtml(allEntries);
  renderProbabilityLeaderboard();
  renderJournalErrors();
}

function resetJournal() {
  state.journal = [];
  state.journalSelected = 0;
  saveState();
  renderJournal();
}

function getMonsterByKey(key) {
  return monsters.find(m => m.name.toLowerCase() === String(key).toLowerCase());
}

function getWinFrequencySnapshot(entry) {
  return entry?.winFrequencySnapshot || null;
}

function renderWinFrequencySnapshotMini(snapshot) {
  if (!snapshot) return "";
  const rows = Object.entries(snapshot)
    .filter(([, value]) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  if (!rows.length) return "";
  const max = Math.max(1, rows[0][1] || 1);
  return `
    <div class="winfreq-mini">
      ${rows.map(([key, value]) => {
        const monster = getMonsterByKey(key);
        const label = monster ? monster.name : key;
        const pct = (value / max) * 100;
        return `
          <div class="winfreq-row">
            ${monster ? `<img src="${monster.url}" alt="${escapeHtml(label)}">` : ""}
            <span class="winfreq-name">${escapeHtml(label)}</span>
            <span class="winfreq-count">${value}</span>
            <span class="winfreq-bar"><span style="width:${pct.toFixed(1)}%"></span></span>
          </div>`;
      }).join("")}
    </div>`;
}

function renderWinFrequencySnapshotFull(snapshot) {
  if (!snapshot) return "";
  const rows = Object.entries(snapshot)
    .filter(([, value]) => Number.isFinite(value))
    .sort((a, b) => b[1] - a[1]);
  if (!rows.length) return "";
  const max = Math.max(1, rows[0][1] || 1);
  return `
    <div class="winfreq-full">
      ${rows.map(([key, value]) => {
        const monster = getMonsterByKey(key);
        const label = monster ? monster.name : key;
        const pct = (value / max) * 100;
        return `
          <div class="winfreq-row">
            ${monster ? `<img src="${monster.url}" alt="${escapeHtml(label)}">` : ""}
            <span class="winfreq-name">${escapeHtml(label)}</span>
            <span class="winfreq-count">${value}</span>
            <span class="winfreq-bar"><span style="width:${pct.toFixed(1)}%"></span></span>
          </div>`;
      }).join("")}
    </div>`;
}

function renderJournalItemHtml(e, idx, isActive) {
  const normalized = normalizeEntry(e);
  const probInfo = buildProbabilityInfo(normalized, MONSTER_COUNT);
  const typeCls = normalized.phase || "ROUND";
  const hitCls = normalized.context?.mode === "SECOND" ? "hit-second" : "";
  const activeCls = isActive ? "active" : "";
  const title = journalTitle(normalized);
  const meta = journalMeta(normalized, probInfo);
  const formula = buildProbabilityFormula(normalized);
  const tooltip = formula ? ` title="${escapeHtml(formula)}"` : "";
  const emptyLabel = normalized.phase && String(normalized.phase).includes("MISS") ? "MISS" : "ROUND";
  const probLabel = probInfo.probability != null && probInfo.probability < 0.001
    ? escapeHtml(probInfo.scientific || "-")
    : `%${escapeHtml(probInfo.pct || "-")}`;
  const probLine = probInfo.probability != null
    ? `<div class="prob">${probLabel}</div><div class="onein">${escapeHtml(probInfo.oddsText || "-")}</div>`
    : `<div class="prob">—</div><div class="onein">${escapeHtml(emptyLabel)}</div>`;
  const ts = formatTs(normalized.ts);
  const winFreqMini = renderWinFrequencySnapshotMini(getWinFrequencySnapshot(e));

  return `
  <div class="journal-item ${escapeHtml(typeCls)} ${escapeHtml(hitCls)} ${activeCls}" onclick="selectJournalEntry(${idx})">
    <div class="journal-top">
      <div class="journal-left">
        <div class="journal-icons">${renderJournalIcons(normalized)}${renderJournalBadges(normalized)}</div>
        <div>
          <div class="journal-title">${escapeHtml(title)}</div>
          <div class="journal-meta">${escapeHtml(meta)}</div>
        </div>
      </div>
      <div class="journal-right"${tooltip}>${probLine}</div>
    </div>
    <div class="journal-ts">${escapeHtml(ts)}${normalized.roundId ? ` • #${escapeHtml(String(normalized.roundId))}` : ""}</div>
    ${winFreqMini}
  </div>`;
}

function selectJournalEntry(idx) {
  state.journalSelected = idx;
  renderJournal();
}

function renderJournalIcons(e) {
  const normalized = normalizeEntry(e);
  // Try icon resolution from subjectNames; fallback to result
  const names = Array.isArray(normalized.subjectNames) ? normalized.subjectNames : [];
  const ids = [];

  if (normalized.eventType === "PAIR" && normalized.keys.length) {
    normalized.keys.forEach(x => ids.push(parseInt(x, 10)));
  } else if (normalized.eventType === "SINGLE" && normalized.keys.length) {
    ids.push(parseInt(normalized.keys[0], 10));
  }

  // For ROUND entries resolve icons from subjectNames (name->id fallback when result is missing)
  if (!ids.length && names.length) {
    names.forEach(n => {
      const found = monsters.find(m => m.name.toLowerCase() === String(n).toLowerCase());
      if (found) ids.push(found.id);
    });
  }

  const uniq = Array.from(new Set(ids)).slice(0, 2);
  if (!uniq.length) return `<span class="journal-pill">?</span>`;

  return uniq.map(id => {
    const m = getMonsterById(id);
    if (!m) return "";
    return `<img class="journal-icon" src="${m.url}" title="${escapeHtml(m.name)}">`;
  }).join("");
}

function renderJournalBadges(e) {
  const normalized = normalizeEntry(e);
  const badges = [];
  const roundType = normalized.context?.roundType;
  const mode = normalized.context?.mode;
  if (roundType === "SINGLE") badges.push(`<span class="journal-badge context">S</span>`);
  if (roundType === "PAIR" && mode === "ANY") badges.push(`<span class="journal-badge context">PA</span>`);
  if (roundType === "PAIR" && mode === "FIRST") badges.push(`<span class="journal-badge context">P1</span>`);
  if (roundType === "PAIR" && mode === "SECOND") badges.push(`<span class="journal-badge context">P2</span>`);
  if (roundType === "PAIR" && mode === "PAIR_ORDERED") badges.push(`<span class="journal-badge context">PO</span>`);
  if (normalized.model === "CONDITIONAL") badges.push(`<span class="journal-badge conditional">C</span>`);
  if (normalized.model === "CHAIN") badges.push(`<span class="journal-badge chain">streak</span>`);
  if (normalized.context?.kind === "MISS" || String(normalized.phase).includes("MISS")) {
    badges.push(`<span class="journal-badge drought">DROUGHT</span>`);
  }
  return badges.length ? badges.join("") : "";
}

function renderJournalDetailHtml(e) {
  if (!e) return `<div style="color:#444; font-size:0.8rem; text-align:center;">${escapeHtml(t("text.noEntry"))}</div>`;

  const normalized = normalizeEntry(e);
  const probInfo = buildProbabilityInfo(normalized, MONSTER_COUNT);
  const title = journalTitle(normalized);
  const meta = journalMeta(normalized, probInfo);
  const ts = formatTs(normalized.ts);
  const prob = probInfo.probability != null ? `%${probInfo.pct} (${probInfo.oddsText})` : "-";
  const sci = probInfo.scientific ? probInfo.scientific : "-";
  const pills = [
    `<span class="journal-pill">${escapeHtml(t("label.type"))}: <b>${escapeHtml(normalized.phase)}</b></span>`,
    `<span class="journal-pill">Event: <b>${escapeHtml(normalized.eventType || "-")}</b></span>`,
    normalized.model ? `<span class="journal-pill">Model: <b>${escapeHtml(normalized.model)}</b></span>` : "",
    normalized.length ? `<span class="journal-pill">${escapeHtml(t("label.len"))}: <b>${escapeHtml(String(normalized.length))}</b></span>` : ""
  ].filter(Boolean).join(" ");

  const subj = Array.isArray(normalized.subjectNames) && normalized.subjectNames.length ? normalized.subjectNames.join(" + ") : "-";
  const keyText = normalized.keys.length ? normalized.keys.join(",") : "-";
  const diffText = probInfo.difficulty != null ? probInfo.difficulty.toFixed(2) : "-";
  const contextText = normalized.context
    ? `${normalized.context.roundType || "-"} slots:${normalized.context.slotsPerRound ?? "-"} mode:${normalized.context.mode || "-"} kind:${normalized.context.kind || "-"} target:${normalized.context.targetKey ?? "-"} ${normalized.context.note || ""}`.trim()
    : "-";
  const winFrequencySnapshot = renderWinFrequencySnapshotFull(getWinFrequencySnapshot(e));

  return `
    <div class="journal-detail-title">${escapeHtml(title)}</div>
    <div class="journal-detail-meta">${escapeHtml(ts)}${normalized.roundId ? ` • RoundId: ${escapeHtml(String(normalized.roundId))}` : ""}</div>
    <div>${pills}</div>
    <div class="journal-kv"><span>Konu</span><b>${escapeHtml(subj)}</b></div>
    <div class="journal-kv"><span>Key</span><b>${escapeHtml(keyText)}</b></div>
    <div class="journal-kv"><span>Context</span><b>${escapeHtml(contextText)}</b></div>
    <div class="journal-kv"><span>Meta</span><b>${escapeHtml(meta)}</b></div>
    <div class="journal-kv"><span>Probability</span><b>${escapeHtml(prob)}</b></div>
    <div class="journal-kv"><span>Scientific</span><b>${escapeHtml(sci)}</b></div>
    <div class="journal-kv"><span>Diff</span><b>${escapeHtml(diffText)}</b></div>
    ${winFrequencySnapshot ? `<div class="journal-kv"><span>${escapeHtml(t("label.winFrequencySnapshot"))}</span></div>${winFrequencySnapshot}` : ""}
  `;
}

function renderJournalSummaryHtml() {
  const entries = Array.isArray(state.journal) ? state.journal : [];
  const counts = { START: 0, EXTEND: 0, END: 0, ROUND: 0, START_MISS: 0, EXTEND_MISS: 0, END_MISS: 0 };
  entries.forEach(e => {
    const phase = normalizeEntry(e).phase;
    counts[phase] = (counts[phase] || 0) + 1;
  });

  const rare = entries.filter(e => getOddsSortValue(buildProbabilityInfo(e, MONSTER_COUNT)) >= 500).length;
  const epic = entries.filter(e => getOddsSortValue(buildProbabilityInfo(e, MONSTER_COUNT)) >= 2000).length;

  return `
    <div class="journal-detail-title">${escapeHtml(t("summary.title"))}</div>
    <div class="journal-kv"><span>${escapeHtml(t("label.total"))}</span><b>${entries.length}</b></div>
    <div class="journal-kv"><span>START</span><b>${counts.START}</b></div>
    <div class="journal-kv"><span>EXTEND</span><b>${counts.EXTEND}</b></div>
    <div class="journal-kv"><span>END</span><b>${counts.END}</b></div>
    <div class="journal-kv"><span>ROUND</span><b>${counts.ROUND}</b></div>
    <div style="margin-top:8px"></div>
    <div class="journal-kv"><span>500+ (rare)</span><b>${rare}</b></div>
    <div class="journal-kv"><span>2000+ (epic)</span><b>${epic}</b></div>
  `;
}

function renderDailyStats() {
  const list = document.getElementById("journal-daily-list");
  const empty = document.getElementById("journal-daily-empty");
  if (!list || !empty) return;

  const history = Array.isArray(state.history) ? state.history : [];
  const daily = {};
  history.forEach(round => {
    const key = toDateKey(new Date(round.id));
    if (!key) return;
    if (!daily[key]) daily[key] = { dateKey: key, rounds: 0, wins: 0, losses: 0 };
    daily[key].rounds += 1;
    if (round.win) daily[key].wins += 1;
    else daily[key].losses += 1;
  });

  const rows = Object.values(daily).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  if (!rows.length) {
    list.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  const locale = "en-US";
  list.innerHTML = rows.map(row => {
    const parts = row.dateKey.split("-").map(Number);
    const date = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
    const label = Number.isNaN(date.getTime()) ? row.dateKey : date.toLocaleDateString(locale);
    return `<div class="daily-row">
      <div class="daily-date">${escapeHtml(label)}</div>
      <div class="daily-metrics">
        <span><b>${fmtNum(row.rounds)}</b> ${escapeHtml(t("label.roundsShort"))}</span>
        <span><b>${fmtNum(row.wins)}</b> ${escapeHtml(t("label.winsShort"))}</span>
        <span><b>${fmtNum(row.losses)}</b> ${escapeHtml(t("label.lossesShort"))}</span>
      </div>
    </div>`;
  }).join("");
}

function renderLeaderboardHtml(entries) {
  const streakEnds = entries.filter(e => normalizeEntry(e).phase === "END" && buildProbabilityInfo(e, MONSTER_COUNT).probability != null);
  if (!streakEnds.length) return `<div style="color:#444; font-size:0.8rem; text-align:center;">${escapeHtml(t("text.noEnd"))}</div>`;

  const top = streakEnds
    .slice()
    .sort((a, b) => getOddsSortValue(buildProbabilityInfo(b, MONSTER_COUNT)) - getOddsSortValue(buildProbabilityInfo(a, MONSTER_COUNT)))
    .slice(0, 3);

  const medals = ["🥇", "🥈", "🥉"];
  const medalNames = ["Gold", "Silver", "Bronze"];

  return top.map((e, i) => {
    const normalized = normalizeEntry(e);
    const probInfo = buildProbabilityInfo(normalized, MONSTER_COUNT);
    const title = journalTitle(normalized);
    const meta = `${normalized.eventType} • ${t("label.len")} ${normalized.length}`;
    const medal = medals[i] || "🏅";
    const rankCls = `rank-${i + 1}`;
    return `
      <div class="leaderboard-item ${rankCls}">
        <div class="leader-medal" title="${medalNames[i] || "Medal"}">${medal}</div>
        <div class="leader-main">
          <div class="leader-title">${escapeHtml(title)}</div>
          <div class="leader-meta">${escapeHtml(meta)}</div>
        </div>
        <div class="leader-prob">
          <div><b>${escapeHtml(probInfo.oddsText || "-")}</b></div>
          <div style="color:#9a9a9a; font-size:0.7rem;">%${escapeHtml(String(probInfo.pct || "-"))}</div>
        </div>
      </div>`;
  }).join("");
}

function journalTitle(e) {
  const normalized = normalizeEntry(e);
  const base =
    normalized.phase === "ROUND" ? "ROUND" :
    (normalized.phase === "START" ? "START" :
     normalized.phase === "EXTEND" ? "EXTEND" :
     normalized.phase === "END" ? "END" : "LOG");

  const hitLabel = normalized.context?.hit ? ` (${normalized.context.hit})` : "";
  const eventLabel = `${normalized.eventType || "?"}${hitLabel}`;
  const subj = (Array.isArray(normalized.subjectNames) && normalized.subjectNames.length)
    ? normalized.subjectNames.join(" + ")
    : (normalized.keys.length ? normalized.keys.join(" + ") : "—");
  return `${base} • ${eventLabel} • ${subj}`;
}

function journalMeta(e, probInfo = null) {
  const normalized = normalizeEntry(e);
  if (normalized.phase === "ROUND") return t("journal.round");
  const keys = normalized.keys.length ? normalized.keys.join(",") : "-";
  const diff = probInfo?.difficulty != null ? ` • Diff: ${probInfo.difficulty.toFixed(2)}` : "";
  const ctx = normalized.context?.note
    ? `${normalized.context.roundType || "-"}(${normalized.context.note})/${normalized.context.mode || "-"}`
    : "-";
  return `Model: ${normalized.model || "-"} • Len: ${normalized.length} • Key: ${keys} • Context: ${ctx}${diff}`;
}

// ---------- IMPORT / EXPORT ----------
function downloadJournal(format) {
  const entries = Array.isArray(state.journal) ? state.journal : [];
  if (format === "json") {
    downloadBlob(JSON.stringify({ journal: entries }, null, 2), "application/json", "hugel-journal.json");
    return;
  }

  const snapshotColumns = monsters.map(m => `${m.name.toLowerCase()}Count`);
  const header = ["ts", "roundId", "phase", "eventType", "model", "length", "keys", "context", "probability", "odds", "difficulty", "winFrequencySnapshot", ...snapshotColumns];
  const rows = entries.map(e => {
    const normalized = normalizeEntry(e);
    const probInfo = buildProbabilityInfo(normalized, MONSTER_COUNT);
    const snapshot = getWinFrequencySnapshot(e);
    const snapshotJson = snapshot ? JSON.stringify(snapshot) : "";
    const snapshotCounts = monsters.map(m => {
      const key = m.name.toLowerCase();
      return snapshot && Number.isFinite(snapshot[key]) ? snapshot[key] : "";
    });
    return [
      normalized.ts || "",
      normalized.roundId ?? "",
      normalized.phase || "",
      normalized.eventType || "",
      normalized.model || "",
      normalized.length ?? "",
      normalized.keys.length ? normalized.keys.join("+") : "",
      normalized.context ? JSON.stringify(normalized.context) : "",
      probInfo.probability ?? "",
      probInfo.odds ? JSON.stringify(probInfo.odds) : "",
      probInfo.difficulty ?? "",
      snapshotJson,
      ...snapshotCounts
    ];
  });
  const csv = [header, ...rows].map(row => row.map(csvCell).join(",")).join("\n");
  downloadBlob(csv, "text/csv;charset=utf-8", "hugel-journal.csv");
}

function copyJournalJson() {
  const entries = Array.isArray(state.journal) ? state.journal : [];
  const payload = JSON.stringify({ journal: entries }, null, 2);
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(payload);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = payload;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function clearJournal() {
  if (!confirm(t("confirm.clearArchive"))) return;
  resetJournal();
}

function triggerImport() {
  const input = document.getElementById("importHistoryFile");
  if (input) input.click();
}

function handleImportFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || ""));
      const history = Array.isArray(data) ? data : (Array.isArray(data.history) ? data.history : []);
      if (!Array.isArray(history)) {
        logJournalError(t("error.importInvalid"), { type: typeof data });
        return;
      }
      state.history = history;
      rebuildJournalFromHistory();
      saveState();
      render();
      updateStats();
      renderJournal(true);
    } catch (err) {
      console.warn("Import failed:", err);
      logJournalError("Import failed.", { error: String(err) });
    }
  };
  reader.readAsText(file);
}

// ---------- MAIN LOGIC ----------
function submitRound() {
  state.mode = getEffectiveMode();
  syncModeButtons();
  sanitizeSelections();

  const status = document.getElementById("status-text");
  const fail = (msg) => {
    if (status) status.innerHTML = `<span style="color:#ff4654; font-weight:800">${escapeHtml(msg)}</span>`;
  };

  const mode = state.bet.length >= 2 ? "double" : "single";
  state.mode = mode;

  // strict validation
  if (mode === "single") {
    if (state.bet.length !== 1) return fail(t("validation.singleBet"));
  } else {
    if (state.bet.length !== 2) return fail(t("validation.doubleBet"));
    if (state.bet[0] === state.bet[1]) return fail(t("validation.doubleSame"));
  }

  const requiredResults = mode === "single" ? 1 : 2;
  if (state.result.length !== requiredResults) {
    return fail(t(mode === "single" ? "validation.resultOne" : "validation.resultTwo"));
  }
  if (mode === "double" && state.result[0] === state.result[1]) return fail(t("validation.resultSame"));

  const roundId = Date.now();
  const win = isWin(mode, state.bet, state.result);

  const round = {
    id: roundId,
    mode,
    bet: state.bet.slice(),
    result: state.result.slice(),
    win
  };

  const cfg = normalizeConfig(state.config || CONFIG_DEFAULTS);
  const medalsPerWin = clampInt(cfg.medalsPerWin, 1, 999999);
  const medalDelta = win ? medalsPerWin : 0;
  const zenyDelta = -ENTRY_COST_ZENY;
  round.charMedalDelta = medalDelta;
  round.charZenyDelta = zenyDelta;
  applyCharacterDeltas(medalDelta, zenyDelta);

  // update history
  state.history.unshift(round);
  round.winFrequencySnapshot = buildWinFrequencySnapshot(state.history);

  // update streak snapshot + journal incrementally (no full recompute)
  const prevSnap = snapshotWithCompat(normalizeStreakState(state._streakSnapshot));
  const currSnap = computeCurrentStreakState(state.history, monsters);
  updateJournalFromStreakChange(prevSnap, currSnap, round);
  state._streakSnapshot = snapshotWithCompat(currSnap);
  state.streaks = snapshotWithCompat(currSnap);

  // clear selections for next input
  state.bet = [];
  state.result = [];

  saveState();
  render();
  updateStats();
  renderJournal();

  if (win) playWinSound();

  if (status) status.innerHTML = win
    ? `<b style="color:var(--kick-green)">${escapeHtml(t("status.win"))}</b>`
    : `<b style="color:#ff4654">${escapeHtml(t("status.lose"))}</b>`;
}

let winAudioCtx = null;
function playWinSound() {
  try {
    if (!winAudioCtx) winAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (winAudioCtx.state === "suspended") winAudioCtx.resume();

    const now = winAudioCtx.currentTime;
    const gain = winAudioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    gain.connect(winAudioCtx.destination);

    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
    freqs.forEach((f, i) => {
      const osc = winAudioCtx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(f, now);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.5);
    });
  } catch {}
}

function isWin(mode, bet, result) {
  if (!Array.isArray(bet) || !Array.isArray(result)) return false;

  if (mode === "single") {
    return bet.length === 1 && result.length >= 1 && result.includes(bet[0]);
  }

  // double: unordered pair match
  if (result.length !== 2) return false;
  if (bet.length !== 2) return false;
  const b = bet.slice().sort((a, b) => a - b).join("-");
  const r = result.slice().sort((a, b) => a - b).join("-");
  return b === r;
}

function undo() {
  if (!state.history.length) return;
  const removed = state.history.shift();
  if (removed && (removed.charMedalDelta || removed.charZenyDelta)) {
    applyCharacterDeltas(-(removed.charMedalDelta || 0), -(removed.charZenyDelta || 0));
  }
  state.journal = [];
  state.journalSelected = 0;
  state.streaks = {
    singles: {},
    singlesPairAny: {},
    singlesFirst: {},
    singlesSecond: {},
    missesSingle: {},
    missesPairAny: {},
    pair: { key: null, len: 0 }
  };
  state._streakSnapshot = {
    singles: {},
    singlesPairAny: {},
    singlesFirst: {},
    singlesSecond: {},
    missesSingle: {},
    missesPairAny: {},
    pair: { key: null, len: 0 }
  };
  saveState();
  render();
  updateStats();
  renderJournal();
}

function resetData() {
  if (!confirm(t("confirm.resetAll"))) return;
  state.bet = [];
  state.result = [];
  state.history = [];
  state.journal = [];
  state.journalSelected = 0;
  state.journalErrors = [];
  state.streaks = {
    singles: {},
    singlesPairAny: {},
    singlesFirst: {},
    singlesSecond: {},
    missesSingle: {},
    missesPairAny: {},
    pair: { key: null, len: 0 }
  };
  state._streakSnapshot = {
    singles: {},
    singlesPairAny: {},
    singlesFirst: {},
    singlesSecond: {},
    missesSingle: {},
    missesPairAny: {},
    pair: { key: null, len: 0 }
  };
  saveState();
  render();
  updateStats();
  renderJournal();
  renderJournalErrors();
}

function addExtraMedals() {
  const inp = document.getElementById("extraMedalsInput");
  const v = parseInt(inp?.value || "0", 10) || 0;
  state.extraMedals = (state.extraMedals || 0) + v;
  if (inp) inp.value = "0";
  saveState();
  updateStats();
}

function resetExtraMedals() {
  state.extraMedals = 0;
  saveState();
  updateStats();
}

// ---------- STATS / PANELS ----------
function updateStats() {
  const cfg = normalizeConfig(state.config || CONFIG_DEFAULTS);
  const entryCount = clampInt(getCharacterCount(), 1, 999999);
  const entryCostZeny = ENTRY_COST_ZENY;
  const medalsPerWin = clampInt(cfg.medalsPerWin, 1, 999999);
  const rewardCostMedals = clampInt(cfg.rewardCostMedals, 1, 999999);

  const rounds = state.history.length;
  const wins = state.history.filter(r => !!r.win).length;
  const losses = Math.max(0, rounds - wins);

  const spentZenyThisRun = entryCount * entryCostZeny;
  const spentZenyTotal = rounds * entryCount * entryCostZeny;
  const totalEarnedMedals = wins * medalsPerWin * entryCount;
  const characterTotals = getCharacterTotals();
  const medalsFromCharacters = characterTotals.medals || 0;
  const totalMedals = medalsFromCharacters + (state.extraMedals || 0);
  const rewardCount = rewardCostMedals > 0
    ? ensureCharacters().reduce((sum, c) => {
        const medals = parseInt(c.medals, 10) || 0;
        return sum + Math.floor(Math.max(0, medals) / rewardCostMedals);
      }, 0)
    : 0;

  setText("ui-zeny", `${fmtNum(spentZenyTotal)}z`);
  setText("ui-extra-medals", fmtNum(state.extraMedals || 0));
  setText("ui-medals", fmtNum(totalMedals));
  setText("ui-earned-medals", fmtNum(totalEarnedMedals));
  setText("ui-winrate", rounds ? `%${((wins / rounds) * 100).toFixed(1)}` : "%0.0");
  setText("ui-reward-count", fmtNum(rewardCount));
  setText("ui-entry-summary", `${entryCount} × ${fmtNum(entryCostZeny)}z = ${fmtNum(spentZenyThisRun)}z`);
  setText("ui-rounds", fmtNum(rounds));
  setText("ui-wins", fmtNum(wins));
  setText("ui-losses", fmtNum(losses));

  const todayKey = toDateKey(new Date());
  let winsToday = 0;
  (state.history || []).forEach(r => {
    const key = toDateKey(new Date(r.id));
    if (key && key === todayKey && r.win) winsToday += 1;
  });
  const medalsPerCharToday = winsToday * medalsPerWin;
  const medalsToday = medalsPerCharToday * entryCount;
  const rewardsPerCharToday = rewardCostMedals > 0 ? Math.floor(medalsPerCharToday / rewardCostMedals) : 0;
  const rewardsToday = rewardsPerCharToday * entryCount;

  setText("ui-today-wins", fmtNum(winsToday));
  setText("ui-today-medals", fmtNum(medalsToday));
  setText("ui-today-rewards", fmtNum(rewardsToday));

  renderCharactersSummaryInfo();
  renderHistory();
  renderTopPairsToday();
  renderPhenomenonPanel();
  renderStreakPanel();
  renderProbabilityLeaderboard();
  renderRawAlert(); // basic warning
}

function renderHistory() {
  const body = document.getElementById("history-body");
  if (!body) return;

  const last20 = state.history.slice(0, 20);
  body.innerHTML = last20.map((r, idx) => {
    const b = (r.bet || []).map(id => (getMonsterById(id) || {}).name).join("&");
    const res = (r.result || []).map(id => (getMonsterById(id) || {}).name).join(",");
    const winCls = r.win ? "log-win" : "";
    return `<tr>
      <td style="width:40px; color:#555;">${idx + 1}</td>
      <td>${escapeHtml(b || "-")} → <span class="${winCls}">${escapeHtml(res || "-")}</span></td>
      <td style="text-align:right; width:70px; color:${r.win ? "var(--kick-green)" : "var(--danger)"}; font-weight:800;">
        ${r.win ? "WIN" : "LOSE"}
      </td>
    </tr>`;
  }).join("");
}

function renderTopPairsToday() {
  const listEl = document.getElementById("top-pairs-list");
  const emptyEl = document.getElementById("top-pairs-empty");
  const dateEl = document.getElementById("top-pairs-date");
  if (!listEl || !emptyEl || !dateEl) return;

  const now = new Date();
  const todayKey = toDateKey(now);
  const locale = "en-US";
  dateEl.textContent = Number.isNaN(now.getTime()) ? "" : now.toLocaleDateString(locale);

  const counts = {};
  (state.history || []).forEach(round => {
    const key = toDateKey(new Date(round.id));
    if (!key || key !== todayKey) return;
    if (!Array.isArray(round.result) || round.result.length < 2) return;
    const a = Math.min(round.result[0], round.result[1]);
    const b = Math.max(round.result[0], round.result[1]);
    const pairKey = `${a}-${b}`;
    counts[pairKey] = (counts[pairKey] || 0) + 1;
  });

  const pairs = Object.entries(counts)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => (b.count - a.count) || a.key.localeCompare(b.key))
    .slice(0, 6);

  if (!pairs.length) {
    listEl.innerHTML = "";
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";
  listEl.innerHTML = pairs.map((pair, idx) => {
    const ids = pair.key.split("-").map(x => parseInt(x, 10));
    const nameA = (getMonsterById(ids[0]) || {}).name || `#${ids[0]}`;
    const nameB = (getMonsterById(ids[1]) || {}).name || `#${ids[1]}`;
    return `<div class="top-pairs-row">
      <div><b>#${idx + 1}</b> ${escapeHtml(nameA)} + ${escapeHtml(nameB)}</div>
      <div class="top-pairs-count">${fmtNum(pair.count)}x</div>
    </div>`;
  }).join("");
}

function renderHeatmap() {
  const el = document.getElementById("heatmap-list");
  if (!el) return;

  const counts = {};
  monsters.forEach(m => counts[m.id] = 0);

  state.history.forEach(r => {
    (r.result || []).forEach(id => { if (counts[id] != null) counts[id]++; });
  });

  const totalSlots = Math.max(1, state.history.length * 2);

  el.innerHTML = monsters.map(m => {
    const c = counts[m.id] || 0;
    const pct = (c / totalSlots) * 100;
    return `
      <div style="display:flex; align-items:center; gap:8px; margin:6px 0;">
        <img src="${m.url}" style="width:22px; height:22px; border-radius:6px; border:1px solid #222; background:#0b0b0b;">
        <div style="flex:1;">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#bbb;">
            <span>${escapeHtml(m.name)}</span>
            <b style="color:#fff;">${c}</b>
          </div>
          <div style="height:6px; background:#111; border:1px solid #222; border-radius:999px; overflow:hidden;">
            <div style="height:100%; width:${pct.toFixed(1)}%; background:var(--kick-green); opacity:0.55;"></div>
          </div>
        </div>
      </div>`;
  }).join("");
}

function getActiveStreakRows() {
  const { tSingle, tPair } = resolveJournalThresholds();
  const curr = state.streaks || computeCurrentStreakState(state.history, monsters);
  const rows = [];

  monsters.forEach(m => {
    const len = curr.singles[m.id] || 0;
    if (len >= tSingle) {
      const p = buildProbabilityInfo({
        phase: "EXTEND",
        eventType: "SINGLE",
        model: "CHAIN",
        length: len,
        keys: [m.id],
        context: { roundType: "SINGLE", slots: 1, targetKey: m.id, note: "single-appears" }
      }, MONSTER_COUNT);
      rows.push({
        title: `${m.name} (SINGLE)`,
        len,
        prob: p,
        icon: m.url
      });
    }
  });

  if (curr.pair?.key && (curr.pair.len || 0) >= tPair) {
    const len = curr.pair.len || 0;
    const p = buildProbabilityInfo({
      phase: "EXTEND",
      eventType: "PAIR",
      model: "CHAIN",
      length: len,
      keys: curr.pair.key.split("-").filter(Boolean).map(Number),
      context: { roundType: "PAIR", slots: 2, targetKey: null, note: "pair-ordered" }
    }, MONSTER_COUNT);
    rows.push({
      title: `${namesFromKey(curr.pair.key).join(" + ")} (PAIR)`,
      len,
      prob: p,
      icon: null
    });
  }

  return rows;
}

function renderStreakPanel() {
  const targets = [
    document.getElementById("streak-list-journal")
  ].filter(Boolean);
  if (!targets.length) return;

  const rows = getActiveStreakRows();

  if (!rows.length) {
    targets.forEach(el => {
      el.innerHTML = `<div style="text-align:center; color:#444; font-size:0.8rem;">${escapeHtml(t("text.noActiveStreak"))}</div>`;
    });
    return;
  }

  // sort most extreme values first
  rows.sort((a, b) => getOddsSortValue(b.prob) - getOddsSortValue(a.prob));

  const html = rows.map(r => `
    <div style="background:#0f0f0f; border:1px solid #1f1f1f; border-radius:8px; padding:8px; margin-top:8px;">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
        <div style="display:flex; align-items:center; gap:8px;">
          ${r.icon ? `<img src="${r.icon}" style="width:22px; height:22px; border-radius:6px; border:1px solid #222; background:#0b0b0b;">` : `<span style="width:22px; height:22px; border-radius:6px; display:inline-block; background:#0b0b0b; border:1px solid #222;"></span>`}
          <div>
            <div style="font-weight:800; color:#fff; font-size:0.8rem;">${escapeHtml(r.title)}</div>
            <div style="color:#9a9a9a; font-size:0.7rem;">${escapeHtml(t("label.len"))}: <b style="color:#fff;">${r.len}</b></div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800; color:#fff;">%${escapeHtml(r.prob.pct || "-")}</div>
          <div style="color:#9a9a9a; font-size:0.7rem;">${escapeHtml(r.prob.oddsText || "-")}</div>
        </div>
      </div>
    </div>
  `).join("");
  targets.forEach(el => {
    el.innerHTML = html;
  });
}

function getPhenomenonRows() {
  const entries = Array.isArray(state.journal) ? state.journal : [];
  const rows = entries.map(e => {
    const normalized = normalizeEntry(e);
    return {
      entry: normalized,
      raw: e,
      probInfo: buildProbabilityInfo(normalized, MONSTER_COUNT)
    };
  }).filter(row => {
    const phase = String(row.entry.phase || "");
    if (row.entry.model !== "CHAIN") return false;
    if (!phase.startsWith("EXTEND")) return false;
    if (row.probInfo.probability == null) return false;
    return true;
  });

  rows.sort((a, b) => (a.probInfo.probability || 0) - (b.probInfo.probability || 0));
  return rows.slice(0, 3);
}

function formatPhenomenonTitle(entry) {
  const names = Array.isArray(entry.subjectNames) && entry.subjectNames.length
    ? entry.subjectNames.join(" + ")
    : (entry.keys.length ? entry.keys.map(id => (getMonsterById(id) || {}).name).filter(Boolean).join(" + ") : "-");
  const isMiss = entry.context?.kind === "MISS" || String(entry.phase || "").includes("MISS");
  const eventType = `${entry.eventType || "SINGLE"}${isMiss ? " MISS" : ""}`;
  return `${names || "-"} (${eventType})`;
}

function renderPhenomenonBadges(entry) {
  const badges = [];
  const roundType = entry.context?.roundType;
  const mode = entry.context?.mode;
  if (roundType === "SINGLE") badges.push(`<span class="journal-badge context">S</span>`);
  if (roundType === "PAIR" && mode === "ANY") badges.push(`<span class="journal-badge context">PA</span>`);
  if (roundType === "PAIR" && mode === "FIRST") badges.push(`<span class="journal-badge context">P1</span>`);
  if (roundType === "PAIR" && mode === "SECOND") badges.push(`<span class="journal-badge context">P2</span>`);
  if (roundType === "PAIR" && mode === "PAIR_ORDERED") badges.push(`<span class="journal-badge context">PO</span>`);
  if (entry.context?.kind === "MISS" || String(entry.phase).includes("MISS")) {
    badges.push(`<span class="journal-badge drought">DROUGHT</span>`);
  } else {
    badges.push(`<span class="journal-badge chain">STREAK</span>`);
  }
  return badges.join("");
}

function renderPhenomenonPanel() {
  const el = document.getElementById("phenomenon-list");
  if (!el) return;

  const rows = getPhenomenonRows();
  if (!rows.length) {
    el.innerHTML = `<div style="color:#444; font-size:0.8rem; text-align:center;">${escapeHtml(t("text.noPhenomenon"))}</div>`;
    return;
  }

  el.innerHTML = rows.map(row => {
    const entry = row.entry;
    const probInfo = row.probInfo;
    const formula = buildProbabilityFormula(entry);
    const tooltip = formula ? ` title="${escapeHtml(formula)}"` : "";
    const oddsText = probInfo.probability != null ? formatOddsDenominator(probInfo.probability) : "-";
    const diffText = probInfo.difficulty != null ? probInfo.difficulty.toFixed(2) : "-";
    return `
      <div class="phenomenon-item"${tooltip}>
        <div class="phenomenon-top">
          <div class="phenomenon-title">${escapeHtml(formatPhenomenonTitle(entry))}</div>
          <div class="phenomenon-badges">${renderPhenomenonBadges(entry)}</div>
        </div>
        <div class="phenomenon-meta">
          <span>${escapeHtml(t("label.len"))}: <b>${escapeHtml(String(entry.length))}</b></span>
          <span>Prob: <b>%${escapeHtml(String(probInfo.pct || "-"))}</b></span>
          <span>Odds: <b>${escapeHtml(oddsText)}</b></span>
        </div>
        <div class="phenomenon-foot">Diff: ${escapeHtml(diffText)}</div>
      </div>`;
  }).join("");
}

function renderProbabilityLeaderboard() {
  const el = document.getElementById("probability-leaderboard");
  if (!el) return;

  const entries = Array.isArray(state.journal) ? state.journal : [];
  const rows = entries.map(e => {
    const normalized = normalizeEntry(e);
    const probInfo = buildProbabilityInfo(normalized, MONSTER_COUNT);
    return {
      title: journalTitle(normalized),
      len: normalized.length || 1,
      prob: probInfo
    };
  }).filter(r => r.prob?.probability != null);

  if (!rows.length) {
    el.innerHTML = `<div style="color:#444; font-size:0.8rem; text-align:center;">${escapeHtml(t("text.noProb"))}</div>`;
    return;
  }

  const top = rows
    .slice()
    .sort((a, b) => getOddsSortValue(b.prob) - getOddsSortValue(a.prob))
    .slice(0, 3);

  const medals = ["🥇", "🥈", "🥉"];
  const medalNames = ["Gold", "Silver", "Bronze"];
  el.innerHTML = top.map((r, i) => `
      <div class="leaderboard-item rank-${i + 1}">
        <div class="leader-medal" title="${medalNames[i] || "Medal"}">${medals[i] || "🏅"}</div>
        <div class="leader-main">
          <div class="leader-title">${escapeHtml(r.title)}</div>
          <div class="leader-meta">${escapeHtml(t("label.len"))} ${r.len}</div>
        </div>
        <div class="leader-prob">
          <div><b>%${escapeHtml(String(r.prob.pct || "-"))}</b></div>
          <div style="color:#9a9a9a; font-size:0.7rem;">${escapeHtml(r.prob.oddsText || "-")}</div>
        </div>
      </div>
  `).join("");
}

function renderRawAlert() {
  const el = document.getElementById("raw-alert");
  if (!el) return;

  // Basic RAW warning: trigger if there is no repeated ORDERED pair (1-2) in the last 30 rounds.
  const N = 30;
  const recent = state.history.slice(0, N + 1);
  let hasOrderedRepeat = false;
  for (let i = 0; i < recent.length - 1; i++) {
    const a = (recent[i].result || []).join("-");
    const b = (recent[i + 1].result || []).join("-");
    if (a && a === b) { hasOrderedRepeat = true; break; }
  }

  el.style.display = (state.history.length >= N && !hasOrderedRepeat) ? "block" : "none";
}

// ---------- PERSIST ----------
function saveState() {
  try {
    const payload = {
      mode: state.mode,
      bet: state.bet,
      result: state.result,
      history: state.history,
      journal: state.journal,
      journalSelected: state.journalSelected,
      journalErrors: state.journalErrors,
      extraMedals: state.extraMedals,
      characters: state.characters,
      journalSettings: state.journalSettings,
      streaks: state.streaks,
      _streakSnapshot: state._streakSnapshot
    };
    localStorage.setItem("prob_hugel_state_v2", JSON.stringify(payload));
  } catch (err) {
    console.warn("State not saved:", err);
  }
}

function loadState() {
  try {
    let raw = null;
    for (const k of LS_KEYS) {
      raw = localStorage.getItem(k);
      if (raw) break;
    }
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      state.mode = parsed.mode === "double" ? "double" : "single";
      state.bet = Array.isArray(parsed.bet) ? parsed.bet : [];
      state.result = Array.isArray(parsed.result) ? parsed.result : [];
      state.history = Array.isArray(parsed.history) ? parsed.history : [];
      state.journal = Array.isArray(parsed.journal) ? parsed.journal : [];
      state.journalSelected = parsed.journalSelected || 0;
      state.journalErrors = Array.isArray(parsed.journalErrors) ? parsed.journalErrors : [];
      state.extraMedals = typeof parsed.extraMedals === "number" ? parsed.extraMedals : 0;
      state.characters = normalizeCharacters(parsed.characters || []);
      state.journalSettings = parsed.journalSettings || { thresholdSingle: 2, thresholdPair: 2 };
      const snap = snapshotWithCompat(parsed._streakSnapshot || parsed.streaks || {
        singles: {},
        singlesPairAny: {},
        singlesFirst: {},
        singlesSecond: {},
        missesSingle: {},
        missesPairAny: {},
        pair: { key: null, len: 0 }
      });
      state._streakSnapshot = snap;
      state.streaks = snap;
    }
  } catch (err) {
    console.warn("State load failed:", err);
  }

  // button active state (mode)
  try {
    syncModeButtons();
  } catch {}
}

// ---------- HELPERS ----------
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function fmtNum(n) {
  try { return Number(n || 0).toLocaleString("en-US"); }
  catch { return String(n || 0); }
}

function fmtDecimal(n) {
  try {
    return Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } catch {
    return (Number(n || 0)).toFixed(2);
  }
}

function toDateKey(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function csvCell(v) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes("\n") || s.includes('"')) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

function downloadBlob(content, mime, filename) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function formatTs(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso || "");
  return d.toLocaleString("en-US");
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function clampInt(v, min, max) {
  v = parseInt(v, 10) || 0;
  return clamp(v, min, max);
}

function readNumber(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const v = parseInt(el.value, 10);
  return Number.isFinite(v) ? v : fallback;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(text);
}




