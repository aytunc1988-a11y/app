import axios from "axios";
import { SEED_QUESTIONS, SEED_LISTINGS, SEED_PROFILES, SEED_SESSIONS } from "@/lib/seed";
import { PROFESSIONS } from "@/lib/subjects";
import {
  getPreviewData,
  getPreviewUser,
  isPreviewEnabled,
  savePreviewData,
  savePreviewUser,
} from "@/lib/previewMode";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const TOKEN_KEY = "lapquiz_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

function createPreviewData() {
  const questions = SEED_QUESTIONS.flatMap((question, index) => PROFESSIONS
    .filter((profession) => profession.subjects.includes(question.subject))
    .map((profession) => ({
      ...question,
      id: `preview-question-${index + 1}-${profession.id}`,
      profession: profession.id,
      created_date: new Date().toISOString(),
    })));

  return {
    Question: questions,
    UserQuestion: [],
    StudySession: SEED_SESSIONS.map((session, index) => ({
      ...session,
      id: `preview-session-${index + 1}`,
      created_by_id: "lapquiz-preview-user",
      created_date: new Date().toISOString(),
    })),
    CustomExam: [],
    Listing: SEED_LISTINGS.map((listing, index) => ({
      ...listing,
      id: `preview-listing-${index + 1}`,
      created_by_id: `preview-seller-${index + 1}`,
      created_date: new Date().toISOString(),
    })),
    Message: [],
    LiebeProfile: SEED_PROFILES.map((profile, index) => ({
      ...profile,
      id: `preview-profile-${index + 1}`,
      created_by_id: `preview-user-${index + 1}`,
      created_date: new Date().toISOString(),
    })),
  };
}

function previewRecords(name) {
  return getPreviewData(name, createPreviewData);
}

function sortRecords(records, sort, limit) {
  const result = [...records];
  if (sort) {
    const descending = sort.startsWith("-");
    const field = descending ? sort.slice(1) : sort;
    result.sort((a, b) => {
      const left = a[field] ?? "";
      const right = b[field] ?? "";
      if (left === right) return 0;
      return (left < right ? -1 : 1) * (descending ? -1 : 1);
    });
  }
  return Number.isFinite(limit) ? result.slice(0, limit) : result;
}

function matchesFilter(record, filter = {}) {
  return Object.entries(filter).every(([key, value]) => record[key] === value);
}

function saveRecords(name, records) {
  savePreviewData(name, records, createPreviewData);
}

const http = axios.create({ baseURL: API, withCredentials: true });
http.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const entity = (name) => ({
  list: async (sort, limit) => {
    if (isPreviewEnabled()) return sortRecords(previewRecords(name), sort, limit);
    return (await http.post(`/entities/${name}/list`, { sort, limit })).data;
  },
  filter: async (filter, sort, limit) => {
    if (isPreviewEnabled()) return sortRecords(previewRecords(name).filter((record) => matchesFilter(record, filter)), sort, limit);
    return (await http.post(`/entities/${name}/list`, { filter, sort, limit })).data;
  },
  get: async (id) => {
    if (isPreviewEnabled()) return previewRecords(name).find((record) => record.id === id) || null;
    return (await http.get(`/entities/${name}/${id}`)).data;
  },
  create: async (data) => {
    if (isPreviewEnabled()) {
      const created = { ...data, id: `preview-${Date.now()}`, created_date: new Date().toISOString(), created_by_id: getPreviewUser()?.user_id };
      saveRecords(name, [...previewRecords(name), created]);
      return created;
    }
    return (await http.post(`/entities/${name}`, data)).data;
  },
  bulkCreate: async (arr) => {
    if (isPreviewEnabled()) {
      const created = arr.map((data, index) => ({ ...data, id: `preview-${Date.now()}-${index}`, created_date: new Date().toISOString(), created_by_id: getPreviewUser()?.user_id }));
      saveRecords(name, [...previewRecords(name), ...created]);
      return created;
    }
    return (await http.post(`/entities/${name}/bulk`, arr)).data;
  },
  update: async (id, data) => {
    if (isPreviewEnabled()) {
      let updated;
      saveRecords(name, previewRecords(name).map((record) => {
        if (record.id !== id) return record;
        updated = { ...record, ...data };
        return updated;
      }));
      return updated || null;
    }
    return (await http.put(`/entities/${name}/${id}`, data)).data;
  },
  delete: async (id) => {
    if (isPreviewEnabled()) {
      saveRecords(name, previewRecords(name).filter((record) => record.id !== id));
      return { ok: true };
    }
    return (await http.delete(`/entities/${name}/${id}`)).data;
  },
  deleteMany: async (filter) => {
    if (isPreviewEnabled()) {
      saveRecords(name, previewRecords(name).filter((record) => !matchesFilter(record, filter)));
      return { ok: true };
    }
    return (await http.post(`/entities/${name}/delete-many`, { filter })).data;
  },
});
const entities = {};
["Question", "UserQuestion", "StudySession", "CustomExam", "Listing", "Message", "LiebeProfile"].forEach((n) => (entities[n] = entity(n)));

