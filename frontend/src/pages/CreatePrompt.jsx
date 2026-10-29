import { useState } from "react";
import { Sparkles, RotateCcw, Bot, Copy, FlaskConical, Search, Bookmark, Check, Zap } from "lucide-react";
import { generatePrompt, analyzePrompt, testPrompt } from "../api/aiApi.js";
import { toPercent, savePrompt } from "../utils/helpers.js";
import { createPrompt } from "../api/promptsApi.js";
import { useCredits } from "../context/CreditsContext.jsx";
import CreditNote from "../components/CreditNote.jsx";
import AnalysisCard from "../components/AnalysisCard.jsx";

const EMPTY = { title: "", task: "", context: "", moreInfo: "", tone: "Professional", targetAI: "ChatGPT" };
const TONES = ["Professional", "Creative", "Academic", "Artistic", "Friendly"];
const TARGETS = ["ChatGPT", "Claude", "Gemini", "Midjourney", "Stable Diffusion", "CodeLlama"];

const TEMPLATES = {
  "Goods & Transport Services": {
    title: "Website for Goods and Transport Services",
    task: "Design and architect a modern, full-stack web platform for a goods and logistics transport company, including real-time cargo tracking, instant quote calculators, driver dispatching, and booking management.",
    context: "The client operates an interstate and local freight transport business with a fleet of trucks, warehouses, and corporate client accounts needing reliable delivery schedules.",
    moreInfo: "Include database architecture recommendations, core API endpoints, responsive mobile layout, and security/compliance considerations.",
    tone: "Professional",
    targetAI: "ChatGPT",
  },
  "Technical Code Auditor": {
    title: "Technical Code Auditor",
    task: "Act as a senior software engineer and review the code I provide for bugs, security issues and performance problems.",
    context: "The code belongs to a production web application written in Python and JavaScript.",
    moreInfo: "Return findings as a prioritized list, each with a short fix.",
    tone: "Professional",
    targetAI: "ChatGPT",
  },
  "Academic Literature Synthesizer": {
    title: "Academic Literature Synthesizer",
    task: "Act as a research assistant and synthesize the key findings of several academic papers on one topic.",
    context: "The reader is an undergraduate student writing a literature review.",
    moreInfo: "Use simple language, group findings by theme and end with research gaps.",
    tone: "Academic",
    targetAI: "Claude",
  },
};

