import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileCard from "../components/ProfileCard";
import CompositionCard from "../components/CompositionCard";
import BidderDetails from "../components/BidderDetails";

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-surface-base px-6 md:px-12 pt-24 md:pt-32 pb-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile skeleton */}
        <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-28 h-28 rounded-full skeleton shrink-0"></div>
          <div className="space-y-3 flex-grow w-full">
            <div className="h-8 w-48 skeleton"></div>
            <div className="h-4 w-36 skeleton"></div>
            <div className="h-4 w-64 skeleton"></div>
          </div>
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex justify-between">
                <div className="h-6 w-32 skeleton"></div>
                <div className="h-6 w-16 skeleton rounded-lg"></div>
              </div>
              <div className="h-4 w-full skeleton"></div>
              <div className="h-4 w-3/4 skeleton"></div>
              <div className="h-10 w-full skeleton rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
        const profileRes = await fetch("https://tune-talent.onrender.com/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (profileRes.status === 429) throw new Error("Too many requests. Please slow down and try again later.");
        const profileData = await profileRes.json();

        if (!profileRes.ok || !profileData.user) {
          throw new Error(profileData.message || "Failed to fetch profile");
        }
        setUser(profileData.user);

        // Fetch User's Music Notes
        const notesRes = await fetch("https://tune-talent.onrender.com/music/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (notesRes.status === 429) throw new Error("Too many requests. Please slow down and try again later.");
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
    return <DashboardSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-surface-base flex justify-center items-center pt-16">
        <div className="glass-card p-8 rounded-2xl shadow-xl text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-red-400 font-medium mb-4">{error || "User not found"}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:from-violet-500 hover:to-fuchsia-500 transition-all cursor-pointer"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base px-6 md:px-12 pt-24 md:pt-32 pb-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-fuchsia-600/5 blur-[100px] -z-10"></div>

      <div className="max-w-5xl mx-auto space-y-8">

        {/* Profile Card */}
        <ProfileCard user={user} />

        {/* Bidder Details */}
        <BidderDetails notes={notes} />

        {/* Music Notes Section */}
        <div>
          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <CompositionCard key={note._id} note={note} />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl border-dashed p-12 text-center">
              <svg className="w-12 h-12 text-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              </svg>
              <h3 className="text-xl font-medium text-text-primary mb-2">No notes uploaded yet</h3>
              <p className="text-text-muted">Upload your first music note to see it here.</p>
            </div>
          )}
        </div>

        {/* Sequencer Teaser Section */}
        <div className="glass-card rounded-3xl p-6 md:p-8 text-text-primary relative overflow-hidden shadow-xl mt-4 hover:border-violet-500/30 transition-all duration-300">
          {/* Decorative background glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-wider">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                </svg>
                Studio Workspace
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-text-primary">
                Let's compose something new
              </h3>
              <p className="text-text-muted text-xs md:text-sm leading-relaxed">
                Ready to sketch out a new beat? Launch our interactive step sequencer to test rhythms, adjust speed, and design drums on a dedicated layout.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/compose"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-2xl font-bold text-base transition-all duration-300 shadow-lg shadow-violet-600/25 hover:-translate-y-0.5 cursor-pointer text-center w-full md:w-auto"
              >
                Open Beat Creator
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
