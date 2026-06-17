import { z } from "zod";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token") || localStorage.getItem("auth_token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

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
      let response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      let data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred during login.");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">Welcome Back</h2>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={sendDetails} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter your username"
            />
            <p className="text-red-500 text-xs mt-1">{validate(userschema, username)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter your password"
            />
            <p className="text-red-500 text-xs mt-1">{validate(passchema, password)}</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mt-4"
          >
            Login
          </button>
        </form>

        <p className="text-center text-slate-600 text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
