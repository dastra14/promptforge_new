import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import AuthShell from "../components/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
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
          <h2 className="text-2xl font-bold text-white">Create your account</h2>
          <p className="mt-1 text-slate-400">Start building better prompts today</p>
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
          <span className="bg-panel px-3 text-xs text-slate-500 uppercase tracking-wider">or register</span>
        </div>

        {error && <p className="rounded-xl bg-red-500/10 p-3 text-red-400 text-sm">{error}</p>}
        <div>
          <label className="label">Full name</label>
          <input className="field" name="name" placeholder="Enter your name" value={form.name} onChange={onChange} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="field" type="email" name="email" placeholder="Enter your email" value={form.email} onChange={onChange} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="field" type="password" name="password" placeholder="At least 6 characters" value={form.password} onChange={onChange} required />
        </div>
        <div>
          <label className="label">Confirm password</label>
          <input className="field" type="password" name="confirm" placeholder="Repeat your password" value={form.confirm} onChange={onChange} required />
        </div>
        <button className="btn-primary w-full py-3" disabled={loading}>
          {loading ? "Creating account..." : "Register"} <ArrowRight size={18} />
        </button>
        <p className="border-t border-line pt-4 text-center text-slate-400 text-sm">
          Already have an account? <Link to="/login" className="font-medium text-indigo-400">Login</Link>
        </p>
      </form>
    </AuthShell>
  );
}