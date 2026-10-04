// Mock Base44-compatible SDK. Persists to localStorage so the LAP QUIZ demo
// is fully interactive without a real backend.
// EVERYTHING HERE IS MOCKED for the frontend-only demo.
import { SEED_QUESTIONS, SEED_PROFILES, SEED_LISTINGS, SEED_SESSIONS } from "@/lib/seed";

const LS_KEY = "lapquiz_db_v2";

const DEMO_USER = {
  id: "demo-user",
  email: "demo@lapquiz.ch",
  full_name: "Demo Lernende",
  role: "admin",
  profession: "kaufmann",
  age: 19,
  canton: "Zürich",
  ort: "Zürich",
  profile_picture: "",
  bio: "Ich bereite mich auf die KV-LAP vor und teste LAP QUIZ. 🚀",
};

const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : "id-" + Math.random().toString(36).slice(2) + Date.now());
const now = () => new Date().toISOString();

function seedState() {
  const owner = { created_by_id: DEMO_USER.id, created_by: DEMO_USER.email };
  const stamp = (arr, extra = {}) =>
    arr.map((d, i) => ({ id: uid(), created_date: new Date(Date.now() - (arr.length - i) * 86400000).toISOString(), ...extra, ...d }));

  // Profiles belong to their own (fake) users so the demo user can message them.
  const profiles = SEED_PROFILES.map((d, i) => ({
    id: uid(),
    created_date: new Date(Date.now() - i * 3600000).toISOString(),
    created_by_id: "peer-" + i,
    created_by: `peer${i}@lapquiz.ch`,
    ...d,
  }));

  return {
    _user: { ...DEMO_USER },
    Question: stamp(SEED_QUESTIONS, owner),
    UserQuestion: [],
    StudySession: stamp(SEED_SESSIONS, owner),
    CustomExam: [],
    Listing: stamp(SEED_LISTINGS, owner),
    Message: [],
    LiebeProfile: profiles,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const s = seedState();
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
  return s;
}

let state = load();
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {} }

function matches(row, q) {
  return Object.entries(q || {}).every(([k, v]) => row[k] === v);
}

function run(name, q, sort, limit) {
  let rows = [...(state[name] || [])].filter((r) => matches(r, q));
  if (sort) {
    const desc = sort.startsWith("-");
    const key = desc ? sort.slice(1) : sort;
    rows.sort((a, b) => {
      const av = a[key], bv = b[key];
      if (av == null && bv == null) return 0;
      if (av < bv) return desc ? 1 : -1;
      if (av > bv) return desc ? -1 : 1;
      return 0;
    });
  }
  if (limit) rows = rows.slice(0, limit);
  return rows;
}

function entity(name) {
  return {
    list: async (sort, limit) => run(name, {}, sort, limit),
    filter: async (q, sort, limit) => run(name, q, sort, limit),
    get: async (id) => (state[name] || []).find((r) => r.id === id) || null,
    create: async (data) => {
      const rec = { id: uid(), created_by_id: state._user.id, created_by: state._user.email, created_date: now(), ...data };
      state[name] = [rec, ...(state[name] || [])];
      save();
      return rec;
    },
    bulkCreate: async (arr) => {
      const created = arr.map((data) => ({ id: uid(), created_by_id: state._user.id, created_by: state._user.email, created_date: now(), ...data }));
      state[name] = [...created, ...(state[name] || [])];
      save();
      return created;
    },
    update: async (id, data) => {
      state[name] = (state[name] || []).map((r) => (r.id === id ? { ...r, ...data } : r));
      save();
      return (state[name] || []).find((r) => r.id === id);
    },
    delete: async (id) => {
      state[name] = (state[name] || []).filter((r) => r.id !== id);
      save();
      return true;
    },
    deleteMany: async (q) => {
      state[name] = (state[name] || []).filter((r) => !matches(r, q));
      save();
      return true;
    },
  };
}

const entityNames = ["Question", "UserQuestion", "StudySession", "CustomExam", "Listing", "Message", "LiebeProfile"];
const entities = {};
entityNames.forEach((n) => (entities[n] = entity(n)));

async function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

// ---- MOCKED AI question generation ----
const MOCK_AI = [
  { type: "mc", question: "Welche Aussage beschreibt den Kernpunkt dieses Themas am besten?", options: ["Variante A", "Variante B (korrekt)", "Variante C", "Variante D"], correct_answer: "Variante B (korrekt)", explanation: "Beispiel-Erklärung aus der KI-Demo." },
  { type: "tf", question: "Dieser Merksatz zum Thema ist korrekt formuliert.", options: ["Wahr", "Falsch"], correct_answer: "Wahr", explanation: "Demo-Begründung: die Aussage trifft zu." },
  { type: "gap", question: "Der zentrale Fachbegriff dieses Kapitels lautet ___.", options: [], correct_answer: "Fachbegriff", explanation: "Lücke mit dem passenden Begriff füllen." },
  { type: "mc", question: "Welches Beispiel passt am besten zum behandelten Prinzip?", options: ["Beispiel 1", "Beispiel 2", "Beispiel 3 (korrekt)", "Beispiel 4"], correct_answer: "Beispiel 3 (korrekt)", explanation: "Demo: Beispiel 3 illustriert das Prinzip." },
  { type: "tf", question: "Die Reihenfolge der Schritte ist in diesem Prozess irrelevant.", options: ["Wahr", "Falsch"], correct_answer: "Falsch", explanation: "Die Reihenfolge ist wichtig – daher falsch." },
];

const integrations = {
  Core: {
    InvokeLLM: async () => {
      await new Promise((r) => setTimeout(r, 1200));
      return { questions: MOCK_AI.map((q) => ({ ...q })) };
    },
    UploadPublicFile: async ({ file }) => ({ file_url: await fileToDataUrl(file) }),
    UploadFile: async ({ file }) => ({ file_url: await fileToDataUrl(file) }),
  },
};

const auth = {
  isAuthenticated: async () => true,
  me: async () => ({ ...state._user }),
  updateMe: async (patch) => { state._user = { ...state._user, ...patch }; save(); return { ...state._user }; },
  loginViaEmailPassword: async () => ({ ...state._user }),
  loginWithProvider: () => { window.location.href = "/faecher"; },
  register: async () => ({}),
  verifyOtp: async () => ({ access_token: "demo-token" }),
  resendOtp: async () => ({}),
  setToken: () => {},
  resetPasswordRequest: async () => ({}),
  resetPassword: async () => ({}),
  redirectToLogin: () => { window.location.href = "/login"; },
  logout: () => { window.location.href = "/"; },
};

const app = { getPublicSettings: async () => ({ id: "lapquiz", public_settings: {} }) };

export const db = { auth, entities, integrations, app };
export const base44 = db;
export default db;
