const ITEMS = Array.isArray(window.ITEMS_DATA) ? window.ITEMS_DATA : [];
const META = window.ITEMS_META || {};
const STORAGE_KEY = "rht_accounting_state_v1";
const SECTION_KEY = "rht_accounting_section";
const SHARE_DRAFT_KEY = "rht_accounting_share_draft_v1";
const ZENY_TEMPLATE = { wallet: 0, storage: 0, merchant: 0, bank: 0, other: 0 };

const itemsById = new Map(ITEMS.map(item => [item.id, item]));

const state = loadState();

const elements = {
  metaUpdated: document.getElementById("meta-updated"),
  metaCount: document.getElementById("meta-count"),
  totalZenyAll: document.getElementById("total-zeny-all"),
  totalZeny: document.getElementById("total-zeny"),
  inventoryValue: document.getElementById("inventory-value"),
  netWorth: document.getElementById("net-worth"),
  itemsOwned: document.getElementById("items-owned"),
  inventoryList: document.getElementById("inventory-list"),
  inventorySummary: document.getElementById("inventory-summary"),
  inventorySearch: document.getElementById("inventory-search"),
  groupFilter: document.getElementById("group-filter"),
  groupChart: document.getElementById("group-chart"),
  topItems: document.getElementById("top-items"),
  accountList: document.getElementById("account-list"),
  accountName: document.getElementById("account-name"),
  accountAdd: document.getElementById("account-add"),
  accountRename: document.getElementById("account-rename"),
  accountDelete: document.getElementById("account-delete"),
  activeAccountSelect: document.getElementById("active-account-select"),
  activeAccountMeta: document.getElementById("active-account-meta"),
  zenyAccountSelect: document.getElementById("zeny-account-select"),
  zenyCharacterSelect: document.getElementById("zeny-character-select"),
  zenyCharacterValue: document.getElementById("zeny-character-value"),
  characterCount: document.getElementById("character-count"),
  characterName: document.getElementById("character-name"),
  characterZeny: document.getElementById("character-zeny"),
  characterAdd: document.getElementById("character-add"),
  characterList: document.getElementById("character-list"),
  globalSearch: document.getElementById("global-search"),
  globalResults: document.getElementById("global-results"),
  vendingCharacter: document.getElementById("vending-character"),
  vendingOpen: document.getElementById("vending-open"),
  vendingList: document.getElementById("vending-list"),
  loanPerson: document.getElementById("loan-person"),
  loanItem: document.getElementById("loan-item"),
  loanQty: document.getElementById("loan-qty"),
  loanDate: document.getElementById("loan-date"),
  loanNote: document.getElementById("loan-note"),
  loanAdd: document.getElementById("loan-add"),
  loanList: document.getElementById("loan-list"),
  loanFilter: document.getElementById("loan-filter"),
  loanSummary: document.getElementById("loan-summary"),
  loanSuggestions: document.getElementById("loan-suggestions"),
  loanStatus: document.getElementById("loan-status"),
  shareFrom: document.getElementById("share-from"),
  shareItem: document.getElementById("share-item"),
  shareQty: document.getElementById("share-qty"),
  sharePrice: document.getElementById("share-price"),
  shareNote: document.getElementById("share-note"),
  shareGeneralNote: document.getElementById("share-general-note"),
  shareAdd: document.getElementById("share-add"),
  shareList: document.getElementById("share-list"),
  shareSuggestions: document.getElementById("share-suggestions"),
  shareStatus: document.getElementById("share-status"),
  shareMeta: document.getElementById("share-meta"),
  shareGeneratedMeta: document.getElementById("share-generated-meta"),
  shareGenerate: document.getElementById("share-generate"),
  shareCopy: document.getElementById("share-copy"),
  shareCode: document.getElementById("share-code"),
  shareImport: document.getElementById("share-import"),
  shareApply: document.getElementById("share-apply"),
  shareImportBtn: document.getElementById("share-import-btn"),
  sharePreview: document.getElementById("share-preview"),
  ocrDrop: document.getElementById("ocr-drop"),
  ocrPreview: document.getElementById("ocr-preview"),
  ocrFile: document.getElementById("ocr-file"),
  ocrClear: document.getElementById("ocr-clear"),
  ocrStatus: document.getElementById("ocr-status"),
  ocrModal: document.getElementById("ocr-modal"),
  ocrItems: document.getElementById("ocr-items"),
  ocrUnknown: document.getElementById("ocr-unknown"),
  ocrConfirm: document.getElementById("ocr-confirm"),
  ocrCancel: document.getElementById("ocr-cancel"),
  ocrSummary: document.getElementById("ocr-summary"),
  searchInput: document.getElementById("item-search"),
  searchResults: document.getElementById("search-results"),
  filterType: document.getElementById("filter-type"),
  filterCategory: document.getElementById("filter-category"),
  exportBtn: document.getElementById("exportBtn"),
  importFile: document.getElementById("importFile"),
  resetBtn: document.getElementById("resetBtn"),
  clearInventory: document.getElementById("clearInventory")
};

const zenyInputs = {
  wallet: document.getElementById("zeny-wallet"),
  storage: document.getElementById("zeny-storage"),
  merchant: document.getElementById("zeny-merchant"),
  bank: document.getElementById("zeny-bank"),
  other: document.getElementById("zeny-other")
};

function createId(prefix = "acc") {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function normalizeVendingItem(item) {
  if (!item) return null;
  const id = Number(item.id);
  if (!id) return null;
  const qty = Math.max(1, Number(item.qty) || 1);
  const price = Math.max(0, Number(item.price) || 0);
  return { id, qty, price };
}

function normalizeCharacter(entry, fallbackName = "Character") {
  if (!entry) return null;
  const name = (entry.name || fallbackName || "Character").trim() || "Character";
  const zeny = Math.max(0, Number(entry.zeny) || 0);
  return {
    id: entry.id || createId("char"),
    name,
    zeny
  };
}

function normalizeCharacters(list = []) {
  const seen = new Set();
  return list
    .map((entry, index) => normalizeCharacter(entry, `Character ${index + 1}`))
    .filter(Boolean)
    .slice(0, 7)
    .map((character) => {
      let nextId = character.id;
      while (seen.has(nextId)) {
        nextId = createId("char");
      }
      seen.add(nextId);
      return { ...character, id: nextId };
    });
}

function normalizeVendingSale(sale) {
  if (!sale) return null;
  const id = Number(sale.id);
  if (!id) return null;
  const qty = Math.max(1, Number(sale.qty) || 1);
  const price = Math.max(0, Number(sale.price) || 0);
  const soldAt = sale.soldAt || "";
  const tax = Math.max(0, Number(sale.tax) || 0);
  const net = Math.max(0, Number(sale.net) || 0);
  return { id, qty, price, soldAt, tax, net };
}

function normalizeVendingStall(stall, fallbackName = "Vendor") {
  const character = (stall?.character || stall?.name || fallbackName || "Vendor").trim() || "Vendor";
  const items = Array.isArray(stall?.items)
    ? stall.items.map(normalizeVendingItem).filter(Boolean).slice(0, 12)
    : [];
  const sales = Array.isArray(stall?.sales)
    ? stall.sales.map(normalizeVendingSale).filter(Boolean)
    : [];
  return {
    id: stall?.id || createId("vend"),
    character,
    items,
    sales
  };
}

function normalizeVendingList(list = []) {
  const seen = new Set();
  return list.map((stall, index) => {
    const normalized = normalizeVendingStall(stall, `Vendor ${index + 1}`);
    let nextId = normalized.id;
    while (seen.has(nextId)) {
      nextId = createId("vend");
    }
    seen.add(nextId);
    return { ...normalized, id: nextId };
  });
}

function normalizeLoan(entry, fallbackPerson = "Player") {
  if (!entry) return null;
  const person = String(entry.person || entry.to || entry.borrower || fallbackPerson).trim() || fallbackPerson;
  let itemId = Number(entry.itemId || entry.item || entry.item_id);
  if (!Number.isFinite(itemId) || itemId <= 0) itemId = null;
  const rawName = String(entry.itemName || entry.item_name || entry.item || "").trim();
  const itemName = itemId ? (itemsById.get(itemId)?.name || rawName || "Unknown Item") : (rawName || "Unknown Item");
  const qty = Math.max(1, Number(entry.qty) || 1);
  const note = String(entry.note || entry.notes || "").trim();
  const givenAt = entry.givenAt || entry.date || entry.lentAt || "";
  const returnedAt = entry.returnedAt || "";
  const status = (entry.status === "returned" || returnedAt) ? "returned" : "active";
  return {
    id: entry.id || createId("loan"),
    person,
    itemId,
    itemName,
    qty,
    note,
    givenAt,
    returnedAt,
    status
  };
}

function normalizeLoans(list = []) {
  const seen = new Set();
  return list
    .map((entry, index) => normalizeLoan(entry, `Player ${index + 1}`))
    .filter(Boolean)
    .map((loan) => {
      let nextId = loan.id;
      while (seen.has(nextId)) {
        nextId = createId("loan");
      }
      seen.add(nextId);
      return { ...loan, id: nextId };
    });
}

function normalizeAccount(data = {}, fallbackName = "Account") {
  const name = (data.name || fallbackName || "Account").trim() || "Account";
  const zeny = { ...ZENY_TEMPLATE, ...(data.zeny || {}) };
  const items = Array.isArray(data.items) ? data.items : [];
  const vending = Array.isArray(data.vending) ? normalizeVendingList(data.vending) : [];
  const characters = Array.isArray(data.characters) ? normalizeCharacters(data.characters) : [];
  const loans = Array.isArray(data.loans) ? normalizeLoans(data.loans) : [];
  return {
    id: data.id || createId(),
    name,
    zeny,
    items,
    vending,
    characters,
    loans
  };
}

function normalizeAccounts(list = []) {
  const seen = new Set();
  return list.map((item, index) => {
    const account = normalizeAccount(item, `Account ${index + 1}`);
    let nextId = account.id;
    while (seen.has(nextId)) {
      nextId = createId();
    }
    seen.add(nextId);
    return { ...account, id: nextId };
  });
}

function defaultState() {
  const primary = normalizeAccount({ name: "Main" }, "Main");
  return {
    accounts: [primary],
    activeAccountId: primary.id,
    inventorySearch: "",
    inventoryGroup: "All"
  };
}

function normalizeState(parsed) {
  const base = defaultState();
  if (!parsed || typeof parsed !== "object") return base;

  let accounts = [];
  let activeAccountId = parsed.activeAccountId;

  if (Array.isArray(parsed.accounts) && parsed.accounts.length) {
    accounts = normalizeAccounts(parsed.accounts);
  } else if (parsed.zeny || parsed.items) {
    accounts = [normalizeAccount({ id: parsed.activeAccountId, name: "Main", zeny: parsed.zeny, items: parsed.items }, "Main")];
  } else {
    accounts = base.accounts;
  }

  if (!activeAccountId || !accounts.some(acc => acc.id === activeAccountId)) {
    activeAccountId = accounts[0]?.id;
  }

  const next = {
    accounts,
    activeAccountId,
    inventorySearch: parsed.inventorySearch || base.inventorySearch,
    inventoryGroup: parsed.inventoryGroup || base.inventoryGroup
  };

  if (parsed.priceBasis) {
    next.priceBasis = parsed.priceBasis;
  }

  return next;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch (_) {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const NUMBER_LOCALE = navigator.language || "en-US";

function formatNumber(value) {
  const num = Number(value) || 0;
  return num.toLocaleString(NUMBER_LOCALE);
}

function parseNumber(value) {
  const cleaned = String(value ?? "").replace(/[^0-9]/g, "");
  return cleaned ? Number(cleaned) : 0;
}

function parseOptionalNumber(value) {
  const cleaned = String(value ?? "").replace(/[^0-9]/g, "");
  return cleaned === "" ? null : Number(cleaned);
}

function setupNumericInput(input, { allowEmpty = false } = {}) {
  if (!input) return;
  input.type = "text";
  input.inputMode = "numeric";
  input.autocomplete = "off";
  input.spellcheck = false;

  const formatWithCaret = () => {
    const raw = input.value;
    const cursor = input.selectionStart ?? raw.length;
    const digitsBefore = raw.slice(0, cursor).replace(/[^0-9]/g, "").length;
    const cleaned = raw.replace(/[^0-9]/g, "");

    if (cleaned === "") {
      if (allowEmpty) {
        input.value = "";
        return;
      }
      input.value = "0";
      input.setSelectionRange(1, 1);
      return;
    }

    const formatted = formatNumber(cleaned);
    input.value = formatted;

    let nextPos = 0;
    let digitsSeen = 0;
    while (nextPos < formatted.length && digitsSeen < digitsBefore) {
      if (/\d/.test(formatted[nextPos])) {
        digitsSeen += 1;
      }
      nextPos += 1;
    }
    input.setSelectionRange(nextPos, nextPos);
  };

  input.addEventListener("input", formatWithCaret);
  input.addEventListener("blur", () => {
    if (!input.value && allowEmpty) return;
    const cleaned = input.value.replace(/[^0-9]/g, "");
    input.value = cleaned === "" ? (allowEmpty ? "" : "0") : formatNumber(cleaned);
  });
}

function renderAccountSelectors() {
  const account = getActiveAccount();
  const options = (state.accounts || []).map(acc => ({
    id: acc.id,
    name: acc.name
  }));

  const applyOptions = (select) => {
    if (!select) return;
    select.innerHTML = "";
    options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt.id;
      option.textContent = opt.name;
      select.append(option);
    });
    select.value = account.id;
  };

  applyOptions(elements.activeAccountSelect);
  applyOptions(elements.zenyAccountSelect);

  if (elements.activeAccountMeta) {
    const totalZeny = formatZeny(getAccountZenyTotal(account));
    const itemsOwned = getAccountItemsOwned(account);
    const chars = (account.characters || []).length;
    elements.activeAccountMeta.textContent = `${totalZeny} • ${itemsOwned.toLocaleString("en-US")} items • ${chars}/7 chars`;
  }

  if (elements.zenyCharacterSelect) {
    const select = elements.zenyCharacterSelect;
    const previous = select.value;
    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Account Total";
    select.append(placeholder);

    (account.characters || []).forEach((character) => {
      const option = document.createElement("option");
      option.value = character.id;
      option.textContent = character.name;
      select.append(option);
    });

    if (previous && (account.characters || []).some(entry => entry.id === previous)) {
      select.value = previous;
    } else {
      select.value = "";
    }

    const selectedId = select.value;
    const selectedChar = (account.characters || []).find(entry => entry.id === selectedId);
    if (elements.zenyCharacterValue) {
      elements.zenyCharacterValue.value = selectedChar ? formatNumber(selectedChar.zeny) : "";
      elements.zenyCharacterValue.disabled = !selectedChar;
    }
  }
}

function setActiveAccount(accountId) {
  if (!accountId) return;
  state.activeAccountId = accountId;
  saveState();
  updateZenyInputs();
  renderInventory();
  renderLoans();
  updateStats();
  renderAccountSelectors();
}

function setActiveSection(sectionId) {
  const sections = Array.from(document.querySelectorAll("[data-section]"));
  const sectionLinks = Array.from(document.querySelectorAll("[data-section-link]"));
  if (!sections.length) return;
  const target = sections.find(section => section.id === sectionId) || sections[0];
  sections.forEach(section => {
    section.classList.toggle("is-active", section === target);
  });
  sectionLinks.forEach(link => {
    link.classList.toggle("is-active", link.dataset.sectionLink === target.id);
  });
  localStorage.setItem(SECTION_KEY, target.id);
}

function initSections() {
  const sections = Array.from(document.querySelectorAll("[data-section]"));
  const sectionLinks = Array.from(document.querySelectorAll("[data-section-link]"));
  if (!sections.length || !sectionLinks.length) return;
  const saved = localStorage.getItem(SECTION_KEY);
  setActiveSection(saved || sections[0].id);
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-section-link]");
    if (!link) return;
    setActiveSection(link.dataset.sectionLink);
  });
}

