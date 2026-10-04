// Backend-connected client (FastAPI + MongoDB). Keeps the same interface the
// pages already use (db.entities.X.*, db.auth.*, db.ai.*, db.integrations.Core.*).
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const http = axios.create({ baseURL: API });

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

const entityNames = ["Question", "UserQuestion", "StudySession", "CustomExam", "Listing", "Message", "LiebeProfile"];
const entities = {};
entityNames.forEach((n) => (entities[n] = entity(n)));

// Read a File into a data URL (used for images stored inline on entities).
function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

const ai = {
  // { subjectName, topic, imageBase64, count }
  generateQuestions: async (payload) => {
    const { data } = await http.post(`/ai/generate-questions`, {
      subject_name: payload.subjectName,
      topic: payload.topic || null,
      image_base64: payload.imageBase64 || null,
      count: payload.count || 5,
    });
    return data; // { questions: [...] }
  },
};

const integrations = {
  Core: {
    // Images are stored inline as data URLs on the entity docs (persist in Mongo).
    UploadPublicFile: async ({ file }) => ({ file_url: await fileToDataUrl(file) }),
    UploadFile: async ({ file }) => ({ file_url: await fileToDataUrl(file) }),
  },
};

const auth = {
  isAuthenticated: async () => true,
  me: async () => (await http.get(`/me`)).data,
  updateMe: async (patch) => (await http.put(`/me`, patch)).data,
  loginViaEmailPassword: async () => (await http.get(`/me`)).data,
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

export const db = { auth, entities, integrations, ai, app, fileToDataUrl };
export const base44 = db;
export default db;
