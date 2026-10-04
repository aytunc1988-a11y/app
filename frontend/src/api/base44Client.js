import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const TOKEN_KEY = "lapquiz_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

const http = axios.create({ baseURL: API, withCredentials: true });
http.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

const entity = (name) => ({
  list: async (sort, limit) => (await http.post(`/entities/${name}/list`, { sort, limit })).data,
  filter: async (filter, sort, limit) => (await http.post(`/entities/${name}/list`, { filter, sort, limit })).data,
  get: async (id) => (await http.get(`/entities/${name}/${id}`)).data,
  create: async (data) => (await http.post(`/entities/${name}`, data)).data,
  bulkCreate: async (arr) => (await http.post(`/entities/${name}/bulk`, arr)).data,
  update: async (id, data) => (await http.put(`/entities/${name}/${id}`, data)).data,
  delete: async (id) => (await http.delete(`/entities/${name}/${id}`)).data,
  deleteMany: async (filter) => (await http.post(`/entities/${name}/delete-many`, { filter })).data,
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
    pdf_base64: p.pdfBase64 || null, count: p.count || 5,
  })).data,
};

const integrations = { Core: {
  UploadPublicFile: async ({ file }) => ({ file_url: await fileToDataUrl(file) }),
  UploadFile: async ({ file }) => ({ file_url: await fileToDataUrl(file) }),
}};

const auth = {
  me: async () => (await http.get(`/auth/me`)).data,
  updateMe: async (patch) => (await http.put(`/auth/me`, patch)).data,
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
  logout: async () => { try { await http.post(`/auth/logout`); } catch {} setToken(null); window.location.href = "/"; },
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
};

export const db = { auth, entities, integrations, ai, admin, app, fileToDataUrl };
export const base44 = db;
export default db;
