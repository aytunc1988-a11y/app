// Shared subject + profession metadata, helpers and AI-question rules for LAP QUIZ.

export const CANTONS = [
  "Zürich","Bern","Luzern","Uri","Schwyz","Obwalden","Nidwalden","Glarus","Zug","Fribourg",
  "Solothurn","Basel-Stadt","Basel-Landschaft","Schaffhausen","Appenzell Ausserrhoden",
  "Appenzell Innerrhoden","St. Gallen","Graubünden","Aargau","Thurgau","Ticino","Vaud",
  "Valais","Neuchâtel","Genève","Jura",
];

export const SUBJECTS = [
  { id: "rechnungswesen", short: "RW", name: "Rechnungswesen", emoji: "📊", bg: "bg-[#FDFFB6]" },
  { id: "wg", short: "W&G", name: "Wirtschaft & Gesellschaft", emoji: "🌍", bg: "bg-[#CAFFBF]" },
  { id: "ika", short: "IKA", name: "Information & Kommunikation", emoji: "💻", bg: "bg-[#9BF6FF]" },
  { id: "deutsch", short: "DE", name: "Deutsch", emoji: "✍️", bg: "bg-[#FFADAD]" },
  { id: "englisch", short: "EN", name: "Englisch", emoji: "🇬🇧", bg: "bg-[#BDB2FF]" },
  { id: "et", short: "ET", name: "Elektrotechnik", emoji: "⚡", bg: "bg-[#FFD6A5]" },
  { id: "it", short: "IT", name: "Informationstechnik", emoji: "💾", bg: "bg-[#BDB2FF]" },
  { id: "nin", short: "NIN", name: "Normen & Installation", emoji: "🔌", bg: "bg-[#FDFFB6]" },
  { id: "abu", short: "ABU", name: "Allgemeinbildung", emoji: "📚", bg: "bg-[#CAFFBF]" },
  { id: "pb", short: "PB", name: "Pflege & Betreuung", emoji: "🩺", bg: "bg-[#FFADAD]" },
  { id: "mt", short: "MT", name: "Med. Grundlagen", emoji: "💉", bg: "bg-[#9BF6FF]" },
  { id: "ap", short: "AP", name: "Arbeitsprozesse", emoji: "🛠️", bg: "bg-[#BDB2FF]" },
  { id: "prg", short: "PRG", name: "Programmieren", emoji: "💻", bg: "bg-[#FDFFB6]" },
  { id: "net", short: "NET", name: "Netzwerke", emoji: "🌐", bg: "bg-[#CAFFBF]" },
  { id: "db", short: "DB", name: "Datenbanken", emoji: "🗄️", bg: "bg-[#FFADAD]" },
  { id: "hk", short: "HK", name: "Haarkunde", emoji: "✂️", bg: "bg-[#9BF6FF]" },
  { id: "fc", short: "FC", name: "Farben & Chemie", emoji: "🎨", bg: "bg-[#BDB2FF]" },
  { id: "kb", short: "KB", name: "Kundenberatung", emoji: "💬", bg: "bg-[#FDFFB6]" },
  { id: "ll", short: "LL", name: "Lagerlogistik", emoji: "📦", bg: "bg-[#CAFFBF]" },
  { id: "tv", short: "TV", name: "Transport & Verkehr", emoji: "🚚", bg: "bg-[#FFADAD]" },
  { id: "as", short: "AS", name: "Arbeitssicherheit", emoji: "🦺", bg: "bg-[#9BF6FF]" },
  { id: "vb", short: "VB", name: "Verkaufsberatung", emoji: "🛍️", bg: "bg-[#BDB2FF]" },
  { id: "wb", short: "WB", name: "Warenwirtschaft", emoji: "🏷️", bg: "bg-[#FDFFB6]" },
  { id: "vr", short: "VR", name: "Verkehrsregeln", emoji: "🚦", bg: "bg-[#CAFFBF]" },
  { id: "sm", short: "SM", name: "Sicherheit & Manöver", emoji: "⚠️", bg: "bg-[#FFADAD]" },
  { id: "fu", short: "FU", name: "Fahrzeugtechnik", emoji: "🔧", bg: "bg-[#9BF6FF]" },
];

