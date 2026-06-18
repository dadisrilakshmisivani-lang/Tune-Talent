import { useNavigate } from "react-router-dom";
import Sequencer from "../components/Sequencer";

function Compose() {
  const navigate = useNavigate();

  const handleStartCollab = () => {
    const randomRoomId = Math.random().toString(36).substring(2, 8);
    navigate(`/collab/${randomRoomId}`);
  };

  return (
    <div className="min-h-screen bg-surface-base font-sans text-text-primary pt-24 pb-12 px-4 md:px-8 pt-24 md:pt-32 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-violet-500/5 blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-fuchsia-500/5 blur-[150px]"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header & Back Button */}
        <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>

            <button
              onClick={handleStartCollab}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white transition-all duration-200 cursor-pointer text-sm font-semibold shadow-lg shadow-violet-500/15"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              Start Collab Jam
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-ping"></span>
            Virtual Studio Mode
          </div>
        </div>

        {/* Sequencer Component */}
        <Sequencer />
      </div>
    </div>
  );
}

export default Compose;
