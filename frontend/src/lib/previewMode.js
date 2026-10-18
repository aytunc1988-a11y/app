const PREVIEW_KEY = "lapquiz_preview_mode";
const PREVIEW_DATA_KEY = "lapquiz_preview_data";
const PREVIEW_USER_KEY = "lapquiz_preview_user";

export const PREVIEW_USER = {
  user_id: "lapquiz-preview-user",
  email: "preview@localhost",
  name: "Vorschau",
  full_name: "Vorschau",
  role: "user",
  licensed: true,
  profession: "kaufmann",
  unlocked_professions: [],
};

export function isLocalPreviewAvailable() {
  return process.env.NODE_ENV === "development"
    && typeof window !== "undefined"
    && ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
}

export function enablePreviewFromLocation() {
  if (!isLocalPreviewAvailable()) return false;
  if (new URLSearchParams(window.location.search).get("preview") === "1") {
    window.sessionStorage.setItem(PREVIEW_KEY, "true");
  }
  return isPreviewEnabled();
}

export function enterLocalPreview() {
  if (!isLocalPreviewAvailable()) return;
  window.sessionStorage.setItem(PREVIEW_KEY, "true");
  window.location.assign("/faecher?preview=1");
}

export function isPreviewEnabled() {
  return isLocalPreviewAvailable() && window.sessionStorage.getItem(PREVIEW_KEY) === "true";
}

export function disableLocalPreview() {
  if (!isLocalPreviewAvailable()) return;
  window.sessionStorage.removeItem(PREVIEW_KEY);
  window.sessionStorage.removeItem(PREVIEW_DATA_KEY);
  window.sessionStorage.removeItem(PREVIEW_USER_KEY);
}

export function getPreviewUser() {
  if (!isPreviewEnabled()) return null;
  const saved = window.sessionStorage.getItem(PREVIEW_USER_KEY);
  return saved ? { ...PREVIEW_USER, ...JSON.parse(saved) } : PREVIEW_USER;
}

export function savePreviewUser(patch) {
  const user = { ...getPreviewUser(), ...patch };
  window.sessionStorage.setItem(PREVIEW_USER_KEY, JSON.stringify(user));
  return user;
}

export function getPreviewData(key, createSeed) {
  if (!isPreviewEnabled()) return null;
  const stored = window.sessionStorage.getItem(PREVIEW_DATA_KEY);
  if (!stored) {
    const seed = createSeed();
    window.sessionStorage.setItem(PREVIEW_DATA_KEY, JSON.stringify(seed));
    return seed[key] || [];
  }
  const data = JSON.parse(stored);
  return data[key] || [];
}

export function savePreviewData(key, records, createSeed) {
  const stored = window.sessionStorage.getItem(PREVIEW_DATA_KEY);
  const data = stored ? JSON.parse(stored) : createSeed();
  data[key] = records;
  window.sessionStorage.setItem(PREVIEW_DATA_KEY, JSON.stringify(data));
}
