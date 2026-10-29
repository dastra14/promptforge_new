import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, Target, RotateCcw, FlaskConical } from "lucide-react";
import { analyzePrompt, testPrompt } from "../api/aiApi.js";
import { useCredits } from "../context/CreditsContext.jsx";
import CreditNote from "../components/CreditNote.jsx";
import AnalysisCard from "../components/AnalysisCard.jsx";

const SAMPLES = {
  "Goods & Transport Logistics":
    "Act as a Principal Full-Stack Architect. Design a production-grade web platform for a Goods and Transport Services company with live GPS cargo tracking, instant quote calculators, fleet dispatch dashboards, and digital proof-of-delivery.\n\nContext: B2B freight and consumer delivery operations.\n\nRequirements: Provide modular architecture, database schema recommendations, and REST API endpoints in clean Markdown.",
  "Study Schedule":
    "Act as an expert academic advisor and tutor. Create a detailed 4-week study plan for an engineering undergraduate preparing for 5 core semester exams.\n\nContext: The student has 6 hours per day available on weekdays and 8 hours on weekends. Subjects include Operating Systems, Database Management Systems, Computer Networks, Theory of Computation, and Software Engineering.\n\nRequirements: Give a week-by-week table, include revision days, and keep the tone motivating.",
  "Code Reviewer":
    "Act as a senior Python developer. Review the code below for bugs, security issues and performance problems. List each issue with its line, why it matters, and a corrected snippet. Keep the answer under 300 words.",
  "Ambiguous Short Draft": "write something about space",
};

export default function Analyzer() {
  const location = useLocation();
  const [prompt, setPrompt] = useState(location.state?.prompt || "");
  const [analysis, setAnalysis] = useState(null);
  const [testReply, setTestReply] = useState("");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const { withCredits, costs } = useCredits();

  const words = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;

  const run = async (name, fn) => {
    setError("");
    setLoading(name);
    try {
      await fn();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading("");
    }
  };

  const clear = () => { setPrompt(""); setAnalysis(null); setTestReply(""); setError(""); };

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Target size={18} className="text-indigo-400" /> Quick Benchmark Samples
            <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs text-indigo-300">READY TO TEST</span>
          </h2>
          <p className="mt-1 text-slate-400">Load a pre-built prompt to test the analysis engine across varying quality grades.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(SAMPLES).map(([name, text]) => (
            <button key={name} className="btn-ghost" onClick={() => { setPrompt(text); setAnalysis(null); setTestReply(""); }}>
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Prompt Editor</h2>
            <p className="text-slate-400">Paste or edit the prompt you want to evaluate</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-500">{words} words · {prompt.length} chars</span>
            <button className="btn-ghost" onClick={clear}><RotateCcw size={14} /> Clear</button>
          </div>
        </div>
        <textarea className="field font-mono text-sm" rows={12} value={prompt}
          onChange={(e) => setPrompt(e.target.value)} placeholder="Paste your prompt here..." />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            Evaluation criteria: Clarity, Context, Specificity, Structure, and Expected Output.
          </p>
          <div className="flex gap-3">
            <button className="btn-ghost" disabled={!prompt.trim() || !!loading}
              onClick={() =>
                run("test", async () =>
                  setTestReply(await withCredits("test", () => testPrompt(prompt)))
                )
              }>
              <FlaskConical size={16} /> {loading === "test" ? "Testing..." : `Test Prompt · ${costs.test}`}
            </button>
            <button className="btn-primary" disabled={!prompt.trim() || !!loading}
              onClick={() =>
                run("analyze", async () =>
                  setAnalysis(await withCredits("analyze", () => analyzePrompt(prompt)))
                )
              }>
              <Search size={16} /> {loading === "analyze" ? "Analyzing..." : `Analyze Prompt · ${costs.analyze}`}
            </button>
          </div>
        </div>
        <CreditNote action="analyze" />
      </div>

      {error && <p className="rounded-xl bg-red-500/10 p-4 text-red-400">{error}</p>}
      {analysis && <AnalysisCard analysis={analysis} onUse={setPrompt} />}
      {testReply && (
        <div className="card">
          <h2 className="mb-2 text-xl font-bold text-white">AI Reply</h2>
          <p className="whitespace-pre-wrap text-slate-300">{testReply}</p>
        </div>
      )}
    </div>
  );
}