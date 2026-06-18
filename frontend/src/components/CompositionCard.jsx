function CompositionCard({ note }) {
  return (
    <div className="glass-card rounded-2xl p-6 hover:border-violet-500/30 transition-all duration-300 flex flex-col group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-text-primary line-clamp-1 group-hover:text-violet-300 transition-colors">{note.title}</h3>
        <span className="bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0 ml-2">
          {note.genre}
        </span>
      </div>
      <p className="text-text-secondary text-sm mb-4 line-clamp-3 flex-grow leading-relaxed">
        {note.description || "No description provided."}
      </p>
      <div className="flex flex-col gap-3 border-t border-border-subtle pt-4 mt-auto">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold text-text-secondary">
            {note.isForBidding ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-emerald-400">Base: ₹{note.rate}</span>
              </span>
            ) : (
              <span className="text-text-muted">Listening Only</span>
            )}
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            {note.ratings && note.ratings.length > 0
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

        {/* Received Bids (Only if isForBidding is true) */}
        {note.isForBidding !== false && (
          <div className="mt-2 border-t border-border-subtle pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
                Bids ({note.bids ? note.bids.length : 0})
              </span>
              {note.biddingClosed && (
                <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-lg font-semibold">
                  Closed
                </span>
              )}
            </div>
            {note.bids && note.bids.length > 0 ? (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {note.bids.map((bid, i) => (
                  <div key={i} className="flex justify-between items-center text-xs bg-surface-elevated p-2.5 rounded-lg border border-border-subtle">
                    <span className="font-medium text-text-secondary">@{bid.user?.username || "anonymous"}</span>
                    <span className="font-bold text-emerald-400">₹{bid.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-text-muted italic">No bids placed yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompositionCard;
