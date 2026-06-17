import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch User Profile
        const profileRes = await fetch("http://localhost:3000/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const profileData = await profileRes.json();
        
        if (!profileRes.ok || !profileData.user) {
          throw new Error(profileData.message || "Failed to fetch profile");
        }
        setUser(profileData.user);

        // Fetch User's Music Notes
        const notesRes = await fetch("http://localhost:3000/music/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const notesData = await notesRes.json();
        if (notesRes.ok && notesData.notes) {
          setNotes(notesData.notes);
        }
        
      } catch (err) {
        console.error(err);
        if (err.message === "Invalid or Expired Token" || err.message === "No Token Provided") {
          localStorage.removeItem("token");
          localStorage.removeItem("auth_token");
          navigate("/login");
        } else {
          setError(err.message || "Error loading dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="text-xl font-semibold text-slate-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="bg-white p-8 rounded-2xl shadow border border-red-100 text-center">
          <p className="text-red-500 font-medium">{error || "User not found"}</p>
          <button 
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold overflow-hidden shadow-inner shrink-0">
            {user.profileimage ? (
              <img src={user.profileimage} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-bold text-slate-800">{user.username}</h1>
            <p className="text-slate-500">{user.email}</p>
            {user.phone && <p className="text-slate-500 text-sm">📞 {user.phone}</p>}
            <p className="text-slate-700 max-w-xl mt-4">
              {user.bio || "No bio added yet. Update your profile to add some details about your musical journey."}
            </p>
          </div>
        </div>

        {/* Music Notes Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <span className="mr-2">🎵</span> Your Compositions
          </h2>
          
          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <div key={note._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col">
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
                        Start Bid: ₹{note.rate}
                      </span>
                      <span className="text-yellow-500 font-medium">
                        ⭐ {note.ratings && note.ratings.length > 0 
                          ? (note.ratings.reduce((acc, curr) => acc + curr.value, 0) / note.ratings.length).toFixed(1) 
                          : "0"}/5
                      </span>
                    </div>
                    <audio 
                      controls 
                      src={note.fileurl} 
                      className="w-full h-10 outline-none"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <div className="text-4xl mb-4">🎼</div>
              <h3 className="text-xl font-medium text-slate-700 mb-2">No notes uploaded yet</h3>
              <p className="text-slate-500">Upload your first music note to see it here.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
