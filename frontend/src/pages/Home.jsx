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
    <div className="min-h-screen bg-surface-base font-sans">
      {/* Hero Section */}
      <div className="relative sm:pt-32 sm:pb-32 overflow-hidden flex flex-col justify-center items-center text-center px-4 min-h-[85vh]">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px] animate-pulse-glow"></div>
          <div className="absolute top-60 -left-40 w-[400px] h-[400px] rounded-full bg-fuchsia-600/10 blur-[120px] animate-pulse-glow" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 right-20 w-[300px] h-[300px] rounded-full bg-cyan-500/8 blur-[100px] animate-pulse-glow" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Floating Music Notes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={`note-${i}`}
              className="absolute text-violet-800/80 dark:text-violet-300/70 drop-shadow-md"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `-10%`,
                animation: `float-up ${4 + Math.random() * 6}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                fontSize: `${20 + Math.random() * 40}px`,
              }}
            >
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          ))}
        </div>

        {/* Bottom Waveform Visualizer */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1.5 opacity-40 dark:opacity-30 h-32 pb-6 z-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`wave-${i}`}
              className="w-1.5 md:w-2 bg-gradient-to-t from-violet-500 to-cyan-500 rounded-full"
              style={{
                height: `${16 + Math.sin(i * 0.5) * 40 + Math.random() * 24}px`,
                animation: `waveform ${1 + Math.random() * 1.5}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.05}s`,
                transformOrigin: 'bottom',
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl z-10">

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-text-primary tracking-tight animate-fade-in" style={{animationDelay: '0.1s'}}>
            Welcome to <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
              TuneTalent
            </span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
            The ultimate platform for musicians to share their compositions, get rated, and discover new talent.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 cursor-pointer"
              >
                Go to Dashboard
                <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 cursor-pointer"
                >
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-surface-elevated hover:bg-surface-hover text-text-primary border border-border-subtle rounded-2xl font-bold text-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-sm"
                >
                  Login to Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sequencer Teaser Section */}
      <div className="w-full py-16 px-4 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 md:p-12 text-text-primary relative overflow-hidden shadow-2xl shadow-violet-500/5 animate-slide-up">
          {/* Decorative background glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-wider">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                Virtual Synth Machine
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary">
                Let's compose something new
              </h2>
              <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                Step into our interactive virtual studio. Program custom 16-step patterns using real-time synthesizers, adjust beats-per-minute, and create fresh rhythm sketches instantly. You can even jam with friends in real-time!
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col gap-3">
              <Link
                to="/compose"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg shadow-violet-600/30 hover:-translate-y-0.5 cursor-pointer text-center"
              >
                Solo Session
                <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button
                onClick={handleStartCollab}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface-elevated border border-border-subtle text-text-primary hover:bg-surface-hover hover:border-violet-500/50 rounded-2xl font-bold text-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-center shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                Start Collab Jam
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="w-full py-20 px-4 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
              About Us
            </span>
            <h2 className="text-4xl font-bold text-text-primary">Why TuneTalent?</h2>
          </div>
          <p className="text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto">
            TuneTalent is a community-driven platform designed to bridge the gap between talented musicians and those looking to discover fresh, unique compositions. Whether you're a composer wanting to showcase your work, or a producer looking to hire the best talent, we provide the tools to upload, rate, bid on, and explore high-quality music notes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="glass-card p-8 rounded-2xl hover:border-violet-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Showcase</h3>
              <p className="text-text-secondary text-sm leading-relaxed">Upload your compositions and get them heard by the community.</p>
            </div>
            <div className="glass-card p-8 rounded-2xl hover:border-amber-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Rate & Review</h3>
              <p className="text-text-secondary text-sm leading-relaxed">Receive constructive feedback and ratings on your work.</p>
            </div>
            <div className="glass-card p-8 rounded-2xl hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Hire</h3>
              <p className="text-text-secondary text-sm leading-relaxed">Discover and hire top-rated musicians for your next big project.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;