export function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => resolve("");
    r.readAsDataURL(file);
  });
}

const ai = {
  generateQuestions: async (p) => (await http.post(`/ai/generate-questions`, {
    subject_name: p.subjectName, topic: p.topic || null, image_base64: p.imageBase64 || null,
    pdf_base64: p.pdfBase64 || null, count: p.count || 5, model: p.model || null,
  })).data,
};

export const AI_MODELS = [
  { id: "gpt-4o", label: "GPT-4o (OpenAI)" },
  { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 (Anthropic)" },
];

const integrations = { Core: {
  UploadPublicFile: async ({ file }) => ({ file_url: await fileToDataUrl(file) }),
  UploadFile: async ({ file }) => ({ file_url: await fileToDataUrl(file) }),
}};

const auth = {
  me: async () => {
    if (isPreviewEnabled()) return getPreviewUser();
    return (await http.get(`/auth/me`)).data;
  },
  updateMe: async (patch) => {
    if (isPreviewEnabled()) return savePreviewUser(patch);
    return (await http.put(`/auth/me`, patch)).data;
  },
  registerEmail: async (email, password, name) => {
    const { data } = await http.post(`/auth/register`, { email, password, name });
    setToken(data.session_token); return data.user;
  },
  loginEmail: async (email, password) => {
    const { data } = await http.post(`/auth/login`, { email, password });
    setToken(data.session_token); return data.user;
  },
  exchangeSession: async (session_id) => {
    const { data } = await http.post(`/auth/session`, { session_id });
    setToken(data.session_token); return data.user;
  },
  redeem: async (code) => (await http.post(`/auth/redeem`, { code })).data,
  logout: async () => {
    if (isPreviewEnabled()) { window.location.href = "/"; return; }
    try { await http.post(`/auth/logout`); } catch {}
    setToken(null); window.location.href = "/";
  },
  loginWithProvider: () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/faecher";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  },
};

const app = { getPublicSettings: async () => ({ id: "lapquiz", public_settings: {} }) };

const admin = {
  listLicenses: async () => (await http.get(`/admin/licenses`)).data,
  createLicense: async (payload) => (await http.post(`/admin/licenses`, payload)).data,
  updateLicense: async (id, patch) => (await http.patch(`/admin/licenses/${id}`, patch)).data,
  deleteLicense: async (id) => (await http.delete(`/admin/licenses/${id}`)).data,
  stats: async () => (await http.get(`/admin/stats`)).data,
  listUsers: async () => (await http.get(`/admin/users`)).data,
  updateUser: async (uid, patch) => (await http.patch(`/admin/users/${uid}`, patch)).data,
};

export const db = { auth, entities, integrations, ai, admin, app, fileToDataUrl };
export const base44 = db;
export default db;
