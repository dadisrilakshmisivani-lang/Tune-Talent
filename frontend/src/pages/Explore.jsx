import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow relative">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-bold text-slate-800 line-clamp-1">{note.title}</h3>
          <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">
            {note.genre}
          </span>
        </div>
        
        <p className="text-xs text-slate-400 mb-4 font-medium">
          by @{note.user?.username || "anonymous"}
        </p>

        <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
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

        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Highest Bid</p>
            <p className="text-lg font-extrabold text-green-600">₹{currentHighestBid}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Rating</p>
            <p className="text-lg font-extrabold text-yellow-500">⭐ {avgRating}/5</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-500">Bidding Window</span>
            {note.biddingClosed ? (
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                Closed (1 Day Expired)
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">
                Active
              </span>
            )}
          </div>

          {isAuthenticated ? (
            isOwner ? (
              <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg text-center font-semibold border border-blue-100">
                👤 This is your own composition
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Rate this Composition:</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => onRate(note._id, star)}
                        className="text-lg hover:scale-125 transition-transform text-slate-300 hover:text-yellow-400 focus:text-yellow-500"
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {!note.biddingClosed && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Place a Bid (₹):</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={bidAmount || ""}
                        onChange={(e) => onBidAmountChange(note._id, e.target.value)}
                        placeholder={`Min: ₹${currentHighestBid + 1}`}
                        className="flex-grow p-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => onPlaceBid(note._id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors"
                      >
                        Bid
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg text-center font-semibold border border-amber-100">
              🔒 Please <Link to="/login" className="underline hover:text-amber-950">login</Link> to rate or place a bid.
            </div>
          )}

          {feedback && (
            <p
              className={`text-xs text-center font-medium mt-2 ${
                feedback.type === "success" ? "text-green-600" : "text-red-500"
              }`}
            >
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAuthenticated && token) {
          const profileRes = await fetch("http://localhost:3000/profile/me", {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            setCurrentUser(profileData.user);
          }
        }

        const notesRes = await fetch("http://localhost:3000/music/all");
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
      const res = await fetch(`http://localhost:3000/music/${noteId}/rate`, {
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
      const res = await fetch(`http://localhost:3000/music/${noteId}/bid`, {
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
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="text-xl font-semibold text-slate-600 animate-pulse">Loading compositions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-2xl shadow border border-red-100 text-center text-red-500 font-medium">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Explore Compositions</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover original music notes created by our community. Rate tracks, place bids, and secure exclusive rights.
          </p>
        </div>

        {notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {notes.map((note) => (
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
          <div className="text-center bg-white p-12 rounded-2xl border border-dashed border-slate-300">
            <h3 className="text-xl font-medium text-slate-700 mb-2">No compositions found</h3>
            <p className="text-slate-500">Check back later as creators upload more beats!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Explore;
