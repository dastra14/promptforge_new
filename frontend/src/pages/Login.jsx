import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    demoLogin();
    navigate("/create-prompt");
  };

  return (
    <AuthShell>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="mt-1 text-slate-400">Sign in to manage and evaluate your prompts</p>
        </div>

        {/* Instant Access Button */}
        <button
          type="button"
          onClick={handleDemoAccess}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 py-3 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
        >
          <Zap size={16} /> Instant Prototype / Demo Mode
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-line w-full"></div>
          <span className="bg-panel px-3 text-xs text-slate-500 uppercase tracking-wider">or sign in</span>
        </div>

        {error && <p className="rounded-xl bg-red-500/10 p-3 text-red-400 text-sm">{error}</p>}
        <div>
          <label className="label">Email</label>
          <input
            className="field"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <div className="flex justify-between">
            <label className="label">Password</label>
            <button type="button" className="text-sm text-indigo-400">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              className="field pr-12"
              type={show ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={onChange}
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-slate-300 text-sm">
          <input type="checkbox" defaultChecked className="accent-indigo-500" /> Remember me
        </label>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? "Logging in..." : "Login"} <ArrowRight size={18} />
        </button>
        <p className="border-t border-line pt-4 text-center text-slate-400 text-sm">
          New here? <Link to="/register" className="font-medium text-indigo-400">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}