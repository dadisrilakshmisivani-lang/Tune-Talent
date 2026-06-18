import { z } from "zod";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

let userschema = z.string().min(3, "Username must be at least 3 characters").max(16, "Max length should be 16 characters");
let passchema = z.string().min(6, "Password must be at least 6 characters").max(16, "Max length should be 16 characters");

function validate(schema, value) {
  if (!value) return "";
  let result = schema.safeParse(value);
  if (result.success) return "";
  return result.error.issues[0].message;
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  let sendDetails = async (event) => {
    event.preventDefault();
    setError("");

    const userError = validate(userschema, username);
    const passError = validate(passchema, password);

    if (userError || passError) {
      setError("Please fix the validation errors.");
      return;
    }

    try {
      setLoading(true);
      let response = await fetch("https://tune-talent.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      let data = await response.json();

      if (response.ok && data.token) {
        login(data.token);
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred during login.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base flex justify-center items-center px-4 pt-16 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[120px] -z-10"></div>
      <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-fuchsia-600/8 blur-[120px] -z-10"></div>

      <div className="glass-card p-8 rounded-3xl shadow-2xl shadow-violet-500/5 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Welcome Back</h2>
          <p className="text-text-muted text-sm mt-1">Sign in to your TuneTalent account</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={sendDetails} className="space-y-5">
          <div>
            <label htmlFor="login-username" className="block text-sm font-medium text-text-secondary mb-1.5">Username</label>
            <input
              id="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              autoComplete="username"
              className="w-full p-3 bg-surface-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all duration-200"
              placeholder="Enter your username"
            />
            {validate(userschema, username) && (
              <p className="text-red-400 text-xs mt-1.5">{validate(userschema, username)}</p>
            )}
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
            <input
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              className="w-full p-3 bg-surface-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all duration-200"
              placeholder="Enter your password"
            />
            {validate(passchema, password) && (
              <p className="text-red-400 text-xs mt-1.5">{validate(passchema, password)}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3 rounded-xl transition-all duration-200 cursor-pointer mt-2 ${
              loading
                ? "bg-violet-600/50 text-violet-200"
                : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-text-primary shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
