import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StarIcon({ filled, className = "" }) {
  return filled ? (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ) : (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function ExploreCard({
  note,
  currentUser,
  isAuthenticated,
  bidAmount,
  onBidAmountChange,
  onPlaceBid,
  onRate,
  feedback
}) {
  const isOwner = currentUser && note.user && note.user._id === currentUser._id;

  const getHighestBid = () => {
    if (!note.bids || note.bids.length === 0) return note.rate;
    return Math.max(...note.bids.map((b) => b.amount));
  };

  const getAverageRating = () => {
    if (!note.ratings || note.ratings.length === 0) return "0";
    const sum = note.ratings.reduce((acc, r) => acc + r.value, 0);
    return (sum / note.ratings.length).toFixed(1);
  };

  const currentHighestBid = getHighestBid();
  const avgRating = getAverageRating();

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between hover:border-violet-500/30 transition-all duration-300 group">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-text-primary line-clamp-1 group-hover:text-violet-300 transition-colors">{note.title}</h3>
          <span className="bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs px-2.5 py-1 rounded-lg font-semibold shrink-0 ml-2">
            {note.genre}
          </span>
        </div>

        <p className="text-xs text-text-muted mb-4 font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          @{note.user?.username || "anonymous"}
        </p>

        <p className="text-text-secondary text-sm mb-6 line-clamp-3 leading-relaxed">
          {note.description || "No description provided."}
        </p>
      </div>

      <div>
        <div className="mb-4">
          <audio
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            src={note.fileurl}
            className="w-full h-10 outline-none rounded-lg"
          >
            Your browser does not support the audio element.
          </audio>
        </div>

        <div className="flex justify-between items-center bg-surface-elevated p-3.5 rounded-xl mb-4 border border-border-subtle">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
              {note.isForBidding ? "Highest Bid" : "Pricing"}
            </p>
            <p className={`text-lg font-extrabold ${note.isForBidding ? "text-emerald-400" : "text-text-muted"}`}>
              {note.isForBidding ? `₹${currentHighestBid}` : "Listening Only"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Rating</p>
            <p className="text-lg font-extrabold text-amber-400 flex items-center gap-1">
              <StarIcon filled className="w-4 h-4" />
              {avgRating}/5
            </p>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-4 space-y-4">
          {note.isForBidding ? (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-text-muted">Bidding Window</span>
                {note.biddingClosed ? (
                  <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-lg font-bold">
                    Closed
                  </span>
                ) : (
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg font-bold">
                    Active
                  </span>
                )}
              </div>

              {isAuthenticated ? (
                isOwner ? (
                  <div className="bg-violet-500/5 border border-violet-500/15 text-violet-400 text-xs p-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    This is your own composition
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-1.5">Rate this Composition:</label>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => onRate(note._id, star)}
                            className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-amber-400 focus:text-amber-400 transition-all duration-200 cursor-pointer rounded-lg hover:bg-amber-400/10 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          >
                            <StarIcon filled={false} className="w-5 h-5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {!note.biddingClosed && (
                      <div>
                        <label htmlFor={`bid-${note._id}`} className="block text-xs font-semibold text-text-secondary mb-1.5">Place a Bid (₹):</label>
                        <div className="flex gap-2">
                          <input
                            id={`bid-${note._id}`}
                            type="number"
                            value={bidAmount || ""}
                            onChange={(e) => onBidAmountChange(note._id, e.target.value)}
                            placeholder={`Min: ₹${currentHighestBid + 1}`}
                            className="flex-grow p-2.5 bg-surface-elevated border border-border-subtle rounded-xl text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all duration-200"
                          />
                          <button
                            onClick={() => onPlaceBid(note._id)}
                            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/15"
                          >
                            Bid
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="bg-amber-500/5 border border-amber-500/15 text-amber-400 text-xs p-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Please <Link to="/login" className="underline hover:text-amber-300 ml-1">login</Link> to rate or bid.
                </div>
              )}
            </>
          ) : (
            <>
              {isAuthenticated ? (
                isOwner ? (
                  <div className="bg-violet-500/5 border border-violet-500/15 text-violet-400 text-xs p-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    This is your own composition
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">Rate this Composition:</label>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => onRate(note._id, star)}
                          className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-amber-400 focus:text-amber-400 transition-all duration-200 cursor-pointer rounded-lg hover:bg-amber-400/10 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          <StarIcon filled={false} className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-amber-500/5 border border-amber-500/15 text-amber-400 text-xs p-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Please <Link to="/login" className="underline hover:text-amber-300 ml-1">login</Link> to rate.
                </div>
              )}
            </>
          )}

          {feedback && (
            <p className={`text-xs text-center font-medium mt-2 ${
              feedback.type === "success" ? "text-emerald-400" : "text-red-400"
            }`}>
              {feedback.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Explore() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token, isAuthenticated } = useAuth();

  const [currentUser, setCurrentUser] = useState(null);
  const [bidAmounts, setBidAmounts] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAuthenticated && token) {
          const profileRes = await fetch("https://tune-talent.onrender.com/profile/me", {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });
          if (profileRes.status === 429) throw new Error("Too many requests. Please slow down and try again later.");
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setCurrentUser(profileData.user);
          }
        }

        const notesRes = await fetch("https://tune-talent.onrender.com/music/all");
        if (notesRes.status === 429) throw new Error("Too many requests. Please slow down and try again later.");
        
        const notesData = await notesRes.json();

        if (notesRes.ok && notesData.notes) {
          setNotes(notesData.notes);
        } else {
          throw new Error(notesData.message || "Failed to fetch music notes");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading compositions.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token]);

  const handleRate = async (noteId, value) => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`https://tune-talent.onrender.com/music/${noteId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (res.ok && data.note) {
        setFeedbacks({ ...feedbacks, [noteId]: { type: "success", text: "Rating submitted!" } });
        setNotes(notes.map(n => n._id === noteId ? data.note : n));
      } else {
        setFeedbacks({ ...feedbacks, [noteId]: { type: "error", text: data.message } });
      }
    } catch (err) {
      setFeedbacks({ ...feedbacks, [noteId]: { type: "error", text: "Failed to submit rating." } });
    }
  };

  const handleBidAmountChange = (noteId, amount) => {
    setBidAmounts({ ...bidAmounts, [noteId]: amount });
  };

  const handlePlaceBid = async (noteId) => {
    if (!isAuthenticated) return;
    const amount = bidAmounts[noteId];
    if (!amount) {
      setFeedbacks({ ...feedbacks, [noteId]: { type: "error", text: "Enter a valid bid amount." } });
      return;
    }

    try {
      const res = await fetch(`https://tune-talent.onrender.com/music/${noteId}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok && data.note) {
        setFeedbacks({ ...feedbacks, [noteId]: { type: "success", text: "Bid placed successfully!" } });
        setNotes(notes.map(n => n._id === noteId ? data.note : n));
        setBidAmounts({ ...bidAmounts, [noteId]: "" });
      } else {
        setFeedbacks({ ...feedbacks, [noteId]: { type: "error", text: data.message } });
      }
    } catch (err) {
      setFeedbacks({ ...feedbacks, [noteId]: { type: "error", text: "Failed to place bid." } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex justify-center items-center pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="text-text-muted font-medium animate-pulse">Loading compositions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-base flex justify-center items-center pt-16">
        <div className="glass-card p-8 rounded-2xl text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base px-6 md:px-12 pt-24 md:pt-32 pb-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 left-0 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[120px] -z-10"></div>
      <div className="absolute bottom-20 right-0 w-[300px] h-[300px] rounded-full bg-fuchsia-600/5 blur-[100px] -z-10"></div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Discover Music
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">Find Compositions</h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Discover original music notes created by our community. Rate tracks, place bids, and secure exclusive rights.
          </p>

          <div className="mt-8 max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-elevated border border-border-subtle rounded-2xl text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all shadow-sm"
            />
          </div>
        </div>

        {(() => {
          const filteredNotes = notes.filter(note => 
            (note.title && note.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (note.genre && note.genre.toLowerCase().includes(searchTerm.toLowerCase()))
          );

          return filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <ExploreCard
                  key={note._id}
                note={note}
                currentUser={currentUser}
                isAuthenticated={isAuthenticated}
                bidAmount={bidAmounts[note._id] || ""}
                onBidAmountChange={handleBidAmountChange}
                onPlaceBid={handlePlaceBid}
                onRate={handleRate}
                feedback={feedbacks[note._id]}
              />
              ))}
            </div>
          ) : (
            <div className="text-center glass-card p-12 rounded-2xl">
              <svg className="w-12 h-12 text-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              </svg>
              <h3 className="text-xl font-medium text-text-primary mb-2">No compositions found</h3>
              <p className="text-text-muted">
                {searchTerm ? "No results match your search." : "Check back later as creators upload more beats!"}
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default Explore;
