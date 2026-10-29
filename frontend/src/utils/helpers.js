const DAY = 86400000;
const STORAGE_KEY = "pf_saved_prompts";

export const toPercent = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.round(n <= 10 ? n * 10 : n);
};

export const scoreLabel = (s) =>
  s >= 83 ? "Excellent" : s >= 78 ? "Good" : s >= 70 ? "Fair" : "Needs Polish";

export const scoreTone = (s) =>
  s >= 80
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    : s >= 70
    ? "text-indigo-300 bg-indigo-500/10 border-indigo-500/30"
    : "text-amber-400 bg-amber-500/10 border-amber-500/30";

export const timeAgo = (ts) => {
  if (!ts) return "Recently";
  const time = typeof ts === "string" ? new Date(ts).getTime() : Number(ts);
  if (Number.isNaN(time)) return "Recently";
  const d = Math.floor((Date.now() - time) / DAY);
  return d <= 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`;
};

// Local storage fallback helpers for saved prompts
export const getPrompts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const savePrompt = (prompt) => {
  try {
    const prompts = getPrompts();
    const item = {
      ...prompt,
      id: prompt.id || `prompt_${Date.now()}`,
      updatedAt: prompt.updatedAt || Date.now(),
    };
    const updated = [item, ...prompts.filter((p) => p.id !== item.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const deletePrompt = (id) => {
  try {
    const prompts = getPrompts().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    return prompts;
  } catch {
    return [];
  }
};