import { useParams, useNavigate } from "react-router-dom";
import Sequencer from "../components/Sequencer";

function Collab() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-base font-sans text-text-primary pt-24 pb-12 px-4 md:px-8 pt-24 md:pt-32 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-violet-500/5 blur-[150px]"></div>
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

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            Collaborative Session
          </div>
        </div>

        {/* Collab Sequencer */}
        <Sequencer roomId={roomId} />
      </div>
    </div>
  );
}

export default Collab;
