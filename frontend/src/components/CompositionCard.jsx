function CompositionCard({ note }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{note.title}</h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
          {note.genre}
        </span>
      </div>
      <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-grow">
        {note.description || "No description provided."}
      </p>
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 mt-auto">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold text-slate-700">
            Base Rate: ₹{note.rate}
          </span>
          <span className="text-yellow-500 font-medium">
            ⭐ {note.ratings && note.ratings.length > 0 
              ? (note.ratings.reduce((acc, curr) => acc + curr.value, 0) / note.ratings.length).toFixed(1) 
              : "0"}/5
          </span>
        </div>
        <audio 
          controls 
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
          src={note.fileurl} 
          className="w-full h-10 outline-none rounded-lg"
        >
          Your browser does not support the audio element.
        </audio>

        {/* Received Bids */}
        <div className="mt-2 border-t border-slate-100 pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bids Received ({note.bids ? note.bids.length : 0})
            </span>
            {note.biddingClosed && (
              <span className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                Closed
              </span>
            )}
          </div>
          {note.bids && note.bids.length > 0 ? (
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {note.bids.map((bid, i) => (
                <div key={i} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="font-medium text-slate-700">@{bid.user?.username || "anonymous"}</span>
                  <span className="font-bold text-green-600">₹{bid.amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">No bids placed yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompositionCard;
