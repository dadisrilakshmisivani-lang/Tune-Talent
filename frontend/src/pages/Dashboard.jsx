import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileCard from "../components/ProfileCard";
import CompositionCard from "../components/CompositionCard";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch User Profile
        const profileRes = await fetch("http://localhost:3000/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        const profileData = await profileRes.json();
        
        if (!profileRes.ok || !profileData.user) {
          throw new Error(profileData.message || "Failed to fetch profile");
        }
        setUser(profileData.user);

        // Fetch User's Music Notes
        const notesRes = await fetch("http://localhost:3000/music/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        const notesData = await notesRes.json();
        if (notesRes.ok && notesData.notes) {
          setNotes(notesData.notes);
        }
        
      } catch (err) {
        console.error(err);
        if (err.message === "Invalid or Expired Token" || err.message === "No Token Provided") {
          logout();
          navigate("/login");
        } else {
          setError(err.message || "Error loading dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, refreshTrigger, logout, navigate]);

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="text-xl font-semibold text-slate-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-2xl shadow border border-red-100 text-center">
          <p className="text-red-500 font-medium">{error || "User not found"}</p>
          <button 
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Card */}
        <ProfileCard user={user} />

        {/* Music Notes Section */}
        <div>          
          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <CompositionCard key={note._id} note={note} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="text-4xl mb-4">🎼</div>
              <h3 className="text-xl font-medium text-slate-700 mb-2">No notes uploaded yet</h3>
              <p className="text-slate-500">Upload your first music note to see it here.</p>
            </div>
          )}
        </div>

        {/* Sequencer Teaser Section */}
        <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl mt-4">
          {/* Decorative background glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                Studio Workspace
              </span>
              <h3 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-cyan-100">
                Let's compose something new
              </h3>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                Ready to sketch out a new beat? Launch our interactive step sequencer to test rhythms, adjust speed, and design drums on a dedicated layout.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/compose"
                className="inline-block px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base transition duration-200 shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 transform cursor-pointer text-center w-full md:w-auto"
              >
                Open Beat Creator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