export default function CreatePrompt() {
  const [form, setForm] = useState(EMPTY);
  const [generated, setGenerated] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [testReply, setTestReply] = useState("");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const { withCredits } = useCredits();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const run = async (name, fn) => {
    setError("");
    setLoading(name);
    try {
      await fn();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Operation failed");
    } finally {
      setLoading("");
    }
  };

  const reset = () => {
    setForm(EMPTY);
    setGenerated("");
    setAnalysis(null);
    setTestReply("");
    setError("");
    setSaved(false);
  };

  const handleGenerate = () =>
    run("generate", async () => {
      setAnalysis(null);
      setTestReply("");
      setSaved(false);
      const payload = {
        ...form,
        task: form.task?.trim() || "Design and develop a complete, high-quality solution with architectural specifications, core features, and technical constraints.",
      };
      const result = await withCredits("generate", () => generatePrompt(payload));
      setGenerated(result);
    });

  const handleAnalyze = () =>
    run("analyze", async () =>
      setAnalysis(await withCredits("analyze", () => analyzePrompt(generated)))
    );

  const handleTest = () =>
    run("test", async () =>
      setTestReply(await withCredits("test", () => testPrompt(generated)))
    );

  const handleSave = () =>
    run("save", async () => {
      const promptItem = {
        category: form.tone,
        model: form.targetAI,
        title: form.title || "Custom Generated Prompt",
        description: (form.task || form.title || "AI Prompt").slice(0, 110),
        text: generated,
        score: analysis ? toPercent(analysis.overallScore) : 88,
        updatedAt: Date.now(),
      };

      try {
        await createPrompt(promptItem);
      } catch {
        // Fallback to local storage if backend is offline
        savePrompt(promptItem);
      }
      setSaved(true);
    });

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Quick Start Templates */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Sparkles size={18} className="text-indigo-400" /> Quick Start Templates &amp; Presets
            <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">ONE-CLICK</span>
          </h2>
          <p className="mt-1 text-slate-400">Load a pre-configured template or type your title below to generate immediately.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {Object.keys(TEMPLATES).map((name) => (
            <button
              key={name}
              className={`btn-ghost text-xs ${name.includes("Goods") ? "border-indigo-500/60 bg-indigo-500/15 text-indigo-300 font-semibold" : ""}`}
              onClick={() => {
                setForm(TEMPLATES[name]);
                setGenerated("");
                setAnalysis(null);
                setTestReply("");
              }}
            >
              {name.includes("Goods") && <Zap size={13} className="mr-1 inline text-indigo-400" />}
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: form */}
        <div className="card space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Prompt Specifications</h2>
              <p className="text-slate-400">Define context, objectives, and target model</p>
            </div>
            <button className="btn-ghost" onClick={reset}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div>
            <label className="label">
              Prompt Title <span className="text-red-400">*</span>
            </label>
            <input
              className="field"
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="e.g. Website for goods and transport services"
            />
          </div>

          <div>
            <label className="label">What do you want the AI to do?</label>
            <textarea
              className="field"
              rows={4}
              name="task"
              value={form.task}
              onChange={onChange}
              placeholder="Describe the core objective (e.g. Design a web platform for freight logistics with live tracking and quote calculator...)"
            />
          </div>

          <div>
            <label className="label">Context &amp; Background Information</label>
            <textarea
              className="field"
              rows={3}
              name="context"
              value={form.context}
              onChange={onChange}
              placeholder="Target audience, operational scale, or business scenario"
            />
          </div>

          <div>
            <label className="label">Output format &amp; constraints</label>
            <textarea
              className="field"
              rows={2}
              name="moreInfo"
              value={form.moreInfo}
              onChange={onChange}
              placeholder="e.g. Clean markdown headings, database schema, REST endpoints"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tone</label>
              <select className="field" name="tone" value={form.tone} onChange={onChange}>
                {TONES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Target AI</label>
              <select className="field" name="targetAI" value={form.targetAI} onChange={onChange}>
                {TARGETS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="btn-primary w-full py-3 text-base font-semibold shadow-lg shadow-indigo-500/20"
            onClick={handleGenerate}
            disabled={!form.title.trim() || !!loading}
          >
            <Sparkles size={18} /> {loading === "generate" ? "Generating Prompt..." : "Generate Prompt"}
          </button>
          <CreditNote action="generate" />
        </div>

        {/* Right: result */}
        <div className="space-y-6">
          {error && <p className="rounded-xl bg-red-500/10 p-4 text-red-400">{error}</p>}

          {!generated ? (
            <div className="card flex flex-col items-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-panel2 text-indigo-400">
                <Bot size={26} />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">Ready to Generate</h2>
              <p className="mt-2 text-slate-400 text-sm max-w-sm">
                Enter your title on the left (e.g. <em>Website for goods and transport services</em>) or click a template to generate a structured, production-ready prompt.
              </p>
              <div className="mt-6 w-full rounded-xl border border-line bg-panel2 p-5 text-left">
                <h3 className="text-xs font-semibold tracking-wider text-indigo-300">PROMPTFORGE ENGINEERING FEATURES</h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-400">
                  <li>• Automatic role assignment and business domain calibration.</li>
                  <li>• Built-in prototype mode: works instantly even offline.</li>
                  <li>• Automated prompt quality scoring &amp; A/B testing.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Generated Prompt</h2>
                <span className="rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
                  Ready to Use
                </span>
              </div>
              <textarea
                className="field font-mono text-xs leading-relaxed"
                rows={12}
                value={generated}
                onChange={(e) => setGenerated(e.target.value)}
              />
              <div className="flex flex-wrap gap-2.5">
                <button className="btn-primary" onClick={handleAnalyze} disabled={!!loading}>
                  <Search size={16} /> {loading === "analyze" ? "Analyzing..." : "Analyze Quality"}
                </button>
                <button className="btn-ghost" onClick={handleTest} disabled={!!loading}>
                  <FlaskConical size={16} /> {loading === "test" ? "Testing..." : "Test AI Reply"}
                </button>
                <button className="btn-ghost" onClick={handleCopy}>
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button className="btn-ghost" onClick={handleSave} disabled={saved}>
                  <Bookmark size={16} /> {saved ? "Saved ✓" : "Save Prompt"}
                </button>
              </div>
            </div>
          )}

          {analysis && <AnalysisCard analysis={analysis} onUse={setGenerated} />}

          {testReply && (
            <div className="card space-y-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FlaskConical size={18} className="text-indigo-400" /> AI Response Output
              </h2>
              <div className="rounded-xl border border-line bg-panel2 p-4 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-mono">
                {testReply}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}