function getActiveAccount() {
  if (!Array.isArray(state.accounts) || !state.accounts.length) {
    const fallback = normalizeAccount({ name: "Main" }, "Main");
    state.accounts = [fallback];
    state.activeAccountId = fallback.id;
    saveState();
  }
  let account = state.accounts.find(acc => acc.id === state.activeAccountId);
  if (!account) {
    state.activeAccountId = state.accounts[0].id;
    account = state.accounts[0];
    saveState();
  }
  if (!Array.isArray(account.vending)) {
    account.vending = [];
  }
  if (!Array.isArray(account.characters)) {
    account.characters = [];
  }
  if (!Array.isArray(account.loans)) {
    account.loans = [];
  }
  return account;
}

function getAccountZenyTotal(account) {
  const base = Object.values(account.zeny || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const charZeny = (account.characters || []).reduce((sum, char) => sum + (Number(char.zeny) || 0), 0);
  return base + charZeny;
}

function getAccountItemsOwned(account) {
  return (account.items || []).reduce((sum, entry) => sum + (Number(entry.qty) || 0), 0);
}

function getAllAccountsZenyTotal() {
  return (state.accounts || []).reduce((sum, account) => sum + getAccountZenyTotal(account), 0);
}

function formatZeny(value) {
  const num = Number(value) || 0;
  return `${formatNumber(num)} z`;
}

function formatLoanDate(value) {
  if (!value) return "Unknown";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}

function toBase64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const SHARE_CODE_PREFIX = "RKL1.";

function encodeSharePayloadLegacy(payload) {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return toBase64Url(bytes);
}

async function encodeSharePayload(payload) {
  if (!("CompressionStream" in window)) {
    return encodeSharePayloadLegacy(payload);
  }
  const json = JSON.stringify(payload);
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"));
  const buffer = await new Response(stream).arrayBuffer();
  return `${SHARE_CODE_PREFIX}${toBase64Url(new Uint8Array(buffer))}`;
}

function decodeSharePayloadLegacy(code) {
  const trimmed = (code || "").trim();
  if (!trimmed) return null;
  const bytes = fromBase64Url(trimmed);
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

async function decodeSharePayload(code) {
  const trimmed = (code || "").trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith(SHARE_CODE_PREFIX) || !("DecompressionStream" in window)) {
    return decodeSharePayloadLegacy(trimmed);
  }
  const payload = trimmed.slice(SHARE_CODE_PREFIX.length);
  const bytes = fromBase64Url(payload);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  const buffer = await new Response(stream).arrayBuffer();
  const json = new TextDecoder().decode(buffer);
  return JSON.parse(json);
}

function getBasisPrice(item) {
  if (!item) return 0;
  return 0;
}

function getItemIcon(id) {
  return "./assets/item-placeholder.svg";
}

const GROUP_ORDER = ["Cards", "Equipment", "Weapons", "Consumables", "Misc"];
const GROUP_COLORS = {
  Cards: "#d6a85c",
  Equipment: "#4cc9a8",
  Weapons: "#6c8dff",
  Consumables: "#f08a5d",
  Misc: "#9aa4b1"
};

const TAX_THRESHOLD = 10_000_000;
const TAX_RATE = 0.05;
const VENDING_STALE_TIERS = [3, 7, 14];

function calcServerTax(unitPrice, qty = 1) {
  if (unitPrice > TAX_THRESHOLD) {
    return Math.round(unitPrice * qty * TAX_RATE);
  }
  return 0;
}

function getDaysSince(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

const OCR_CONFIG = {
  workerPath: "./assets/ocr/worker.min.js",
  corePath: "./assets/ocr/tesseract-core.wasm.js",
  langPath: "./assets/ocr/lang"
};

const nameIndex = new Map();
const cardIndex = [];

function normalizeName(value) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

ITEMS.forEach(item => {
  const norm = normalizeName(item.name);
  if (norm) {
    nameIndex.set(norm, item.id);
    if (norm.endsWith(" card")) {
      const base = norm.replace(/\s+card$/, "");
      const tokens = base.split(" ").filter(token => token.length > 1);
      cardIndex.push({ id: item.id, base, tokens: new Set(tokens) });
    }
  }
});

function classifyItem(item) {
  const type = (item.type || "").toLowerCase();
  const category = (item.category || "").toLowerCase();
  const name = (item.name || "").toLowerCase();
  if (type === "card" || category.includes("card") || name.endsWith(" card")) return "Cards";
  if (type === "weapon") return "Weapons";
  if (type === "equipment") return "Equipment";
  if (type === "consumable") return "Consumables";
  return "Misc";
}

function isRefinableItem(item) {
  const type = (item?.type || "").toLowerCase();
  if (type === "weapon" || type === "equipment") return true;
  const category = (item?.category || "").toLowerCase();
  return category.includes("weapon") || category.includes("armor") || category.includes("equipment");
}

function getInventoryFilters() {
  return {
    group: state.inventoryGroup || "All",
    query: (state.inventorySearch || "").trim().toLowerCase()
  };
}

function buildGroupBuckets(filters = getInventoryFilters()) {
  const buckets = new Map();
  const account = getActiveAccount();
  (account.items || []).forEach(entry => {
    const item = itemsById.get(entry.id);
    if (!item) return;
    const group = classifyItem(item);
    if (filters.group !== "All" && group !== filters.group) return;
    if (filters.query && (!item.name || !item.name.toLowerCase().includes(filters.query))) return;
    if (!buckets.has(group)) {
      buckets.set(group, {
        name: group,
        entries: [],
        entryCount: 0,
        qtyCount: 0,
        valueSum: 0
      });
    }
    const bucket = buckets.get(group);
    const basePrice = getBasisPrice(item);
    const price = entry.override != null ? Number(entry.override) : basePrice;
    const qty = Number(entry.qty) || 0;
    bucket.entries.push({ entry, item, basePrice, price, qty });
    bucket.entryCount += 1;
    bucket.qtyCount += qty;
    bucket.valueSum += price * qty;
  });
  return buckets;
}

function buildGroupSummary() {
  const buckets = new Map();
  const account = getActiveAccount();
  (account.items || []).forEach(entry => {
    const item = itemsById.get(entry.id);
    if (!item) return;
    const group = classifyItem(item);
    if (!buckets.has(group)) {
      buckets.set(group, {
        name: group,
        entryCount: 0,
        qtyCount: 0,
        valueSum: 0
      });
    }
    const bucket = buckets.get(group);
    const basePrice = getBasisPrice(item);
    const price = entry.override != null ? Number(entry.override) : basePrice;
    const qty = Number(entry.qty) || 0;
    bucket.entryCount += 1;
    bucket.qtyCount += qty;
    bucket.valueSum += price * qty;
  });
  return buckets;
}

function renderGroupFilters() {
  if (!elements.groupFilter) return;
  elements.groupFilter.innerHTML = "";
  const summary = buildGroupSummary();
  const account = getActiveAccount();
  const totalEntries = (account.items || []).length;
  const groupNames = ["All", ...GROUP_ORDER, ...[...summary.keys()].filter(name => !GROUP_ORDER.includes(name)).sort()];

  groupNames.forEach(name => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "group-pill";
    const count = name === "All" ? totalEntries : (summary.get(name)?.entryCount || 0);
    btn.textContent = `${name} (${count})`;
    btn.dataset.group = name;
    btn.classList.toggle("active", state.inventoryGroup === name);
    btn.disabled = name !== "All" && count === 0;
    btn.addEventListener("click", () => {
      state.inventoryGroup = name;
      saveState();
      renderInventory();
    });
    elements.groupFilter.append(btn);
  });
}

function renderOverview() {
  if (!elements.groupChart || !elements.topItems) return;

  const summary = buildGroupSummary();
  const totalValue = [...summary.values()].reduce((sum, bucket) => sum + bucket.valueSum, 0);
  const rows = [...summary.values()].filter(bucket => bucket.valueSum > 0);
  rows.sort((a, b) => b.valueSum - a.valueSum);

  elements.groupChart.innerHTML = "";
  if (!rows.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "Add items to see your portfolio breakdown.";
    elements.groupChart.append(note);
  } else {
    rows.forEach(bucket => {
      const pct = totalValue ? Math.round((bucket.valueSum / totalValue) * 100) : 0;
      const row = document.createElement("div");
      row.className = "chart-row";
      row.innerHTML = `
        <div class="chart-label">${bucket.name}</div>
        <div class="chart-bar" style="--pct:${pct}%; --bar:${GROUP_COLORS[bucket.name] || "#8892a6"}">
          <span></span>
        </div>
        <div class="chart-value">${formatZeny(bucket.valueSum)}</div>
      `;
      elements.groupChart.append(row);
    });
  }

  const account = getActiveAccount();
  const top = (account.items || [])
    .map(entry => {
      const item = itemsById.get(entry.id);
      if (!item) return null;
      const basePrice = getBasisPrice(item);
      const price = entry.override != null ? Number(entry.override) : basePrice;
      const qty = Number(entry.qty) || 0;
      return {
        id: entry.id,
        name: item.name,
        qty,
        total: price * qty,
        type: item.type,
        category: item.category
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  elements.topItems.innerHTML = "";
  if (!top.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "No holdings yet.";
    elements.topItems.append(note);
  } else {
    top.forEach(item => {
      const row = document.createElement("div");
      row.className = "top-item";
      row.innerHTML = `
        <img src="${getItemIcon(item.id)}" alt="${item.name}">
        <div class="top-item-info">
          <strong>${item.name}</strong>
          <small>${item.type || "Unknown"}${item.category ? ` • ${item.category}` : ""}</small>
        </div>
        <div class="top-item-meta">
          <span>x${item.qty}</span>
          <strong>${formatZeny(item.total)}</strong>
        </div>
      `;
      elements.topItems.append(row);
    });
  }
}

let lastOcrBlob = null;
let pendingOcrItems = [];
let pendingOcrUnknown = [];

function setOcrStatus(text) {
  if (!elements.ocrStatus) return;
  elements.ocrStatus.textContent = text;
}

function setOcrPreview(blob) {
  if (!elements.ocrPreview) return;
  elements.ocrPreview.innerHTML = "";
  if (!blob) return;
  const img = document.createElement("img");
  img.src = URL.createObjectURL(blob);
  img.alt = "OCR Preview";
  elements.ocrPreview.append(img);
}

function matchLineToItem(line) {
  const normalized = normalizeName(line);
  if (!normalized) return null;
  const direct = nameIndex.get(normalized);
  if (direct) return direct;

  if (normalized.endsWith(" card")) {
    const base = normalized.replace(/\s+card$/, "");
    const byBase = nameIndex.get(`${base} card`);
    if (byBase) return byBase;
    const tokens = base.split(" ").filter(token => token.length > 1);
    let bestId = null;
    let bestScore = 0;
    for (const card of cardIndex) {
      let score = 0;
      tokens.forEach(token => {
        if (card.tokens.has(token)) score += 1;
      });
      if (score > bestScore) {
        bestScore = score;
        bestId = card.id;
      }
    }
    if (bestId && bestScore >= Math.max(2, Math.ceil(tokens.length * 0.6))) {
      return bestId;
    }
  }

  if (normalized.includes(" card")) {
    const base = normalized.replace(/\s*card.*$/, "").trim();
    const candidate = nameIndex.get(`${base} card`);
    if (candidate) return candidate;
  }

  return null;
}

function parseOcrText(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const found = new Map();
  const unknown = [];

  lines.forEach(line => {
    if (line.length < 2) return;
    const matchId = matchLineToItem(line);
    if (matchId) {
      found.set(matchId, (found.get(matchId) || 0) + 1);
    } else {
      unknown.push({ raw: line, manual: line, id: null, qty: 1 });
    }
  });

  const items = [...found.entries()].map(([id, qty]) => {
    const item = itemsById.get(id);
    return { id, name: item?.name || "Unknown", qty, raw: item?.name || "" };
  });

  return { items, unknown };
}

function findClosestItems(query, limit = 6) {
  const norm = normalizeName(query);
  if (!norm) return [];
  const tokens = new Set(norm.split(" ").filter(Boolean));
  const results = [];
  ITEMS.forEach(item => {
    const name = item.name || "";
    const normName = normalizeName(name);
    if (!normName) return;
    const nameTokens = new Set(normName.split(" ").filter(Boolean));
    let score = 0;
    tokens.forEach(token => {
      if (nameTokens.has(token)) score += 2;
    });
    if (normName.includes(norm)) score += 3;
    if (norm.startsWith(normName) || normName.startsWith(norm)) score += 1;
    if (score > 0) {
      results.push({ id: item.id, name, score });
    }
  });
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

function renderOcrModal() {
  if (!elements.ocrModal || !elements.ocrItems || !elements.ocrUnknown) return;
  elements.ocrItems.innerHTML = "";
  elements.ocrUnknown.innerHTML = "";

  if (elements.ocrSummary) {
    elements.ocrSummary.textContent = `We found ${pendingOcrItems.length} items. Fix names or pick a suggestion.`;
  }

  if (!pendingOcrItems.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "No recognizable items found.";
    elements.ocrItems.append(note);
  } else {
    pendingOcrItems.forEach(item => {
      const row = document.createElement("div");
      row.className = "ocr-item-row";
      row.innerHTML = `
        <div class="ocr-item-cell">
          <input type="text" value="${item.manual}">
          <div class="ocr-suggestions"></div>
        </div>
        <input type="number" min="1" value="${item.qty}">
      `;
      const nameInput = row.querySelector("input[type=\"text\"]");
      const qtyInput = row.querySelector("input[type=\"number\"]");
      const suggestions = row.querySelector(".ocr-suggestions");

      const renderSuggestions = () => {
        suggestions.innerHTML = "";
        const list = findClosestItems(nameInput.value);
        list.forEach(suggestion => {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "ocr-chip";
          chip.textContent = suggestion.name;
          chip.addEventListener("click", () => {
            nameInput.value = suggestion.name;
            item.manual = suggestion.name;
            item.id = suggestion.id;
            item.name = suggestion.name;
            renderSuggestions();
          });
          suggestions.append(chip);
        });
      };

      nameInput.addEventListener("input", () => {
        item.manual = nameInput.value;
        const matchId = matchLineToItem(nameInput.value);
        if (matchId) {
          item.id = matchId;
          const matched = itemsById.get(matchId);
          if (matched) item.name = matched.name;
        }
        renderSuggestions();
      });

      qtyInput.addEventListener("input", () => {
        item.qty = Math.max(1, Number(qtyInput.value) || 1);
        qtyInput.value = item.qty;
      });

      renderSuggestions();
      elements.ocrItems.append(row);
    });
  }

  const unknownHeader = document.createElement("div");
  unknownHeader.className = "ocr-unknown-header";
  unknownHeader.textContent = "Unmatched Lines (click to fix)";
  elements.ocrUnknown.append(unknownHeader);

  if (!pendingOcrUnknown.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "No unmatched lines.";
    elements.ocrUnknown.append(note);
  } else {
    const list = document.createElement("div");
    list.className = "ocr-unknown-list";
    pendingOcrUnknown.forEach(entry => {
      const row = document.createElement("div");
      row.className = "ocr-unknown-row";
      row.innerHTML = `
        <div class="ocr-item-cell">
          <input type="text" value="${entry.manual}">
          <div class="ocr-suggestions"></div>
        </div>
        <input type="number" min="1" value="${entry.qty}">
        <button type="button" class="ocr-add-btn" disabled>Add</button>
      `;
      const nameInput = row.querySelector("input[type=\"text\"]");
      const qtyInput = row.querySelector("input[type=\"number\"]");
      const addBtn = row.querySelector(".ocr-add-btn");
      const suggestions = row.querySelector(".ocr-suggestions");

      const updateAddState = () => {
        addBtn.disabled = !entry.id;
      };

      const renderSuggestions = () => {
        suggestions.innerHTML = "";
        const list = findClosestItems(nameInput.value);
        list.forEach(suggestion => {
          const chip = document.createElement("button");
          chip.type = "button";
          chip.className = "ocr-chip";
          chip.textContent = suggestion.name;
          chip.addEventListener("click", () => {
            nameInput.value = suggestion.name;
            entry.manual = suggestion.name;
            entry.id = suggestion.id;
            updateAddState();
            renderSuggestions();
          });
          suggestions.append(chip);
        });
      };

      nameInput.addEventListener("input", () => {
        entry.manual = nameInput.value;
        const matchId = matchLineToItem(nameInput.value);
        entry.id = matchId || null;
        updateAddState();
        renderSuggestions();
      });

      qtyInput.addEventListener("input", () => {
        entry.qty = Math.max(1, Number(qtyInput.value) || 1);
        qtyInput.value = entry.qty;
      });

      addBtn.addEventListener("click", () => {
        if (!entry.id) return;
        const existing = pendingOcrItems.find(item => item.id === entry.id);
        if (existing) {
          existing.qty += entry.qty;
        } else {
          const item = itemsById.get(entry.id);
          pendingOcrItems.push({
            id: entry.id,
            name: item?.name || entry.manual,
            manual: item?.name || entry.manual,
            qty: entry.qty
          });
        }
        pendingOcrUnknown = pendingOcrUnknown.filter(item => item !== entry);
        renderOcrModal();
      });

      renderSuggestions();
      updateAddState();
      list.append(row);
    });
    elements.ocrUnknown.append(list);
  }
}

function showOcrModal(result) {
  if (!elements.ocrModal) return;
  pendingOcrItems = result.items.map(item => ({ ...item, manual: item.name }));
  pendingOcrUnknown = result.unknown.map(line => ({ ...line }));
  renderOcrModal();
  elements.ocrModal.classList.add("active");
  elements.ocrModal.setAttribute("aria-hidden", "false");
}

function hideOcrModal() {
  if (!elements.ocrModal) return;
  elements.ocrModal.classList.remove("active");
  elements.ocrModal.setAttribute("aria-hidden", "true");
  pendingOcrItems = [];
}

function applyOcrImport() {
  const account = getActiveAccount();
  pendingOcrItems.forEach(item => {
    if (!item.id) {
      const matchId = matchLineToItem(item.manual || "");
      if (matchId) item.id = matchId;
    }
    if (!item.id) return;
    const existing = account.items.find(entry => entry.id === item.id);
    if (existing) {
      existing.qty = (Number(existing.qty) || 0) + item.qty;
    } else {
      account.items.push({ id: item.id, qty: item.qty, override: null, refine: 0 });
    }
  });
  saveState();
  renderInventory();
  hideOcrModal();
  setOcrStatus("Import complete.");
}

async function runOcr(blob) {
  if (!blob) return;
  if (!window.Tesseract) {
    setOcrStatus("OCR library failed to load.");
    return;
  }
  setOcrStatus("Scanning image...");
  try {
    const result = await window.Tesseract.recognize(blob, "eng", {
      ...OCR_CONFIG,
      logger: (m) => {
        if (m.status && m.progress != null) {
          setOcrStatus(`${m.status} ${(m.progress * 100).toFixed(0)}%`);
        }
      }
    });
    const parsed = parseOcrText(result.data.text || "");
    showOcrModal(parsed);
    setOcrStatus("Review results below.");
  } catch (error) {
    setOcrStatus("OCR failed. Try a clearer screenshot.");
  }
}

function handleOcrImage(blob) {
  lastOcrBlob = blob;
  setOcrPreview(blob);
  runOcr(blob);
}

function updateMeta() {
  if (elements.metaUpdated) {
    elements.metaUpdated.textContent = META.updatedAt ? new Date(META.updatedAt).toLocaleString() : "Local";
  }
  if (elements.metaCount) {
    elements.metaCount.textContent = META.count ? META.count.toLocaleString("en-US") : ITEMS.length.toLocaleString("en-US");
  }
}

function updateZenyInputs() {
  const account = getActiveAccount();
  Object.entries(zenyInputs).forEach(([key, input]) => {
    input.value = formatNumber(account.zeny[key] || 0);
  });
}

function updateStats() {
  const account = getActiveAccount();
  const totalZeny = getAccountZenyTotal(account);
  const allZeny = getAllAccountsZenyTotal();
  const inventoryValue = (account.items || []).reduce((sum, itemEntry) => {
    const item = itemsById.get(itemEntry.id);
    const basePrice = getBasisPrice(item);
    const price = itemEntry.override != null ? Number(itemEntry.override) : basePrice;
    return sum + price * (Number(itemEntry.qty) || 0);
  }, 0);
  const netWorth = totalZeny + inventoryValue;
  const itemsOwned = getAccountItemsOwned(account);

  elements.totalZeny.textContent = formatZeny(totalZeny);
  if (elements.totalZenyAll) {
    elements.totalZenyAll.textContent = formatZeny(allZeny);
  }
  elements.inventoryValue.textContent = formatZeny(inventoryValue);
  elements.netWorth.textContent = formatZeny(netWorth);
  elements.itemsOwned.textContent = itemsOwned.toLocaleString("en-US");
  elements.inventorySummary.textContent = `${(account.items || []).length} entries • ${itemsOwned} items`;
  updateGroupTotals();
  renderOverview();
  renderAccounts();
  renderAccountSelectors();
  renderCharacters();
  renderVending();
  renderGlobalSearchResults();
}

function renderAccounts() {
  if (!elements.accountList) return;
  const account = getActiveAccount();
  elements.accountList.innerHTML = "";

  if (!state.accounts.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "No accounts yet.";
    elements.accountList.append(note);
    return;
  }

  state.accounts.forEach(acc => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "account-pill";
    if (acc.id === account.id) btn.classList.add("active");
    const totalZeny = getAccountZenyTotal(acc);
    const itemsOwned = getAccountItemsOwned(acc);
    btn.innerHTML = `
      <strong>${acc.name}</strong>
      <span>${formatZeny(totalZeny)} • ${itemsOwned.toLocaleString("en-US")} items</span>
    `;
    btn.addEventListener("click", () => {
      setActiveAccount(acc.id);
    });
    elements.accountList.append(btn);
  });

  if (elements.accountDelete) {
    elements.accountDelete.disabled = state.accounts.length <= 1;
  }

  if (elements.accountName && document.activeElement !== elements.accountName) {
    elements.accountName.value = account?.name || "";
  }
}

function renderGlobalSearchResults() {
  if (!elements.globalResults || !elements.globalSearch) return;
  const query = elements.globalSearch.value.trim().toLowerCase();
  elements.globalResults.innerHTML = "";

  if (query.length < 2) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "Type at least 2 characters to search across accounts.";
    elements.globalResults.append(note);
    return;
  }

  const groups = [];
  state.accounts.forEach(acc => {
    const hits = [];
    (acc.items || []).forEach(entry => {
      const item = itemsById.get(entry.id);
      if (!item || !item.name) return;
      if (!item.name.toLowerCase().includes(query)) return;
      const basePrice = getBasisPrice(item);
      const price = entry.override != null ? Number(entry.override) : basePrice;
      const qty = Number(entry.qty) || 0;
      hits.push({
        id: entry.id,
        name: item.name,
        qty,
        total: price * qty
      });
    });
    if (hits.length) {
      hits.sort((a, b) => b.total - a.total);
      groups.push({ account: acc, hits });
    }
  });

  if (!groups.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "No matching items across accounts.";
    elements.globalResults.append(note);
    return;
  }

  groups.forEach(group => {
    const wrapper = document.createElement("div");
    wrapper.className = "global-account";

    const header = document.createElement("div");
    header.className = "global-account-header";
    const title = document.createElement("strong");
    title.textContent = group.account.name;
    const meta = document.createElement("span");
    meta.textContent = `${group.hits.length} item${group.hits.length === 1 ? "" : "s"} found`;
    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.textContent = "Open";
    openBtn.addEventListener("click", () => {
      state.activeAccountId = group.account.id;
      saveState();
      updateZenyInputs();
      renderInventory();
      renderAccounts();
    });
    header.append(title, meta, openBtn);

    const list = document.createElement("div");
    list.className = "global-account-items";

    group.hits.slice(0, 8).forEach(hit => {
      const row = document.createElement("div");
      row.className = "global-item";
      const img = document.createElement("img");
      img.src = getItemIcon(hit.id);
      img.alt = hit.name;
      const info = document.createElement("div");
      info.innerHTML = `<strong>${hit.name}</strong><br><small>x${hit.qty} • ${formatZeny(hit.total)}</small>`;
      const qty = document.createElement("div");
      qty.className = "value-tag";
      qty.textContent = `x${hit.qty}`;
      row.append(img, info, qty);
      list.append(row);
    });

    if (group.hits.length > 8) {
      const more = document.createElement("div");
      more.className = "muted";
      more.textContent = `+${group.hits.length - 8} more items`;
      list.append(more);
    }

    wrapper.append(header, list);
    elements.globalResults.append(wrapper);
  });
}

function renderCharacters() {
  if (!elements.characterList || !elements.characterCount) return;
  const account = getActiveAccount();
  const list = Array.isArray(account.characters) ? account.characters : [];
  elements.characterList.innerHTML = "";
  elements.characterCount.textContent = `${list.length}/7`;

  if (!list.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "No characters yet.";
    elements.characterList.append(note);
    return;
  }

  list.forEach((character) => {
    const row = document.createElement("div");
    row.className = "character-row";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = character.name;
    nameInput.addEventListener("input", () => {
      character.name = nameInput.value.trim() || character.name;
      saveState();
      renderAccounts();
    });

    const zenyInput = document.createElement("input");
    zenyInput.value = formatNumber(character.zeny);
    setupNumericInput(zenyInput);
    zenyInput.addEventListener("input", () => {
      character.zeny = Math.max(0, parseNumber(zenyInput.value));
      saveState();
      updateStats();
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      account.characters = account.characters.filter(entry => entry.id !== character.id);
      saveState();
      renderCharacters();
      updateStats();
    });

    row.append(nameInput, zenyInput, removeBtn);
    elements.characterList.append(row);
  });
}

function moveVendingStall(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const account = getActiveAccount();
  const list = Array.isArray(account.vending) ? account.vending : [];
  const fromIndex = list.findIndex(stall => stall.id === sourceId);
  const toIndex = list.findIndex(stall => stall.id === targetId);
  if (fromIndex < 0 || toIndex < 0) return;
  const [moved] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, moved);
  saveState();
  renderVending();
}

function renderVending() {
  if (!elements.vendingList) return;
  const account = getActiveAccount();
  const stalls = Array.isArray(account.vending) ? account.vending : [];
  elements.vendingList.innerHTML = "";

  if (!stalls.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "No vending open yet.";
    elements.vendingList.append(note);
    return;
  }

  stalls.forEach(stall => {
    const card = document.createElement("div");
    card.className = "vending-card";
    card.draggable = true;
    card.dataset.vendingId = stall.id;
    card.addEventListener("dragstart", (event) => {
      if (event.target.closest("input,button")) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData("text/plain", stall.id);
      event.dataTransfer.effectAllowed = "move";
    });
    card.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });
    card.addEventListener("drop", (event) => {
      event.preventDefault();
      const sourceId = event.dataTransfer.getData("text/plain");
      moveVendingStall(sourceId, stall.id);
    });

    const header = document.createElement("div");
    header.className = "vending-card-header";
    const titleWrap = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = stall.character;
    const meta = document.createElement("span");
    const updateStallMeta = () => {
      const totalSlots = stall.items.length;
      const totalQty = stall.items.reduce((sum, entry) => sum + (Number(entry.qty) || 0), 0);
      const totalValue = stall.items.reduce((sum, entry) => sum + (Number(entry.qty) || 0) * (Number(entry.price) || 0), 0);
      meta.textContent = `${totalSlots}/12 slots • ${totalQty} items • ${formatZeny(totalValue)}`;
    };
    updateStallMeta();
    titleWrap.append(title, meta);

    const warning = document.createElement("div");
    warning.className = "vending-warning";
    const sales = Array.isArray(stall.sales) ? stall.sales : [];
    const lastSale = sales.length ? sales[0].soldAt : "";
    const daysSince = getDaysSince(lastSale);
    if (stall.items.length > 0) {
      if (!sales.length) {
        warning.textContent = "No sales yet.";
      } else if (daysSince != null) {
        const tier = [...VENDING_STALE_TIERS].sort((a, b) => b - a).find((d) => daysSince >= d);
        if (tier != null) {
          warning.textContent = `No sales for ${daysSince} days.`;
        }
      }
    }

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => {
      account.vending = account.vending.filter(entry => entry.id !== stall.id);
      saveState();
      renderVending();
    });
    if (warning.textContent) {
      titleWrap.append(warning);
    }
    header.append(titleWrap, closeBtn);

    const itemsWrap = document.createElement("div");
    itemsWrap.className = "vending-items";

    if (!stall.items.length) {
      const empty = document.createElement("div");
      empty.className = "result-note";
      empty.textContent = "No items in this vending yet.";
      itemsWrap.append(empty);
    } else {
      stall.items.forEach(entry => {
        const item = itemsById.get(entry.id);
        const row = document.createElement("div");
        row.className = "vending-item-row";

        const img = document.createElement("img");
        img.src = getItemIcon(entry.id);
        img.alt = item?.name || "Item";

        const info = document.createElement("div");
        info.innerHTML = `<strong>${item?.name || "Unknown Item"}</strong><br><small>${item?.type || "Unknown"}${item?.category ? ` • ${item.category}` : ""}</small>`;

      const qtyInput = document.createElement("input");
      qtyInput.type = "number";
      qtyInput.min = "1";
      qtyInput.value = entry.qty;
        qtyInput.addEventListener("input", () => {
          entry.qty = Math.max(1, Number(qtyInput.value) || 1);
          qtyInput.value = entry.qty;
          totalTag.textContent = formatZeny((Number(entry.qty) || 0) * (Number(entry.price) || 0));
          saveState();
          updateStallMeta();
        });

      const priceInput = document.createElement("input");
      priceInput.placeholder = "Price";
      priceInput.value = formatNumber(entry.price);
      setupNumericInput(priceInput, { allowEmpty: true });
      priceInput.addEventListener("input", () => {
        entry.price = Math.max(0, parseNumber(priceInput.value));
        totalTag.textContent = formatZeny((Number(entry.qty) || 0) * (Number(entry.price) || 0));
        saveState();
        updateStallMeta();
      });

        const totalTag = document.createElement("div");
        totalTag.className = "value-tag";
        totalTag.textContent = formatZeny((Number(entry.qty) || 0) * (Number(entry.price) || 0));

        const actions = document.createElement("div");
        actions.className = "vending-actions";
        const sellBtn = document.createElement("button");
        sellBtn.type = "button";
        sellBtn.className = "sell";
        sellBtn.textContent = "Sell";
        sellBtn.addEventListener("click", () => {
          const qty = Math.max(1, Number(entry.qty) || 1);
          const price = Math.max(0, Number(entry.price) || 0);
          const totalSale = qty * price;
          const tax = calcServerTax(price, qty);
          const net = Math.max(0, totalSale - tax);
          stall.sales = Array.isArray(stall.sales) ? stall.sales : [];
          stall.sales.unshift({
            id: entry.id,
            qty,
            price,
            soldAt: new Date().toISOString(),
            tax,
            net
          });
          stall.items = stall.items.filter(itemEntry => itemEntry !== entry);
          saveState();
          renderVending();
        });
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "remove";
        removeBtn.textContent = "Remove";
        removeBtn.addEventListener("click", () => {
          stall.items = stall.items.filter(itemEntry => itemEntry !== entry);
          saveState();
          renderVending();
        });
        actions.append(sellBtn, removeBtn);

        row.append(img, info, qtyInput, priceInput, totalTag, actions);
        itemsWrap.append(row);
      });
    }

    const salesWrap = document.createElement("div");
    salesWrap.className = "vending-sales";
    if (sales.length) {
      const totals = sales.reduce((acc, sale) => {
        const total = (Number(sale.price) || 0) * (Number(sale.qty) || 0);
        acc.total += total;
        acc.tax += Number(sale.tax) || 0;
        acc.net += Number(sale.net) || 0;
        return acc;
      }, { total: 0, tax: 0, net: 0 });

      const meta = document.createElement("div");
      meta.className = "vending-sale-meta";
      meta.textContent = `Sales: ${formatZeny(totals.total)} • Tax: ${formatZeny(totals.tax)} • Net: ${formatZeny(totals.net)}`;
      salesWrap.append(meta);

      const headerRow = document.createElement("div");
      headerRow.className = "vending-sale-row";
      headerRow.innerHTML = `<strong>Sold Item</strong><span class="muted">Price</span><span class="muted">Tax</span><span class="muted">Net</span>`;
      salesWrap.append(headerRow);

      sales.slice(0, 10).forEach(sale => {
        const item = itemsById.get(sale.id);
        const row = document.createElement("div");
        row.className = "vending-sale-row";
        const info = document.createElement("div");
        const soldTime = sale.soldAt ? new Date(sale.soldAt).toLocaleString() : "Sold";
        info.innerHTML = `<strong>${item?.name || "Unknown Item"}</strong><br><small>${soldTime} • x${sale.qty} • ${formatZeny((Number(sale.price) || 0) * (Number(sale.qty) || 0))}</small>`;
        const price = document.createElement("div");
        price.className = "value-tag";
        price.textContent = formatZeny(Number(sale.price) || 0);
        const tax = document.createElement("div");
        tax.className = "value-tag";
        tax.textContent = formatZeny(Number(sale.tax) || 0);
        const net = document.createElement("div");
        net.className = "value-tag";
        net.textContent = formatZeny(Number(sale.net) || 0);
        row.append(info, price, tax, net);
        salesWrap.append(row);
      });

      if (sales.length > 10) {
        const more = document.createElement("div");
        more.className = "muted";
        more.textContent = `+${sales.length - 10} more sales`;
        salesWrap.append(more);
      }
    }

    const addBlock = document.createElement("div");
    addBlock.className = "vending-add";
    const addRow = document.createElement("div");
    addRow.className = "vending-add-row";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Item name...";
    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.value = 1;
    const priceInput = document.createElement("input");
    priceInput.placeholder = "Price";
    setupNumericInput(priceInput, { allowEmpty: true });
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "ghost";
    addBtn.textContent = "Add";
    addRow.append(nameInput, qtyInput, priceInput, addBtn);

    const suggestions = document.createElement("div");
    suggestions.className = "vending-suggestions";
    const status = document.createElement("div");
    status.className = "vending-status";

    let selectedId = null;

    const renderSuggestions = () => {
      suggestions.innerHTML = "";
      const list = findClosestItems(nameInput.value, 6);
      list.forEach(suggestion => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "ocr-chip";
        chip.textContent = suggestion.name;
        chip.addEventListener("click", () => {
          nameInput.value = suggestion.name;
          selectedId = suggestion.id;
          renderSuggestions();
        });
        suggestions.append(chip);
      });
    };

    nameInput.addEventListener("input", () => {
      selectedId = matchLineToItem(nameInput.value);
      status.textContent = "";
      renderSuggestions();
    });

    addBtn.addEventListener("click", () => {
      const qty = Math.max(1, Number(qtyInput.value) || 1);
      const price = Math.max(0, parseNumber(priceInput.value));
      if (!selectedId) {
        selectedId = matchLineToItem(nameInput.value);
      }
      if (!selectedId) {
        status.textContent = "Pick a valid item from suggestions.";
        return;
      }
      const existing = stall.items.find(itemEntry => itemEntry.id === selectedId);
      const isNew = !existing;
      if (isNew && stall.items.length >= 12) {
        status.textContent = "This vending already has 12 items.";
        return;
      }
      if (existing) {
        existing.qty += qty;
        if (priceInput.value !== "") {
          existing.price = price;
        }
      } else {
        stall.items.push({ id: selectedId, qty, price });
      }

      const accountItem = account.items.find(itemEntry => itemEntry.id === selectedId);
      if (!accountItem) {
        account.items.push({ id: selectedId, qty, override: null, refine: 0 });
      } else if (accountItem.qty < qty) {
        accountItem.qty = qty;
      }

      saveState();
      nameInput.value = "";
      qtyInput.value = 1;
      priceInput.value = "";
      selectedId = null;
      status.textContent = "";
      renderInventory();
      renderVending();
    });

    addBlock.append(addRow, suggestions, status);

    if (salesWrap.childElementCount) {
      card.append(header, itemsWrap, salesWrap, addBlock);
    } else {
      card.append(header, itemsWrap, addBlock);
    }
    elements.vendingList.append(card);
  });
}

