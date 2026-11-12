import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Headphones } from "lucide-react";
import { useAuth } from "../context/AuthContext";
export default function Login() {
  const { user, login } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  const [email,setEmail] = useState("admin@demo.com"); const [password,setPassword] = useState("admin123"); const [error,setError] = useState(""); const [busy,setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { await login(email,password); navigate((location.state as { from?: string } | null)?.from || "/dashboard",{replace:true}); } catch (e) { setError(e instanceof Error ? e.message : "Login failed."); } finally { setBusy(false); } }
  return <main className="login-page"><section className="login-card"><div className="brand-mark"><Headphones size={24}/></div><h1>Welcome to SupportDesk</h1><p className="muted">Sign in to manage customer support tickets.</p>
    <form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="btn btn-primary full-width" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button></form>
    <div className="demo-accounts"><strong>Demo accounts</strong><span>Admin: admin@demo.com / admin123</span><span>Manager: manager@demo.com / manager123</span><span>Agent: agent@demo.com / agent123</span></div>
  </section></main>;
}
