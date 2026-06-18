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
            // We can still proceed since the user is registered
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
    <div className="min-h-screen bg-slate-50 flex justify-center items-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-100">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">Create an Account</h2>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={sendDetails} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Choose a username"
            />
            <p className="text-red-500 text-xs mt-1">{validate(userschema, username)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter your email"
            />
            <p className="text-red-500 text-xs mt-1">{validate(emailschema, email)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Create a password"
              />
              <p className="text-red-500 text-xs mt-1">{validate(passwordchema, password)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Phone Number"
              />
              <p className="text-red-500 text-xs mt-1">{validate(phoneschema, phone)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Biography (Optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              placeholder="Tell us a bit about yourself"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileimage(e.target.files[0])}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 rounded-lg transition-colors mt-6 flex justify-center items-center`}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-slate-600 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
