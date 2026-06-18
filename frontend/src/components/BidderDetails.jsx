import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function BidderDetails({ notes }) {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedBidder, setSelectedBidder] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Aggregate all bids from the notes
  const allBids = notes.flatMap((note) =>
    (note.bids || []).map((bid) => ({
      ...bid,
      noteTitle: note.title,
      noteId: note._id,
      noteRate: note.rate,
      noteIsClosed: note.biddingClosed,
    }))
  );

  // Filter bids by search term (username or note title)
  const filteredBids = allBids.filter(
    (bid) =>
      (bid.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.noteTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort bids
  const sortedBids = [...filteredBids].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdat || b.date) - new Date(a.createdat || a.date);
    if (sortBy === "oldest") return new Date(a.createdat || a.date) - new Date(b.createdat || b.date);
    if (sortBy === "highest") return b.amount - a.amount;
    if (sortBy === "lowest") return a.amount - b.amount;
    return 0;
  });

  // Statistics
  const totalBidsCount = allBids.length;
  const highestBidValue = allBids.length > 0 ? Math.max(...allBids.map((b) => b.amount)) : 0;
  const activeCompositionsCount = notes.filter((n) => n.isForBidding && (n.bids?.length || 0) > 0).length;

  const handleContactClick = (bidder) => {
    setSelectedBidder(bidder);
    setMessage("");
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSendInquiry = async () => {
    if (!message.trim()) {
      setErrorMsg("Please write a message to send.");
      return;
    }
    setSending(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const response = await fetch(`http://localhost:3000/profile/${selectedBidder._id}/hire`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (response.ok && data.message === "Inquiry sent successfully") {
        setSuccessMsg("Inquiry sent successfully!");
        setMessage("");
        setTimeout(() => { setSelectedBidder(null); setSuccessMsg(""); }, 1800);
      } else {
        setErrorMsg(data.message || "Failed to send inquiry.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred while contacting the bidder.");
    } finally {
      setSending(false);
    }
  };

  if (allBids.length === 0) return null;

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-subtle pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            Bids Received
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Review bidders interested in licensing your compositions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search username or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 bg-surface-elevated border border-border-subtle rounded-xl text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all duration-200"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-surface-elevated border border-border-subtle rounded-xl text-sm text-text-secondary outline-none focus:ring-2 focus:ring-violet-500/40 font-medium cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest</option>
            <option value="lowest">Lowest</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-violet-500/5 border border-violet-500/15 rounded-2xl p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Total Offers</span>
          <span className="text-3xl font-black text-text-primary mt-2 block">{totalBidsCount}</span>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Highest Bid</span>
          <span className="text-3xl font-black text-text-primary mt-2 block">₹{highestBidValue}</span>
        </div>
        <div className="bg-fuchsia-500/5 border border-fuchsia-500/15 rounded-2xl p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-400">Tracks Bid On</span>
          <span className="text-3xl font-black text-text-primary mt-2 block">{activeCompositionsCount} / {notes.length}</span>
        </div>
      </div>

      {/* Bid cards */}
      <div className="space-y-6">
        {sortedBids.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedBids.map((bid, index) => (
              <div
                key={bid._id || index}
                className="bg-surface-elevated rounded-2xl border border-border-subtle p-5 flex flex-col hover:border-violet-500/30 transition-all duration-300"
              >
                {/* Top row */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-[2px] shrink-0">
                      <div className="w-full h-full rounded-full bg-surface-elevated flex items-center justify-center text-violet-400 font-bold text-base overflow-hidden">
                        {bid.user?.profileimage ? (
                          <img src={bid.user.profileimage} alt={bid.user.username} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          bid.user?.username?.charAt(0).toUpperCase() || "?"
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary text-sm">@{bid.user?.username || "anonymous"}</h4>
                      <p className="text-xs text-text-muted">
                        {bid.createdat ? new Date(bid.createdat).toLocaleDateString() : "Just now"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-400 block">₹{bid.amount}</span>
                    <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Bid</span>
                  </div>
                </div>

                {/* Composition context */}
                <div className="bg-surface-card rounded-xl border border-border-subtle p-3 mb-4 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block">Composition</span>
                    <span className="font-bold text-text-secondary text-sm line-clamp-1">{bid.noteTitle}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider ${
                    bid.noteIsClosed
                      ? "bg-surface-hover text-text-muted border border-border-subtle"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {bid.noteIsClosed ? "Closed" : "Active"}
                  </span>
                </div>

                {/* Bio */}
                <p className="text-text-muted text-sm italic mb-4 line-clamp-2 flex-grow leading-relaxed bg-surface-card border border-border-subtle rounded-xl p-3">
                  "{bid.user?.bio || "No bio available."}"
                </p>

                {/* Contact info & action */}
                <div className="flex flex-col gap-2 border-t border-border-subtle pt-3 mt-auto">
                  <div className="flex flex-col gap-1 text-xs text-text-muted mb-2">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <a href={`mailto:${bid.user?.email}`} className="hover:text-violet-400 truncate font-medium transition-colors">
                        {bid.user?.email || "No email"}
                      </a>
                    </div>
                    {bid.user?.phone && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <span className="font-medium text-text-secondary">{bid.user.phone}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleContactClick(bid.user)}
                    className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-violet-500/15 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                    Contact / Negotiate
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-surface-elevated rounded-2xl border border-dashed border-border-subtle py-12">
            <svg className="w-8 h-8 text-text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-text-muted text-sm font-medium">No bids match your search.</p>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {selectedBidder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="glass-card rounded-3xl shadow-2xl shadow-violet-500/10 w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-surface-card flex items-center justify-center text-violet-400 text-lg font-bold overflow-hidden">
                      {selectedBidder.profileimage ? (
                        <img src={selectedBidder.profileimage} alt={selectedBidder.username} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        selectedBidder.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">Contact @{selectedBidder.username}</h3>
                    <p className="text-text-muted text-xs">{selectedBidder.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBidder(null)}
                  className="text-text-muted hover:text-text-primary transition-colors p-1.5 hover:bg-white/5 rounded-lg cursor-pointer"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-violet-500/5 border border-violet-500/15 p-4 rounded-xl text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                  <svg className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                  Send a collaboration proposal, licensing offer, or feedback. They'll receive an email with your query and contact info.
                </div>

                <div>
                  <label htmlFor="bidder-message" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Proposal Message
                  </label>
                  <textarea
                    id="bidder-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="I'd love to negotiate licensing rights or collaborate..."
                    rows={4}
                    className="w-full p-3.5 bg-surface-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all duration-200 resize-none text-sm"
                    disabled={sending || !!successMsg}
                    required
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 py-2.5 px-3 rounded-xl">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2.5 px-3 rounded-xl">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {successMsg}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-surface-elevated/50 px-6 md:px-8 py-4 border-t border-border-subtle flex justify-end gap-3">
              <button
                onClick={() => setSelectedBidder(null)}
                disabled={sending}
                className="px-5 py-2.5 rounded-xl border border-border-subtle hover:bg-white/5 font-semibold text-text-secondary transition-all cursor-pointer text-sm"
              >
                Close
              </button>
              <button
                onClick={handleSendInquiry}
                disabled={sending || !!successMsg || !message.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-violet-600/30 disabled:to-fuchsia-600/30 disabled:text-violet-200/50 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/15 cursor-pointer text-sm"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BidderDetails;
