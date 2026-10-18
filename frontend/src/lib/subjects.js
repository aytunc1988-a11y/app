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
  { id: "et", short: "ETG", name: "Elektrotechnik-Grundlagen", emoji: "⚡", bg: "bg-[#FFD6A5]" },
  { id: "it", short: "IT", name: "Informationstechnik", emoji: "💾", bg: "bg-[#BDB2FF]" },
  { id: "nin", short: "NIN", name: "Normen & Installation", emoji: "🔌", bg: "bg-[#FDFFB6]" },
  { id: "abu", short: "ABU", name: "Allgemeinbildung", emoji: "📚", bg: "bg-[#CAFFBF]" },
  { id: "pb", short: "PFLEGE", name: "Pflege & Betreuung", emoji: "🩺", bg: "bg-[#FFADAD]" },
  { id: "mt", short: "MED", name: "Med. Grundlagen", emoji: "💉", bg: "bg-[#9BF6FF]" },
  { id: "ap", short: "AP", name: "Arbeitsprozesse", emoji: "🛠️", bg: "bg-[#BDB2FF]" },
  { id: "prg", short: "PRG", name: "Programmieren", emoji: "💻", bg: "bg-[#FDFFB6]" },
  { id: "net", short: "NET", name: "Netzwerke", emoji: "🌐", bg: "bg-[#CAFFBF]" },
  { id: "db", short: "DB", name: "Datenbanken", emoji: "🗄️", bg: "bg-[#FFADAD]" },
  { id: "hk", short: "HK", name: "Haarkunde", emoji: "✂️", bg: "bg-[#9BF6FF]" },
  { id: "fc", short: "FC", name: "Farben & Chemie", emoji: "🎨", bg: "bg-[#BDB2FF]" },
  { id: "kb", short: "KB", name: "Kundenberatung", emoji: "💬", bg: "bg-[#FDFFB6]" },
  { id: "ll", short: "LL", name: "Lagerlogistik", emoji: "📦", bg: "bg-[#CAFFBF]" },
  { id: "tv", short: "TV", name: "Transport & Verkehr", emoji: "🚚", bg: "bg-[#FFADAD]" },
  { id: "as", short: "ASL", name: "Arbeitssicherheit & Logistik", emoji: "🦺", bg: "bg-[#9BF6FF]" },
  { id: "vb", short: "VB", name: "Verkaufsberatung", emoji: "🛍️", bg: "bg-[#BDB2FF]" },
  { id: "wb", short: "WB", name: "Warenwirtschaft", emoji: "🏷️", bg: "bg-[#FDFFB6]" },
  { id: "vr", short: "VR", name: "Verkehrsregeln", emoji: "🚦", bg: "bg-[#CAFFBF]" },
  { id: "sm", short: "SM", name: "Sicherheit & Manöver", emoji: "⚠️", bg: "bg-[#FFADAD]" },
  { id: "fu", short: "FU", name: "Fahrzeugtechnik", emoji: "🔧", bg: "bg-[#9BF6FF]" },
  { id: "bwl", short: "BWL", name: "Lernbereich BWL", emoji: "📈", bg: "bg-[#FDFFB6]" },
  { id: "vwl", short: "VWL", name: "Lernbereich VWL", emoji: "🌐", bg: "bg-[#CAFFBF]" },
  { id: "fr", short: "FR", name: "Französisch", emoji: "🇫🇷", bg: "bg-[#BDB2FF]" },
  { id: "elektro-st", short: "ST", name: "Lernbereich ST", emoji: "⚙️", bg: "bg-[#FFD6A5]" },
  { id: "elektro-mt", short: "MT", name: "Lernbereich MT", emoji: "📐", bg: "bg-[#9BF6FF]" },
  { id: "fage-he", short: "HE", name: "Lernbereich HE", emoji: "🩹", bg: "bg-[#FFADAD]" },
  { id: "sec", short: "SEC", name: "IT-Sicherheit", emoji: "🔐", bg: "bg-[#FFADAD]" },
  { id: "coiffeur-sm", short: "SM", name: "Lernbereich SM", emoji: "💇", bg: "bg-[#BDB2FF]" },
  { id: "detailhandel-kdh", short: "KDH", name: "Lernbereich KDH", emoji: "🤝", bg: "bg-[#FFD6A5]" },
  { id: "auto-vk", short: "VK", name: "Lernbereich VK", emoji: "🚘", bg: "bg-[#CAFFBF]" },
  { id: "auto-ftp", short: "FTP", name: "Lernbereich FTP", emoji: "🚗", bg: "bg-[#9BF6FF]" },
  { id: "fabe-ep", short: "EP", name: "Lernbereich EP", emoji: "🧩", bg: "bg-[#BDB2FF]" },
  { id: "fabe-srk", short: "SRK", name: "Lernbereich SRK", emoji: "🫶", bg: "bg-[#FFADAD]" },
  { id: "fabe-gpf", short: "GPF", name: "Lernbereich GPF", emoji: "🌱", bg: "bg-[#CAFFBF]" },
  { id: "poly-ft", short: "FT", name: "Lernbereich FT", emoji: "🛠️", bg: "bg-[#FFD6A5]" },
  { id: "poly-wmt", short: "WMT", name: "Lernbereich WMT", emoji: "⚙️", bg: "bg-[#9BF6FF]" },
  { id: "poly-cad", short: "CAD", name: "CAD", emoji: "📐", bg: "bg-[#BDB2FF]" },
  { id: "poly-mth", short: "MTH", name: "Lernbereich MTH", emoji: "📏", bg: "bg-[#FDFFB6]" },
  { id: "poly-ets", short: "ETS", name: "Lernbereich ETS", emoji: "🔌", bg: "bg-[#CAFFBF]" },
  { id: "mediamatik-dm", short: "DM", name: "Lernbereich DM", emoji: "🎨", bg: "bg-[#FFADAD]" },
  { id: "mediamatik-mpr", short: "MPR", name: "Lernbereich MPR", emoji: "🎬", bg: "bg-[#BDB2FF]" },
  { id: "mediamatik-ictm", short: "ICTM", name: "Lernbereich ICTM", emoji: "💻", bg: "bg-[#9BF6FF]" },
  { id: "hotel-gas", short: "GAS", name: "Lernbereich GAS", emoji: "🍽️", bg: "bg-[#FDFFB6]" },
  { id: "hotel-hkr", short: "HKR", name: "Lernbereich HKR", emoji: "🧹", bg: "bg-[#CAFFBF]" },
  { id: "hotel-rec", short: "REC", name: "Lernbereich REC", emoji: "🛎️", bg: "bg-[#FFADAD]" },
  { id: "pharma-pharm", short: "PHARM", name: "Pharmazie", emoji: "💊", bg: "bg-[#9BF6FF]" },
  { id: "pharma-gal", short: "GAL", name: "Lernbereich GAL", emoji: "🧪", bg: "bg-[#BDB2FF]" },
  { id: "pharma-otc", short: "OTC", name: "Lernbereich OTC", emoji: "🩺", bg: "bg-[#FDFFB6]" },
];

