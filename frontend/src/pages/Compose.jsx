import { useNavigate } from "react-router-dom";
import Sequencer from "../components/Sequencer";

function Compose() {
  const navigate = useNavigate();

  const handleStartCollab = () => {
    const randomRoomId = Math.random().toString(36).substring(2, 8);
    navigate(`/collab/${randomRoomId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pt-28 pb-12 px-4 md:px-8 relative overflow-hidden">
      {/* Visual background gradient accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-200/10 blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-indigo-200/10 blur-[150px]"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header & Back Button */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition duration-200 cursor-pointer text-sm font-semibold shadow-sm"
            >
              <span>←</span> Back
            </button>

            <button
              onClick={handleStartCollab}
              className="px-4 py-2 rounded-2xl bg-black hover:bg-indigo-700 text-white transition duration-200 cursor-pointer text-sm font-semibold shadow-sm flex items-center gap-2"
            >
              Start Collab Jam
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold uppercase tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
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
