import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Hire() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/profile/all");
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch users");
        }

        let allUsers = data.users || [];
        
        const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
        if (token) {
          const profileRes = await fetch("http://localhost:3000/profile/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.user) {
              allUsers = allUsers.filter(u => u.username !== profileData.user.username);
            }
          }
        }

        setUsers(allUsers);
      } catch (err) {
        console.error(err);
        setError("Error loading talent profiles.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="text-xl font-semibold text-slate-600 animate-pulse">Loading talent...</div>
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

  const handleContactClick = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Hire Top Talent</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Browse through our community of talented musicians and composers. 
            Find the perfect match for your next musical project.
          </p>
        </div>

        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {users.map((user) => (
              <div key={user._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden shadow-inner mb-4">
                  {user.profileimage ? (
                    <img src={user.profileimage} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-1">{user.username}</h3>
                <p className="text-sm text-slate-500 mb-4">{user.email}</p>
                <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow">
                  {user.bio || "This talented musician hasn't added a bio yet."}
                </p>
                <button 
                  onClick={() => handleContactClick(user)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors mt-auto"
                >
                  Contact for Hire
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-2xl border border-dashed border-slate-300">
            <h3 className="text-xl font-medium text-slate-700 mb-2">No musicians found</h3>
            <p className="text-slate-500">Check back later as our community grows!</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold overflow-hidden shadow-inner">
                    {selectedUser.profileimage ? (
                      <img src={selectedUser.profileimage} alt={selectedUser.username} className="w-full h-full object-cover" />
                    ) : (
                      selectedUser.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedUser.username}</h2>
                    <p className="text-slate-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Contact Info</h4>
                  <p className="text-slate-800">
                    <span className="font-medium mr-2">Email:</span>
                    <a href={`mailto:${selectedUser.email}`} className="text-blue-600 hover:underline">{selectedUser.email}</a>
                  </p>
                  {selectedUser.phone && (
                    <p className="text-slate-800 mt-1">
                      <span className="font-medium mr-2">Phone:</span>
                      {selectedUser.phone}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Biography</h4>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm leading-relaxed">
                    {selectedUser.bio || "This talented musician hasn't added a bio yet."}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <a 
                href={`mailto:${selectedUser.email}`}
                className="ml-3 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Hire;