const EFZ_PRACTICAL_KNOWLEDGE_GENERAL_AREAS = [
  "Praktische Arbeit",
  "Berufskenntnisse",
  "Allgemeinbildung",
];
const EFZ_PRACTICAL_GENERAL_AREAS = ["Praktische Arbeit", "Allgemeinbildung"];

export const PROFESSIONS = [
  { id: "kaufmann", short: "Kaufmann", name: "Kaufmann/-frau EFZ", emoji: "📊", bg: "bg-[#FDFFB6]", sourceUrl: "https://www.becc.admin.ch/becc/public/bvz/beruf/show/68800", regulationUrl: "https://www.fedlex.admin.ch/eli/cc/2021/495/de", qualificationAreas: ["Praktische Arbeit", "Berufskenntnisse und Allgemeinbildung"], subjects: ["rechnungswesen", "bwl", "vwl", "wg", "ika", "deutsch", "englisch", "fr", "abu"] },
  { id: "elektro", short: "Elektro", name: "Elektroinstallateur/in EFZ", emoji: "⚡", bg: "bg-[#FFD6A5]", sourceUrl: "https://www.becc.admin.ch/becc/public/bvz/beruf/show/47423", regulationUrl: "https://www.fedlex.admin.ch/eli/cc/2025/463/de", qualificationAreas: EFZ_PRACTICAL_KNOWLEDGE_GENERAL_AREAS, subjects: ["et", "it", "nin", "elektro-st", "elektro-mt", "deutsch", "englisch", "abu"] },
  { id: "gesundheit", short: "Gesundheit", name: "Fachfrau/-mann Gesundheit EFZ", emoji: "🩺", bg: "bg-[#FFADAD]", sourceUrl: "https://www.becc.admin.ch/becc/public/bvz/beruf/show/86918", regulationUrl: "https://www.fedlex.admin.ch/eli/cc/2026/446/de", qualificationAreas: EFZ_PRACTICAL_KNOWLEDGE_GENERAL_AREAS, qualificationNote: "Diese Bildungsverordnung gilt für Lehrbeginn ab 2027. Für frühere Lehrverhältnisse gilt die jeweilige bisherige Bildungsverordnung.", subjects: ["pb", "mt", "ap", "fage-he", "deutsch", "englisch", "abu"] },
  { id: "informatik", short: "Informatik", name: "Informatiker/in EFZ", emoji: "💻", bg: "bg-[#9BF6FF]", sourceUrl: "https://www.becc.admin.ch/becc/public/bvz/beruf/show/88611", regulationUrl: "https://www.fedlex.admin.ch/eli/cc/2020/941/de", qualificationAreas: EFZ_PRACTICAL_GENERAL_AREAS, subjects: ["prg", "net", "sec", "db", "deutsch", "englisch", "abu"] },
  { id: "coiffeur", short: "Coiffeur", name: "Coiffeur/-euse EFZ", emoji: "✂️", bg: "bg-[#BDB2FF]", sourceUrl: "https://www.becc.admin.ch/becc/public/bvz/beruf/show/82016", regulationUrl: "https://www.fedlex.admin.ch/eli/cc/2023/425/de", qualificationAreas: EFZ_PRACTICAL_GENERAL_AREAS, subjects: ["hk", "fc", "coiffeur-sm", "kb", "abu"] },
  { id: "logistik", short: "Logistik", name: "Logistiker/in EFZ", emoji: "📦", bg: "bg-[#CAFFBF]", sourceUrl: "https://www.becc.admin.ch/becc/public/bvz/beruf/show/95512", regulationUrl: "https://www.fedlex.admin.ch/eli/cc/2023/565/de", qualificationAreas: EFZ_PRACTICAL_GENERAL_AREAS, subjects: ["ll", "tv", "as", "deutsch", "abu"] },
  { id: "detailhandel", short: "Detailhandel", name: "Detailhandelsfachmann/-frau EFZ", emoji: "🛍️", bg: "bg-[#FFD6A5]", sourceUrl: "https://www.becc.admin.ch/becc/public/bvz/beruf/show/71900", regulationUrl: "https://www.fedlex.admin.ch/eli/cc/2021/314/de", qualificationAreas: EFZ_PRACTICAL_KNOWLEDGE_GENERAL_AREAS, subjects: ["vb", "wb", "detailhandel-kdh", "wg", "deutsch", "englisch", "abu"] },
  { id: "auto", short: "Auto", name: "Theorieprüfung Auto (Kat. B)", emoji: "🚗", bg: "bg-[#9BF6FF]", qualificationNote: "Auto Kat. B ist kein EFZ-Beruf. Die folgenden Fächer sind Lernkategorien zur Vorbereitung auf die Theorieprüfung, keine beruflichen Qualifikationsbereiche.", subjects: ["vr", "auto-vk", "sm", "fu", "auto-ftp"] },
  { id: "fabe", short: "FaBe", name: "Fachfrau/-mann Betreuung EFZ", emoji: "🫶", bg: "bg-[#FFADAD]", sourceUrl: "https://www.becc.admin.ch/becc/public/bvz/beruf/show/94308", regulationUrl: "https://www.fedlex.admin.ch/eli/cc/2020/678/de", qualificationAreas: EFZ_PRACTICAL_KNOWLEDGE_GENERAL_AREAS, subjects: ["fabe-ep", "fabe-srk", "fabe-gpf", "deutsch", "abu"] },
  { id: "polymechanik", short: "Polymechanik", name: "Polymechaniker/in EFZ", emoji: "⚙️", bg: "bg-[#FFD6A5]", sourceUrl: "https://www.becc.admin.ch/becc/public/bvz/beruf/show/45708", regulationUrl: "https://www.fedlex.admin.ch/eli/cc/2025/572/de", qualificationAreas: EFZ_PRACTICAL_GENERAL_AREAS, subjects: ["poly-ft", "poly-wmt", "poly-cad", "poly-mth", "poly-ets", "deutsch", "abu"] },
  { id: "mediamatik", short: "Mediamatik", name: "Mediamatiker/in EFZ", emoji: "🎬", bg: "bg-[#9BF6FF]", sourceUrl: "https://www.becc.admin.ch/becc/public/bvz/beruf/show/88606", regulationUrl: "https://www.fedlex.admin.ch/eli/cc/2018/769/de", qualificationAreas: EFZ_PRACTICAL_GENERAL_AREAS, subjects: ["mediamatik-dm", "mediamatik-mpr", "mediamatik-ictm", "deutsch", "englisch", "abu"] },
  { id: "hotellerie", short: "Hotellerie", name: "Fachfrau/-mann Hotellerie-Hauswirtschaft EFZ", emoji: "🛎️", bg: "bg-[#CAFFBF]", sourceUrl: "https://www.becc.admin.ch/becc/public/bvz/beruf/show/78404", regulationUrl: "https://www.fedlex.admin.ch/eli/cc/2023/433/de", qualificationAreas: EFZ_PRACTICAL_GENERAL_AREAS, subjects: ["hotel-gas", "hotel-hkr", "hotel-rec", "deutsch", "englisch", "fr", "abu"] },
  { id: "apotheke", short: "Apotheke", name: "Fachfrau/-mann Apotheke EFZ", emoji: "💊", bg: "bg-[#BDB2FF]", sourceUrl: "https://www.becc.admin.ch/becc/public/bvz/beruf/show/70611", regulationUrl: "https://www.fedlex.admin.ch/eli/cc/2021/454/de", qualificationAreas: EFZ_PRACTICAL_KNOWLEDGE_GENERAL_AREAS, subjects: ["pharma-pharm", "pharma-gal", "pharma-otc", "deutsch", "abu"] },
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