function setLoanStatus(message = "") {
  if (!elements.loanStatus) return;
  elements.loanStatus.textContent = message;
}

const shareDraft = {
  from: "",
  generalNote: "",
  items: []
};
let shareImportMatches = [];
let shareImportMeta = null;

function setShareStatus(message = "") {
  if (!elements.shareStatus) return;
  elements.shareStatus.textContent = message;
}

function saveShareDraft() {
  try {
    const payload = {
      from: shareDraft.from || "",
      generalNote: shareDraft.generalNote || "",
      items: shareDraft.items.map(entry => ({
        id: entry.id,
        name: entry.name,
        qty: entry.qty,
        price: entry.price != null ? entry.price : null,
        note: entry.note || ""
      }))
    };
    localStorage.setItem(SHARE_DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

function loadShareDraft() {
  try {
    const raw = localStorage.getItem(SHARE_DRAFT_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    shareDraft.from = String(parsed?.from || "");
    shareDraft.generalNote = String(parsed?.generalNote || "");
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    shareDraft.items = items
      .map((entry) => {
        const id = Number(entry.id);
        if (!Number.isFinite(id) || id <= 0) return null;
        const item = itemsById.get(id);
        return {
          id,
          name: item?.name || entry.name || "Unknown Item",
          qty: Math.max(1, Number(entry.qty) || 1),
          price: entry.price != null ? Number(entry.price) : null,
          note: String(entry.note || "")
        };
      })
      .filter(Boolean);
  } catch {
    // ignore invalid data
  }
}

function renderShareMeta() {
  if (!elements.shareMeta) return;
  elements.shareMeta.innerHTML = "";
  if (!shareImportMeta) return;

  const from = shareImportMeta.from ? `From: ${shareImportMeta.from}` : "";
  const note = shareImportMeta.note ? `Note: ${shareImportMeta.note}` : "";
  const created = shareImportMeta.createdAt ? `Created: ${formatLoanDate(shareImportMeta.createdAt)}` : "";

  const lines = [from, note, created].filter(Boolean);
  if (!lines.length) return;

  const box = document.createElement("div");
  box.className = "share-meta-box";
  lines.forEach((line) => {
    const row = document.createElement("div");
    row.textContent = line;
    box.append(row);
  });
  elements.shareMeta.append(box);
}

function renderShareGeneratedMeta(payload) {
  if (!elements.shareGeneratedMeta) return;
  elements.shareGeneratedMeta.innerHTML = "";
  if (!payload) return;
  const from = payload.from ? `From: ${payload.from}` : "";
  const note = payload.note ? `Note: ${payload.note}` : "";
  if (!from && !note) return;
  const box = document.createElement("div");
  box.className = "share-meta-box";
  if (from) {
    const row = document.createElement("div");
    row.textContent = from;
    box.append(row);
  }
  if (note) {
    const row = document.createElement("div");
    row.textContent = note;
    box.append(row);
  }
  elements.shareGeneratedMeta.append(box);
}

function renderShareList() {
  if (!elements.shareList) return;
  elements.shareList.innerHTML = "";
  if (!shareDraft.items.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "No items added yet.";
    elements.shareList.append(note);
    return;
  }

  shareDraft.items.forEach((entry) => {
    const item = itemsById.get(entry.id);
    const name = item?.name || entry.name || "Unknown Item";
    const row = document.createElement("div");
    row.className = "share-row";

    const img = document.createElement("img");
    img.src = getItemIcon(entry.id);
    img.alt = name;

    const info = document.createElement("div");
    info.className = "share-info";
    const title = document.createElement("strong");
    title.textContent = name;
    const meta = document.createElement("div");
    meta.className = "muted";
    meta.textContent = item?.type || "Unknown";
    info.append(title, meta);
    if (entry.note) {
      const note = document.createElement("div");
      note.className = "share-item-note";
      note.textContent = entry.note;
      info.append(note);
    }

    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.value = entry.qty;
    qtyInput.addEventListener("input", () => {
      entry.qty = Math.max(1, Number(qtyInput.value) || 1);
      qtyInput.value = entry.qty;
      saveShareDraft();
    });

    const priceInput = document.createElement("input");
    priceInput.placeholder = "Price";
    priceInput.value = entry.price != null ? formatNumber(entry.price) : "";
    setupNumericInput(priceInput, { allowEmpty: true });
    priceInput.addEventListener("input", () => {
      entry.price = parseOptionalNumber(priceInput.value);
      saveShareDraft();
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      shareDraft.items = shareDraft.items.filter(itemEntry => itemEntry !== entry);
      renderShareList();
      saveShareDraft();
    });

    row.append(img, info, qtyInput, priceInput, removeBtn);
    elements.shareList.append(row);
  });
}

function renderSharePreview(list = []) {
  if (!elements.sharePreview) return;
  elements.sharePreview.innerHTML = "";
  if (!list.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "No items to preview.";
    elements.sharePreview.append(note);
    return;
  }

  list.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "share-preview-row";
    const item = entry.itemId ? itemsById.get(entry.itemId) : null;
    const name = item?.name || entry.itemName || "Unknown Item";

    const img = document.createElement("img");
    img.src = entry.itemId ? getItemIcon(entry.itemId) : getItemIcon(0);
    img.alt = name;

    const info = document.createElement("div");
    info.className = "share-info";
    const title = document.createElement("strong");
    title.textContent = name;
    const meta = document.createElement("div");
    meta.className = "muted";
    meta.textContent = entry.itemId ? "Matched" : "Unknown";
    info.append(title, meta);
    if (entry.note) {
      const note = document.createElement("div");
      note.className = "share-item-note";
      note.textContent = entry.note;
      info.append(note);
    }

    const qty = document.createElement("div");
    qty.className = "value-tag";
    qty.textContent = `x${entry.qty}`;

    if (entry.price != null) {
      const price = document.createElement("div");
      price.className = "value-tag";
      price.textContent = formatZeny(entry.price);
      row.append(img, info, qty, price);
    } else {
      row.append(img, info, qty);
    }
    elements.sharePreview.append(row);
  });
}

function renderLoans() {
  if (!elements.loanList) return;
  const account = getActiveAccount();
  const loans = Array.isArray(account.loans) ? account.loans : [];
  const filter = elements.loanFilter ? elements.loanFilter.value : "all";
  const filtered = loans.filter(loan => {
    if (filter === "active") return loan.status !== "returned";
    if (filter === "returned") return loan.status === "returned";
    return true;
  });

  const activeCount = loans.filter(loan => loan.status !== "returned").length;
  const returnedCount = loans.filter(loan => loan.status === "returned").length;
  if (elements.loanSummary) {
    elements.loanSummary.textContent = `${loans.length} total • ${activeCount} active • ${returnedCount} returned`;
  }

  elements.loanList.innerHTML = "";
  if (!filtered.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "No loans yet.";
    elements.loanList.append(note);
    return;
  }

  filtered.forEach((loan) => {
    const item = loan.itemId ? itemsById.get(loan.itemId) : null;
    const itemName = item?.name || loan.itemName || "Unknown Item";
    const iconSrc = loan.itemId ? getItemIcon(loan.itemId) : getItemIcon(0);

    const row = document.createElement("div");
    row.className = "loan-row";

    const img = document.createElement("img");
    img.src = iconSrc;
    img.alt = itemName;

    const info = document.createElement("div");
    info.className = "loan-info";
    const statusLabel = loan.status === "returned" ? "Returned" : "Active";
    const given = formatLoanDate(loan.givenAt);
    const returned = loan.returnedAt ? formatLoanDate(loan.returnedAt) : "";
    const title = document.createElement("strong");
    title.textContent = itemName;
    const meta = document.createElement("div");
    meta.className = "loan-meta";
    meta.textContent = `To: ${loan.person} • Qty: x${loan.qty} • Given: ${given}${returned ? ` • Returned: ${returned}` : ""}`;
    const tags = document.createElement("div");
    tags.className = "loan-tags";
    const tag = document.createElement("span");
    tag.className = `loan-tag ${loan.status === "returned" ? "returned" : "active"}`;
    tag.textContent = statusLabel;
    tags.append(tag);
    info.append(title, meta, tags);
    if (loan.note) {
      const noteEl = document.createElement("div");
      noteEl.className = "loan-note";
      noteEl.textContent = loan.note;
      info.append(noteEl);
    }

    const actions = document.createElement("div");
    actions.className = "loan-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "ghost";
    toggleBtn.textContent = loan.status === "returned" ? "Reopen" : "Mark Returned";
    toggleBtn.addEventListener("click", () => {
      if (loan.status === "returned") {
        loan.status = "active";
        loan.returnedAt = "";
      } else {
        loan.status = "returned";
        loan.returnedAt = new Date().toISOString().slice(0, 10);
      }
      saveState();
      renderLoans();
    });

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "danger";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      account.loans = account.loans.filter(entry => entry.id !== loan.id);
      saveState();
      renderLoans();
    });

    actions.append(toggleBtn, removeBtn);
    row.append(img, info, actions);
    elements.loanList.append(row);
  });
}

