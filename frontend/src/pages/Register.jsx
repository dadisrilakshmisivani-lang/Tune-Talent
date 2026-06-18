import { z } from "zod";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

let userschema = z.string().min(3, "Username must be at least 3 characters").max(16, "Max limit 16 characters");
let passwordchema = z.string().min(6, "Password must be at least 6 characters").max(16, "Max limit 16 characters");
let emailschema = z.string().email("Invalid email address");
let phoneschema = z.string().min(10, "Phone number must be at least 10 digits");

function validate(schema, value) {
  if (!value) return "";
  let result = schema.safeParse(value);
  if (result.success) return "";
  return result.error.issues[0].message;
}

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [profileimage, setProfileimage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  let sendDetails = async (e) => {
    e.preventDefault();
    setError("");

    const userError = validate(userschema, username);
    const emailError = validate(emailschema, email);
    const passError = validate(passwordchema, password);
    const phoneError = validate(phoneschema, phone);

    if (userError || emailError || passError || phoneError) {
      setError("Please fix the validation errors.");
      return;
    }

    try {
      setLoading(true);
      let response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });
      let data = await response.json();

      if (response.ok && data.token) {
        login(data.token);

        // Upload additional profile details if provided
        if (bio || phone || profileimage) {
          const formData = new FormData();
          if (bio) formData.append("bio", bio);
          if (phone) formData.append("phone", phone);
          if (profileimage) formData.append("profileimage", profileimage);

          try {
            await fetch("http://localhost:3000/profile/update", {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${data.token}`,
              },
              credentials: "include",
              body: formData,
            });
          } catch (updateErr) {
            console.error("Profile update failed:", updateErr);
          }
        }

        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred during registration.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base flex justify-center items-center px-4 py-20 pt-24 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-fuchsia-600/10 blur-[120px] -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[120px] -z-10"></div>

      <div className="glass-card p-8 rounded-3xl shadow-2xl shadow-violet-500/5 w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Create an Account</h2>
          <p className="text-text-muted text-sm mt-1">Join the TuneTalent community</p>
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
            <label htmlFor="reg-username" className="block text-sm font-medium text-text-secondary mb-1.5">Username *</label>
            <input
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              autoComplete="username"
              className="w-full p-3 bg-surface-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all duration-200"
              placeholder="Choose a username"
            />
            {validate(userschema, username) && <p className="text-red-400 text-xs mt-1.5">{validate(userschema, username)}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-text-secondary mb-1.5">Email *</label>
            <input
              id="reg-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              className="w-full p-3 bg-surface-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all duration-200"
              placeholder="Enter your email"
            />
            {validate(emailschema, email) && <p className="text-red-400 text-xs mt-1.5">{validate(emailschema, email)}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-text-secondary mb-1.5">Password *</label>
              <input
                id="reg-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                className="w-full p-3 bg-surface-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all duration-200"
                placeholder="Create a password"
              />
              {validate(passwordchema, password) && <p className="text-red-400 text-xs mt-1.5">{validate(passwordchema, password)}</p>}
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-text-secondary mb-1.5">Phone *</label>
              <input
                id="reg-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                autoComplete="tel"
                className="w-full p-3 bg-surface-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all duration-200"
                placeholder="Phone Number"
              />
              {validate(phoneschema, phone) && <p className="text-red-400 text-xs mt-1.5">{validate(phoneschema, phone)}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="reg-bio" className="block text-sm font-medium text-text-secondary mb-1.5">Biography <span className="text-text-muted">(Optional)</span></label>
            <textarea
              id="reg-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-surface-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all duration-200 resize-none"
              placeholder="Tell us about your musical journey"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="reg-profileimage" className="block text-sm font-medium text-text-secondary mb-1.5">Profile Image <span className="text-text-muted">(Optional)</span></label>
            <input
              id="reg-profileimage"
              type="file"
              accept="image/*"
              onChange={(e) => setProfileimage(e.target.files[0])}
              className="w-full p-2.5 bg-surface-elevated border border-border-subtle rounded-xl text-text-secondary focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-500/10 file:text-violet-400 hover:file:bg-violet-500/20 file:cursor-pointer"
            />
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
