import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Search,
  GitCompare,
  Bookmark,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { listPrompts } from "../api/promptsApi.js";
import { getPrompts, scoreTone, timeAgo } from "../utils/helpers.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCredits } from "../context/CreditsContext.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance } = useCredits();

  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    listPrompts()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setPrompts(data);
        } else {
          setPrompts(getPrompts());
        }
      })
      .catch(() => {
        if (!mounted) return;
        setPrompts(getPrompts());
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const totalPrompts = prompts.length;
  const scoredPrompts = prompts.filter((p) => typeof p.score === "number" && p.score > 0);
  const avgScore = scoredPrompts.length
    ? Math.round(scoredPrompts.reduce((acc, cur) => acc + cur.score, 0) / scoredPrompts.length)
    : 0;

  const recentPrompts = prompts.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-r from-indigo-950/40 via-panel to-panel p-6 sm:p-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <Zap size={13} /> AI Prompt Studio Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.name || "Creator"}!
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Generate, analyze, refine, and organize your prompts with AI-driven scoring and best practices.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <Bookmark size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{loading ? "..." : totalPrompts}</div>
            <div className="text-xs text-slate-400">Saved Prompts</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {loading ? "..." : avgScore > 0 ? `${avgScore}/100` : "N/A"}
            </div>
            <div className="text-xs text-slate-400">Avg Quality Score</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <Zap size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{balance ?? 0}</div>
            <div className="text-xs text-slate-400">Credits Remaining</div>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">Active</div>
            <div className="text-xs text-slate-400">Analyzer Engine</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Quick Studio Tools</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            to="/create-prompt"
            className="card group flex flex-col justify-between p-5 hover:border-indigo-500/50 transition"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                <Sparkles size={20} />
              </div>
              <h3 className="mt-3 font-semibold text-white">Create Prompt</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Generate high-performance prompts based on role, task, context, and model parameters.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-400">
              Launch Generator <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            to="/analyze"
            className="card group flex flex-col justify-between p-5 hover:border-indigo-500/50 transition"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                <Search size={20} />
              </div>
              <h3 className="mt-3 font-semibold text-white">Prompt Analyzer</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Detect vagueness, test clarity, evaluate constraints, and view automated quality scores.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-400">
              Open Analyzer <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            to="/compare"
            className="card group flex flex-col justify-between p-5 hover:border-indigo-500/50 transition"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                <GitCompare size={20} />
              </div>
              <h3 className="mt-3 font-semibold text-white">Compare Prompts</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Run side-by-side A/B quality comparisons to find the best formulation for your AI.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-400">
              Start Comparison <ArrowRight size={14} />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Prompts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Prompts</h2>
          {prompts.length > 0 && (
            <Link to="/saved" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              View all ({prompts.length}) <ArrowRight size={13} />
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 py-6">Loading recent prompts...</p>
        ) : recentPrompts.length === 0 ? (
          <div className="card p-8 text-center flex flex-col items-center">
            <PlusCircle size={32} className="text-slate-600 mb-2" />
            <h3 className="text-white font-semibold">No prompts saved yet</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">
              Start building your prompt repository. Formulate a prompt with the Generator or Analyzer and save it here.
            </p>
            <button
              onClick={() => navigate("/create-prompt")}
              className="btn-primary mt-4 px-4 py-2 text-xs"
            >
              Create New Prompt
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recentPrompts.map((p) => (
              <div key={p.id} className="card p-5 flex flex-col justify-between hover:border-indigo-500/40 transition">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg border border-line bg-panel2 px-2 py-0.5 text-xs text-slate-300">
                      {p.category || "General"}
                    </span>
                    {typeof p.score === "number" && (
                      <span className={`rounded-lg border px-2 py-0.5 text-xs font-semibold ${scoreTone(p.score)}`}>
                        {p.score}/100
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-base font-bold text-white line-clamp-1">{p.title}</h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {p.description || p.text}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={12} /> {timeAgo(p.updatedAt)}
                  </span>
                  <button
                    className="btn-ghost px-2.5 py-1 text-xs gap-1"
                    onClick={() => navigate("/analyze", { state: { prompt: p.text || p.description } })}
                  >
                    Open in Analyzer <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}