function populateFilters() {
  const types = new Set();
  const categories = new Set();
  ITEMS.forEach(item => {
    if (item.type) types.add(item.type);
    if (item.category) categories.add(item.category);
  });
  [...types].sort().forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    elements.filterType.append(option);
  });
  [...categories].sort().forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.filterCategory.append(option);
  });
}

function renderSearchResults() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const typeFilter = elements.filterType.value;
  const categoryFilter = elements.filterCategory.value;

  elements.searchResults.innerHTML = "";
  if (query.length < 2) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "Type at least 2 characters to search.";
    elements.searchResults.append(note);
    return;
  }

  const matches = [];
  for (const item of ITEMS) {
    if (typeFilter && item.type !== typeFilter) continue;
    if (categoryFilter && item.category !== categoryFilter) continue;
    if (!item.name || !item.name.toLowerCase().includes(query)) continue;
    matches.push(item);
    if (matches.length >= 40) break;
  }

  if (!matches.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "No matching items.";
    elements.searchResults.append(note);
    return;
  }

  matches.forEach(item => {
    const card = document.createElement("div");
    card.className = "result-card";
    const icon = document.createElement("img");
    icon.src = getItemIcon(item.id);
    icon.alt = item.name;
    const info = document.createElement("div");
    info.className = "result-info";
    info.innerHTML = `<h4>${item.name}</h4><small>${item.type || "Unknown"}${item.category ? ` • ${item.category}` : ""}</small>`;
    const addBtn = document.createElement("button");
    addBtn.textContent = "Add";
    addBtn.addEventListener("click", () => addItem(item.id));
    card.append(icon, info, addBtn);
    elements.searchResults.append(card);
  });
}

