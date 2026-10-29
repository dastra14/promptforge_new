import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Search, Bug, Zap, Gauge, FlaskConical, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const FEATURES = [
  { icon: Sparkles, title: "Prompt Generator", text: "Enter a title and a few details and get a complete, ready-to-use prompt for your target AI." },
  { icon: Search, title: "Prompt Analyzer", text: "Finds unclear instructions, missing context and weak structure in any prompt." },
  { icon: Bug, title: "AI Prompt Debugger", text: "Pinpoints exactly what is wrong with your prompt and explains how to fix it." },
  { icon: Zap, title: "Prompt Improver", text: "Rewrites your rough prompt into a clear, effective one based on its real meaning." },
  { icon: Gauge, title: "Prompt Scoring", text: "Get an overall score so you know how strong your prompt is before using it." },
  { icon: FlaskConical, title: "Prompt Tester", text: "Run your prompt and see the AI's actual reply right inside the app." },
];

const STEPS = [
  ["Create", "Enter your title, context, tone and target AI."],
  ["Generate", "PromptForge builds a complete prompt for you."],
  ["Analyze & Score", "See problems, suggestions and a quality score."],
  ["Improve", "Get a better version of your prompt instantly."],
  ["Test", "Run it and check the AI's response."],
  ["Save & Reuse", "Keep your best prompts and find them again later."],
];

export default function Landing() {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (!user) demoLogin();
    navigate("/create-prompt");
  };

  return (
    <div>
      <Navbar />

      <section className="px-6 py-24 text-center">
        <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1 text-sm text-indigo-300">
          AI Prompt Engineering and Management Platform
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-6xl">
          Craft better prompts. Get better AI results.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          PromptForge generates, analyzes, improves and tests your prompts, so you stop
          guessing and start getting the output you want.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button onClick={handleStart} className="btn-primary px-6 py-3 text-base flex items-center gap-2 shadow-lg shadow-indigo-500/25">
            <Sparkles size={18} /> Launch Prompt Studio <ArrowRight size={16} />
          </button>
          {!user && (
            <Link to="/login" className="btn-ghost px-6 py-3 text-base">
              Login
            </Link>
          )}
        </div>
      </section>

      <section id="about" className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-white">What is PromptForge?</h2>
        <p className="mt-4 text-lg text-slate-400">
          Most prompts are vague, incomplete or badly structured, and the AI's answer suffers
          for it. PromptForge takes your idea, builds a strong prompt, checks it for problems,
          scores it, improves it and lets you test it, all in one place.
        </p>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold text-white">Features</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card transition hover:border-indigo-500/50">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <Icon size={22} />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold text-white">How it works</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <div key={title} className="card flex gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand font-bold text-white">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-white">Ready to forge your first prompt?</h2>
        <button onClick={handleStart} className="btn-primary mt-6 px-6 py-3 text-base inline-flex items-center gap-2">
          <Sparkles size={18} /> Launch Prompt Studio
        </button>
      </section>

      <Footer />
    </div>
  );
}