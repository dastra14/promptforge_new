import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Trash2, Clock, Copy, Check, Search, Bookmark } from "lucide-react";
import { listPrompts, removePrompt } from "../api/promptsApi.js";
import { getPrompts, deletePrompt, scoreTone, timeAgo } from "../utils/helpers.js";

export default function SavedPrompts() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let mounted = true;
    listPrompts()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        } else {
          // If backend has no items, check local storage fallback
          const local = getPrompts();
          setItems(local);
        }
      })
      .catch((err) => {
        if (!mounted) return;
        // Fallback to local storage if backend is unreachable
        const local = getPrompts();
        if (local.length > 0) {
          setItems(local);
        } else {
          setError(err.message || "Failed to load saved prompts.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleRemove = async (id) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    try {
      await removePrompt(id).catch(() => {});
    } finally {
      // Always remove from local fallback and UI state
      deletePrompt(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text || "");
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shown = items.filter((p) => {
    const haystack = `${p.title || ""} ${p.description || ""} ${p.category || ""} ${p.model || ""}`.toLowerCase();
    return haystack.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Bookmark className="text-indigo-400" size={24} /> Saved Prompts Library
          </h1>
          <p className="mt-1 text-slate-400">
            Manage, search, and reuse your engineered prompts.
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="field pl-10"
            placeholder="Search prompts by keyword..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="py-12 text-center text-slate-400">Loading your saved prompts...</p>
      ) : shown.length === 0 ? (
        <div className="card flex flex-col items-center justify-center p-12 text-center">
          <Bookmark size={36} className="text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-white">No saved prompts found</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm">
            {q ? `No prompts matched "${q}". Try a different keyword.` : "You haven't saved any prompts yet. Use the Create Prompt or Analyzer page to save your best prompts."}
          </p>
          {!q && (
            <button
              onClick={() => navigate("/create-prompt")}
              className="btn-primary mt-5 px-5 py-2 text-sm"
            >
              Create Your First Prompt
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <div key={p.id} className="card flex flex-col p-5 hover:border-indigo-500/40 transition">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.category && (
                    <span className="rounded-lg border border-line bg-panel2 px-2 py-0.5 text-xs text-slate-300">
                      {p.category}
                    </span>
                  )}
                  {p.model && (
                    <span className="rounded-lg border border-line bg-panel2 px-2 py-0.5 text-xs text-indigo-300">
                      {p.model}
                    </span>
                  )}
                </div>
                {typeof p.score === "number" && (
                  <span className={`rounded-lg border px-2 py-0.5 text-xs font-semibold ${scoreTone(p.score)}`}>
                    {p.score}/100
                  </span>
                )}
              </div>

              <h3 className="mt-3 text-lg font-bold text-white line-clamp-1">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm text-slate-400 line-clamp-3">
                {p.description || p.text}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-3">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={13} /> {timeAgo(p.updatedAt)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    className="btn-ghost p-1.5 text-slate-400 hover:text-white"
                    title="Copy prompt text"
                    onClick={() => handleCopy(p.id, p.text || p.description)}
                  >
                    {copiedId === p.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                  <button
                    className="btn-ghost p-1.5 text-slate-400 hover:text-red-400"
                    title="Delete prompt"
                    onClick={() => handleRemove(p.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    className="btn-ghost px-2.5 py-1 text-xs gap-1"
                    onClick={() => navigate("/analyze", { state: { prompt: p.text || p.description } })}
                  >
                    Analyze <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}