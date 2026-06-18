import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:3000/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok && data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [token]);

  const handleStartCollab = () => {
    const randomRoomId = Math.random().toString(36).substring(2, 8);
    navigate(`/collab/${randomRoomId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden flex flex-col justify-center items-center text-center px-4 min-h-[80vh]">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl"></div>
          <div className="absolute top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
        </div>

        <div className="max-w-4xl space-y-8 z-10">
          <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 tracking-tight drop-shadow-sm">
            Welcome to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-red-500 font-extrabold">
              TuneTalent
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium">
            The ultimate platform for musicians to share their notes, get rated, and discover new talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-lg transition-transform transform hover:scale-105 shadow-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-lg transition-transform transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-full font-semibold text-lg transition-transform transform hover:scale-105 shadow-sm"
                >
                  Login to Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sequencer Teaser Section */}
      <div className="w-full bg-slate-50 py-16 px-4 border-t border-slate-100">
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
          {/* Decorative background glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                Virtual Synth Machine
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-cyan-100">
                Let's compose something new
              </h2>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                Step into our interactive virtual studio. Program custom 16-step patterns using real-time synthesizers, adjust beats-per-minute, and create fresh rhythm sketches instantly. You can even jam with friends in real-time!
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col gap-3">
              <Link
                to="/compose"
                className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition duration-200 shadow-lg shadow-indigo-600/35 hover:-translate-y-0.5 transform cursor-pointer text-center w-full md:w-auto"
              >
                Solo Session →
              </Link>
              <button
                onClick={handleStartCollab}
                className="inline-block px-8 py-4 bg-transparent border border-indigo-500 text-indigo-300 hover:bg-indigo-900/50 rounded-2xl font-bold text-lg transition duration-200 hover:-translate-y-0.5 transform cursor-pointer text-center w-full md:w-auto"
              >
                Start Collab Jam 👥
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="w-full bg-white py-16 px-4 border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold text-slate-800">About Us</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            TuneTalent is a community-driven platform designed to bridge the gap between talented musicians and those looking to discover fresh, unique compositions. Whether you're a composer wanting to showcase your work, or a producer looking to hire the best talent, we provide the tools to upload, rate, bid on, and explore high-quality music notes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="text-3xl mb-4">🎸</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Showcase</h3>
              <p className="text-slate-600">Upload your compositions and get them heard by the community.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="text-3xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Rate & Review</h3>
              <p className="text-slate-600">Receive constructive feedback and ratings on your work.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hire</h3>
              <p className="text-slate-600">Discover and hire top-rated musicians for your next big project.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;