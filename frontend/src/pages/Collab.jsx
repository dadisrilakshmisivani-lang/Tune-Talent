import { useParams, useNavigate } from "react-router-dom";
import Sequencer from "../components/Sequencer";

function Collab() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pt-28 pb-12 px-4 md:px-8 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-green-200/10 blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-200/10 blur-[150px]"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition duration-200 cursor-pointer text-sm font-semibold shadow-sm"
          >
            <span>←</span> Back
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-600 text-xs font-bold uppercase tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
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