function addItem(id) {
  const account = getActiveAccount();
  const existing = account.items.find(entry => entry.id === id);
  if (existing) {
    existing.qty = (Number(existing.qty) || 0) + 1;
  } else {
    account.items.push({ id, qty: 1, override: null, refine: 0 });
  }
  saveState();
  renderInventory();
}

function removeItem(id) {
  const account = getActiveAccount();
  account.items = account.items.filter(entry => entry.id !== id);
  saveState();
  renderInventory();
}

function renderInventory() {
  elements.inventoryList.innerHTML = "";
  renderGroupFilters();
  const account = getActiveAccount();
  if (!account.items.length) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "Inventory is empty.";
    elements.inventoryList.append(note);
    updateStats();
    return;
  }

  const filters = getInventoryFilters();
  const buckets = buildGroupBuckets(filters);
  let filteredEntries = 0;
  buckets.forEach(bucket => { filteredEntries += bucket.entryCount; });
  if (!filteredEntries) {
    const note = document.createElement("div");
    note.className = "result-note";
    note.textContent = "No items match this filter.";
    elements.inventoryList.append(note);
    updateStats();
    return;
  }
  const orderedGroups = [...GROUP_ORDER, ...[...buckets.keys()].filter(name => !GROUP_ORDER.includes(name)).sort()];

  orderedGroups.forEach(groupName => {
    const bucket = buckets.get(groupName);
    if (!bucket) return;

    const group = document.createElement("div");
    group.className = "inventory-group";

    const header = document.createElement("div");
    header.className = "inventory-group-header";
    header.dataset.group = groupName;
    header.innerHTML = `
      <div class="inventory-group-title">${groupName}</div>
      <div class="inventory-group-meta">
        <span data-group-count></span>
        <span data-group-qty></span>
        <span data-group-value></span>
      </div>
    `;
    group.append(header);

    const list = document.createElement("div");
    list.className = "inventory-group-list";

    bucket.entries.forEach(({ entry, item, basePrice }) => {
      const displayPrice = entry.override != null ? formatNumber(entry.override) : "";
      const priceValue = entry.override != null ? Number(entry.override) : basePrice;
      const totalValue = priceValue * (Number(entry.qty) || 0);
      const refinable = isRefinableItem(item);
      const refineValue = Math.min(10, Math.max(0, Number(entry.refine) || 0));

      const row = document.createElement("div");
      row.className = "inventory-item";

      const icon = document.createElement("img");
      icon.src = getItemIcon(item.id);
      icon.alt = item.name;

      const info = document.createElement("div");
      const displayName = refinable && refineValue > 0 ? `+${refineValue} ${item.name}` : item.name;
      info.innerHTML = `<strong>${displayName}</strong><div class="muted">${item.type || "Unknown"}${item.category ? ` • ${item.category}` : ""}</div>`;

      const refineSelect = document.createElement("select");
      refineSelect.className = "refine-select";
      for (let i = 0; i <= 10; i += 1) {
        const option = document.createElement("option");
        option.value = String(i);
        option.textContent = `+${i}`;
        refineSelect.append(option);
      }
      refineSelect.value = String(refineValue);
      refineSelect.disabled = !refinable;
      refineSelect.title = refinable ? "Refine level" : "Not refinable";
      refineSelect.addEventListener("change", () => {
        if (!refinable) return;
        entry.refine = Number(refineSelect.value) || 0;
        saveState();
        renderInventory();
      });

      const qtyInput = document.createElement("input");
      qtyInput.type = "number";
      qtyInput.min = "0";
      qtyInput.value = entry.qty;
      qtyInput.addEventListener("input", () => {
        const nextQty = Number(qtyInput.value) || 0;
        if (nextQty <= 0) {
          removeItem(entry.id);
          return;
        }
        entry.qty = nextQty;
        const updatedTotal = (entry.override != null ? Number(entry.override) : basePrice) * entry.qty;
        valueTag.textContent = formatZeny(updatedTotal);
        saveState();
        updateStats();
      });

      const priceInput = document.createElement("input");
      priceInput.placeholder = "Manual price";
      priceInput.value = displayPrice;
      setupNumericInput(priceInput, { allowEmpty: true });
      priceInput.addEventListener("input", () => {
        const val = parseOptionalNumber(priceInput.value);
        entry.override = val;
        const updatedPrice = entry.override != null ? Number(entry.override) : basePrice;
        valueTag.textContent = formatZeny(updatedPrice * (Number(entry.qty) || 0));
        saveState();
        updateStats();
      });

      const valueTag = document.createElement("div");
      valueTag.className = "value-tag";
      valueTag.textContent = formatZeny(totalValue);

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => removeItem(entry.id));

      row.append(icon, info, refineSelect, qtyInput, priceInput, valueTag, removeBtn);
      list.append(row);
    });

    group.append(list);
    elements.inventoryList.append(group);
  });

  updateStats();
}