export const PROFESSIONS = [
  { id: "kaufmann", short: "Kaufmann", name: "Kaufmann/-frau EFZ", emoji: "📊", bg: "bg-[#FDFFB6]", subjects: ["rechnungswesen", "wg", "ika", "deutsch", "englisch"] },
  { id: "elektro", short: "Elektro", name: "Elektroinstallateur/in EFZ", emoji: "⚡", bg: "bg-[#FFD6A5]", subjects: ["et", "it", "nin", "abu"] },
  { id: "gesundheit", short: "Gesundheit", name: "Fachfrau/-mann Gesundheit EFZ", emoji: "🩺", bg: "bg-[#FFADAD]", subjects: ["pb", "mt", "ap", "abu"] },
  { id: "informatik", short: "Informatik", name: "Informatiker/in EFZ", emoji: "💻", bg: "bg-[#9BF6FF]", subjects: ["prg", "net", "db", "abu"] },
  { id: "coiffeur", short: "Coiffeur", name: "Coiffeur/-euse EFZ", emoji: "✂️", bg: "bg-[#BDB2FF]", subjects: ["hk", "fc", "kb", "abu"] },
  { id: "logistik", short: "Logistik", name: "Logistiker/in EFZ", emoji: "📦", bg: "bg-[#CAFFBF]", subjects: ["ll", "tv", "as", "abu"] },
  { id: "detailhandel", short: "Detailhandel", name: "Detailhandelsfachmann/-frau EFZ", emoji: "🛍️", bg: "bg-[#FFD6A5]", subjects: ["vb", "wb", "wg", "abu"] },
  { id: "auto", short: "Auto", name: "Theorieprüfung Auto (Kat. B)", emoji: "🚗", bg: "bg-[#9BF6FF]", subjects: ["vr", "sm", "fu"] },
];

export const TYPE_LABELS = { mc: "Multiple Choice", tf: "Wahr/Falsch", gap: "Lückentext" };

export function getSubject(id) {
  return SUBJECTS.find((s) => s.id === id) || null;
}
export function getProfession(id) {
  return PROFESSIONS.find((p) => p.id === id) || null;
}
export function professionSubjects(professionId) {
  const p = getProfession(professionId);
  return p ? p.subjects.map(getSubject).filter(Boolean) : SUBJECTS.slice(0, 5);
}

export function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds || 0));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m < 60) return sec ? `${m}m ${sec}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm ? `${h}h ${mm}m` : `${h}h`;
}

export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function isCorrect(q, answer) {
  if (answer == null || answer === "") return false;
  const norm = (x) => String(x).trim().toLowerCase();
  const accepted = String(q?.correct_answer ?? "").split("|").map((a) => norm(a));
  return accepted.includes(norm(answer));
}

export const QUESTION_JSON_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["mc", "tf", "gap"] },
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          correct_answer: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["type", "question", "correct_answer"],
      },
    },
  },
  required: ["questions"],
};

export const QUESTION_RULES = `Regeln für die Fragen:
- Mische die Typen mc (Multiple Choice mit genau 4 Optionen), tf (Wahr/Falsch, options ["Wahr","Falsch"]) und gap (Lückentext, options []).
- Bei mc: vier plausible Distraktoren, genau eine richtige Antwort in correct_answer.
- Bei tf: correct_answer ist "Wahr" oder "Falsch".
- Bei gap: correct_answer ist das fehlende Wort oder eine kurze Phrase.
- correct_answer darf mehrere akzeptierte Antworten enthalten, getrennt mit "|".
- Jede Frage bekommt eine knappe Erklärung.
- Keine Duplikate, keine trivialen Fragen, fachlich korrekt.`;