function updateGroupTotals() {
  const buckets = buildGroupBuckets(getInventoryFilters());
  document.querySelectorAll(".inventory-group-header").forEach(header => {
    const groupName = header.dataset.group;
    const bucket = buckets.get(groupName);
    if (!bucket) return;
    const countEl = header.querySelector("[data-group-count]");
    const qtyEl = header.querySelector("[data-group-qty]");
    const valueEl = header.querySelector("[data-group-value]");
    if (countEl) countEl.textContent = `${bucket.entryCount} entries`;
    if (qtyEl) qtyEl.textContent = `${bucket.qtyCount} items`;
    if (valueEl) valueEl.textContent = formatZeny(bucket.valueSum);
  });
}

function attachZenyEvents() {
  Object.entries(zenyInputs).forEach(([key, input]) => {
    input.addEventListener("input", () => {
      const account = getActiveAccount();
      account.zeny[key] = parseNumber(input.value);
      saveState();
      updateStats();
    });
  });
}

function attachEvents() {
  elements.searchInput.addEventListener("input", renderSearchResults);
  elements.filterType.addEventListener("change", renderSearchResults);
  elements.filterCategory.addEventListener("change", renderSearchResults);
  if (elements.inventorySearch) {
    elements.inventorySearch.addEventListener("input", () => {
      state.inventorySearch = elements.inventorySearch.value;
      saveState();
      renderInventory();
    });
  }
  if (elements.accountAdd) {
    elements.accountAdd.addEventListener("click", () => {
      const name = elements.accountName ? elements.accountName.value.trim() : "";
      const label = name || `Account ${state.accounts.length + 1}`;
      const account = normalizeAccount({ name: label }, label);
      state.accounts.push(account);
      setActiveAccount(account.id);
    });
  }
  if (elements.accountRename) {
    elements.accountRename.addEventListener("click", () => {
      const account = getActiveAccount();
      const name = elements.accountName ? elements.accountName.value.trim() : "";
      if (!name) return;
      account.name = name;
      saveState();
      renderAccounts();
      renderAccountSelectors();
    });
  }
  if (elements.accountDelete) {
    elements.accountDelete.addEventListener("click", () => {
      if (state.accounts.length <= 1) return;
      const account = getActiveAccount();
      if (!confirm(`Delete account \"${account.name}\" and its inventory?`)) return;
      state.accounts = state.accounts.filter(acc => acc.id !== account.id);
      const nextId = state.accounts[0]?.id || null;
      setActiveAccount(nextId);
    });
  }
  if (elements.accountName) {
    elements.accountName.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        elements.accountRename?.click();
      }
    });
  }
  if (elements.characterAdd) {
    elements.characterAdd.addEventListener("click", () => {
      const account = getActiveAccount();
      account.characters = Array.isArray(account.characters) ? account.characters : [];
      if (account.characters.length >= 7) return;
      const name = elements.characterName ? elements.characterName.value.trim() : "";
      const zeny = elements.characterZeny ? parseNumber(elements.characterZeny.value) : 0;
      const label = name || `Character ${account.characters.length + 1}`;
      account.characters.push({ id: createId("char"), name: label, zeny: Math.max(0, zeny) });
      saveState();
      if (elements.characterName) elements.characterName.value = "";
      if (elements.characterZeny) elements.characterZeny.value = "";
      renderCharacters();
      updateStats();
    });
  }
  if (elements.characterName) {
    elements.characterName.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        elements.characterAdd?.click();
      }
    });
  }
  if (elements.activeAccountSelect) {
    elements.activeAccountSelect.addEventListener("change", () => {
      setActiveAccount(elements.activeAccountSelect.value);
    });
  }
  if (elements.zenyAccountSelect) {
    elements.zenyAccountSelect.addEventListener("change", () => {
      setActiveAccount(elements.zenyAccountSelect.value);
    });
  }
  if (elements.zenyCharacterSelect) {
    elements.zenyCharacterSelect.addEventListener("change", () => {
      renderAccountSelectors();
    });
  }
  if (elements.zenyCharacterValue) {
    elements.zenyCharacterValue.addEventListener("input", () => {
      const account = getActiveAccount();
      const selectedId = elements.zenyCharacterSelect?.value || "";
      const selectedChar = (account.characters || []).find(entry => entry.id === selectedId);
      if (!selectedChar) return;
      selectedChar.zeny = Math.max(0, parseNumber(elements.zenyCharacterValue.value));
      saveState();
      updateStats();
      renderAccountSelectors();
    });
  }
  if (elements.globalSearch) {
    elements.globalSearch.addEventListener("input", () => {
      renderGlobalSearchResults();
    });
  }
  if (elements.vendingOpen) {
    elements.vendingOpen.addEventListener("click", () => {
      const name = elements.vendingCharacter ? elements.vendingCharacter.value.trim() : "";
      if (!name) return;
      const account = getActiveAccount();
      account.vending = Array.isArray(account.vending) ? account.vending : [];
      account.vending.push({ id: createId("vend"), character: name, items: [] });
      saveState();
      if (elements.vendingCharacter) {
        elements.vendingCharacter.value = "";
      }
      renderVending();
    });
  }
  if (elements.vendingCharacter) {
    elements.vendingCharacter.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        elements.vendingOpen?.click();
      }
    });
  }
  if (elements.loanItem || elements.loanAdd || elements.loanFilter) {
    let selectedLoanItemId = null;

    const renderLoanSuggestions = () => {
      if (!elements.loanSuggestions || !elements.loanItem) return;
      elements.loanSuggestions.innerHTML = "";
      const list = findClosestItems(elements.loanItem.value, 6);
      list.forEach(suggestion => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "ocr-chip";
        chip.textContent = suggestion.name;
        chip.addEventListener("click", () => {
          elements.loanItem.value = suggestion.name;
          selectedLoanItemId = suggestion.id;
          renderLoanSuggestions();
        });
        elements.loanSuggestions.append(chip);
      });
    };

    if (elements.loanItem) {
      elements.loanItem.addEventListener("input", () => {
        selectedLoanItemId = matchLineToItem(elements.loanItem.value);
        renderLoanSuggestions();
      });
    }

    if (elements.loanAdd) {
      elements.loanAdd.addEventListener("click", () => {
        const account = getActiveAccount();
        const person = elements.loanPerson ? elements.loanPerson.value.trim() : "";
        const rawName = elements.loanItem ? elements.loanItem.value.trim() : "";
        const qty = Math.max(1, Number(elements.loanQty?.value) || 1);
        const note = elements.loanNote ? elements.loanNote.value.trim() : "";
        const givenAt = elements.loanDate?.value || new Date().toISOString().slice(0, 10);

        if (!person || !rawName) {
          setLoanStatus("Enter a player name and item name.");
          return;
        }

        let itemId = selectedLoanItemId || matchLineToItem(rawName);
        if (!itemId) itemId = null;
        const itemName = itemId ? (itemsById.get(itemId)?.name || rawName) : rawName;

        account.loans = Array.isArray(account.loans) ? account.loans : [];
        account.loans.unshift({
          id: createId("loan"),
          person,
          itemId,
          itemName,
          qty,
          note,
          givenAt,
          returnedAt: "",
          status: "active"
        });
        saveState();
        setLoanStatus("");
        if (elements.loanItem) elements.loanItem.value = "";
        if (elements.loanNote) elements.loanNote.value = "";
        if (elements.loanQty) elements.loanQty.value = "1";
        selectedLoanItemId = null;
        renderLoanSuggestions();
        renderLoans();
      });
    }

    if (elements.loanFilter) {
      elements.loanFilter.addEventListener("change", () => renderLoans());
    }
  }
  if (elements.shareItem || elements.shareAdd || elements.shareGenerate) {
    let selectedShareItemId = null;

    const renderShareSuggestions = () => {
      if (!elements.shareSuggestions || !elements.shareItem) return;
      elements.shareSuggestions.innerHTML = "";
      const list = findClosestItems(elements.shareItem.value, 6);
      list.forEach(suggestion => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "ocr-chip";
        chip.textContent = suggestion.name;
        chip.addEventListener("click", () => {
          elements.shareItem.value = suggestion.name;
          selectedShareItemId = suggestion.id;
          renderShareSuggestions();
        });
        elements.shareSuggestions.append(chip);
      });
    };

    if (elements.shareItem) {
      elements.shareItem.addEventListener("input", () => {
        selectedShareItemId = matchLineToItem(elements.shareItem.value);
        renderShareSuggestions();
      });
    }

    if (elements.shareAdd) {
      elements.shareAdd.addEventListener("click", () => {
        const rawName = elements.shareItem ? elements.shareItem.value.trim() : "";
        const qty = Math.max(1, Number(elements.shareQty?.value) || 1);
        const price = elements.sharePrice ? parseOptionalNumber(elements.sharePrice.value) : null;
        const itemNote = elements.shareNote ? elements.shareNote.value.trim() : "";
        if (!rawName) {
          setShareStatus("Enter an item name.");
          return;
        }
        let itemId = selectedShareItemId || matchLineToItem(rawName);
        if (!itemId) {
          setShareStatus("Pick a valid item from suggestions.");
          return;
        }
        const itemName = itemsById.get(itemId)?.name || rawName;
        const existing = shareDraft.items.find(entry => entry.id === itemId);
        if (existing) {
          existing.qty += qty;
          if (price != null) {
            existing.price = price;
          }
          if (itemNote) {
            existing.note = itemNote;
          }
        } else {
          shareDraft.items.push({ id: itemId, name: itemName, qty, price, note: itemNote });
        }
        setShareStatus("");
        if (elements.shareItem) elements.shareItem.value = "";
        if (elements.shareQty) elements.shareQty.value = "1";
        if (elements.sharePrice) elements.sharePrice.value = "";
        if (elements.shareNote) elements.shareNote.value = "";
        selectedShareItemId = null;
        renderShareSuggestions();
        renderShareList();
        saveShareDraft();
      });
    }

    if (elements.shareGenerate) {
      elements.shareGenerate.addEventListener("click", async () => {
        if (!shareDraft.items.length) {
          setShareStatus("Add at least one item.");
          return;
        }
        const payload = {
          v: 1,
          from: shareDraft.from || (elements.shareFrom ? elements.shareFrom.value.trim() : ""),
          note: shareDraft.generalNote || (elements.shareGeneralNote ? elements.shareGeneralNote.value.trim() : ""),
          createdAt: new Date().toISOString(),
          items: shareDraft.items.map(entry => ({
            id: entry.id,
            name: entry.name,
            qty: entry.qty,
            price: entry.price != null ? entry.price : null,
            note: entry.note || ""
          }))
        };
        try {
          const code = await encodeSharePayload(payload);
          if (elements.shareCode) {
            elements.shareCode.value = code;
          }
          renderShareGeneratedMeta(payload);
          setShareStatus("Code generated.");
        } catch {
          setShareStatus("Failed to generate code.");
        }
      });
    }

    if (elements.shareCopy) {
      elements.shareCopy.addEventListener("click", async () => {
        const code = elements.shareCode ? elements.shareCode.value.trim() : "";
        if (!code) {
          setShareStatus("Generate a code first.");
          return;
        }
        try {
          await navigator.clipboard.writeText(code);
          setShareStatus("Copied to clipboard.");
        } catch {
          setShareStatus("Copy failed. Select the code and copy manually.");
        }
      });
    }

    if (elements.shareFrom) {
      elements.shareFrom.addEventListener("input", () => {
        shareDraft.from = elements.shareFrom.value.trim();
        saveShareDraft();
      });
    }

    if (elements.shareGeneralNote) {
      elements.shareGeneralNote.addEventListener("input", () => {
        shareDraft.generalNote = elements.shareGeneralNote.value.trim();
        saveShareDraft();
      });
    }

    if (elements.shareApply) {
      elements.shareApply.addEventListener("click", async () => {
        const code = elements.shareImport ? elements.shareImport.value.trim() : "";
        if (!code) {
          shareImportMeta = null;
          renderShareMeta();
          renderSharePreview([]);
          return;
        }
        try {
          const payload = await decodeSharePayload(code);
          if (!payload || !Array.isArray(payload.items)) {
            setShareStatus("Invalid share code.");
            shareImportMatches = [];
            shareImportMeta = null;
            renderShareMeta();
            renderSharePreview([]);
            return;
          }
          shareImportMeta = {
            from: payload.from || "",
            note: payload.note || "",
            createdAt: payload.createdAt || ""
          };
          shareImportMatches = payload.items.map((entry) => {
            let itemId = Number(entry.id);
            if (!Number.isFinite(itemId) || itemId <= 0) itemId = null;
            if (!itemId && entry.name) {
              itemId = matchLineToItem(entry.name);
            }
            return {
              itemId,
              itemName: entry.name || "",
              qty: Math.max(1, Number(entry.qty) || 1),
              price: entry.price != null ? Number(entry.price) : null,
              note: String(entry.note || "")
            };
          });
          renderSharePreview(shareImportMatches);
          renderShareMeta();
          setShareStatus("");
        } catch (error) {
          shareImportMatches = [];
          shareImportMeta = null;
          renderShareMeta();
          renderSharePreview([]);
          setShareStatus("Invalid share code.");
        }
      });
    }

    if (elements.shareImportBtn) {
      elements.shareImportBtn.addEventListener("click", () => {
        if (!shareImportMatches.length) {
          setShareStatus("Preview a code first.");
          return;
        }
        const account = getActiveAccount();
        shareImportMatches.forEach((entry) => {
          if (!entry.itemId) return;
          const existing = account.items.find(itemEntry => itemEntry.id === entry.itemId);
          if (existing) {
            existing.qty = (Number(existing.qty) || 0) + entry.qty;
            if (entry.price != null) {
              existing.override = entry.price;
            }
          } else {
            account.items.push({
              id: entry.itemId,
              qty: entry.qty,
              override: entry.price != null ? entry.price : null,
              refine: 0
            });
          }
        });
        saveState();
        renderInventory();
        shareImportMeta = null;
        renderShareMeta();
        renderSharePreview([]);
        if (elements.shareImport) elements.shareImport.value = "";
        shareImportMatches = [];
        setShareStatus("Items imported.");
      });
    }
  }
  const ocrEnabled = Boolean(elements.ocrDrop || elements.ocrFile || elements.ocrModal);
  if (ocrEnabled) {
    if (elements.ocrFile) {
      elements.ocrFile.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) handleOcrImage(file);
        event.target.value = "";
      });
    }
    if (elements.ocrDrop && elements.ocrFile) {
      elements.ocrDrop.addEventListener("click", () => elements.ocrFile.click());
    }
    if (elements.ocrClear) {
      elements.ocrClear.addEventListener("click", () => {
        lastOcrBlob = null;
        setOcrPreview(null);
        setOcrStatus("Waiting for image...");
      });
    }
    if (elements.ocrConfirm) {
      elements.ocrConfirm.addEventListener("click", () => applyOcrImport());
    }
    if (elements.ocrCancel) {
      elements.ocrCancel.addEventListener("click", () => hideOcrModal());
    }
    document.addEventListener("paste", (event) => {
      const items = event.clipboardData?.items || [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) {
            handleOcrImage(blob);
            event.preventDefault();
            break;
          }
        }
      }
    });
  }
  elements.exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ragnarok-ledger.json";
    a.click();
    URL.revokeObjectURL(url);
  });
  elements.importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const hasAccounts = Array.isArray(parsed.accounts) && parsed.accounts.length;
        const hasLegacy = parsed.zeny && Array.isArray(parsed.items);
        if (!hasAccounts && !hasLegacy) return;
        const next = normalizeState(parsed);
        state.accounts = next.accounts;
        state.activeAccountId = next.activeAccountId;
        state.inventorySearch = next.inventorySearch || "";
        state.inventoryGroup = next.inventoryGroup || "All";
        if (next.priceBasis) {
          state.priceBasis = next.priceBasis;
        }
        saveState();
        updateZenyInputs();
        renderAccounts();
        if (elements.inventorySearch) {
          elements.inventorySearch.value = state.inventorySearch || "";
        }
        renderInventory();
        renderLoans();
      } catch (_) {
        // ignore invalid file
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  });
  elements.resetBtn.addEventListener("click", () => {
    if (!confirm("Reset all ledger data?")) return;
    const fresh = defaultState();
    state.accounts = fresh.accounts;
    state.activeAccountId = fresh.activeAccountId;
    state.inventorySearch = fresh.inventorySearch;
    state.inventoryGroup = fresh.inventoryGroup;
    delete state.priceBasis;
    saveState();
    updateZenyInputs();
    renderAccounts();
    if (elements.inventorySearch) {
      elements.inventorySearch.value = state.inventorySearch || "";
    }
    renderInventory();
    renderLoans();
  });
  elements.clearInventory.addEventListener("click", () => {
    if (!confirm("Clear inventory list?")) return;
    const account = getActiveAccount();
    account.items = [];
    state.inventorySearch = "";
    state.inventoryGroup = "All";
    saveState();
    if (elements.inventorySearch) {
      elements.inventorySearch.value = "";
    }
    renderInventory();
  });
}

function init() {
  initSections();
  updateMeta();
  populateFilters();
  Object.values(zenyInputs).forEach((input) => setupNumericInput(input));
  if (elements.characterZeny) setupNumericInput(elements.characterZeny, { allowEmpty: true });
  if (elements.zenyCharacterValue) setupNumericInput(elements.zenyCharacterValue);
  if (elements.sharePrice) setupNumericInput(elements.sharePrice, { allowEmpty: true });
  loadShareDraft();
  updateZenyInputs();
  renderAccounts();
  renderAccountSelectors();
  renderCharacters();
  renderGlobalSearchResults();
  if (elements.shareFrom) elements.shareFrom.value = shareDraft.from || "";
  if (elements.shareGeneralNote) elements.shareGeneralNote.value = shareDraft.generalNote || "";
  if (elements.loanDate && !elements.loanDate.value) {
    elements.loanDate.value = new Date().toISOString().slice(0, 10);
  }
  if (elements.inventorySearch) {
    elements.inventorySearch.value = state.inventorySearch || "";
  }
  if (!window.Tesseract) {
    setOcrStatus("OCR library missing. Offline OCR disabled.");
  } else {
    setOcrStatus("OCR ready (offline).");
  }
  attachZenyEvents();
  attachEvents();
  renderSearchResults();
  renderInventory();
  renderLoans();
  renderShareList();
  renderShareGeneratedMeta({
    from: shareDraft.from || "",
    note: shareDraft.generalNote || ""
  });
}

init();
