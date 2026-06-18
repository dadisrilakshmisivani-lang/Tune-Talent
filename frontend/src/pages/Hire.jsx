import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Hire() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const { token } = useAuth();

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://tune-talent.onrender.com/profile/all", {
          credentials: "include",
        });
        if (response.status === 429) throw new Error("Too many requests. Please slow down and try again later.");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch users");
        }

        let allUsers = data.users || [];

        if (token) {
          const profileRes = await fetch("https://tune-talent.onrender.com/profile/me", {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          });
          if (profileRes.status === 429) throw new Error("Too many requests. Please slow down and try again later.");
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
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base flex justify-center items-center pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="text-text-muted font-medium animate-pulse">Loading talent...</p>
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

  const handleContactClick = (user) => {
    setSelectedUser(user);
    setMessage("");
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSendHireEmail = async () => {
    if (!message.trim()) {
      setErrorMsg("Please enter a message to convey.");
      return;
    }

    setSending(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(`https://tune-talent.onrender.com/profile/${selectedUser._id}/hire`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();

      if (response.ok && data.message === "Inquiry sent successfully") {
        setSuccessMsg("Your hiring inquiry has been sent successfully!");
        setMessage("");
        setTimeout(() => {
          setSelectedUser(null);
          setSuccessMsg("");
        }, 2000);
      } else {
        setErrorMsg(data.message || "Failed to send hiring inquiry.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred while sending the email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base px-6 md:px-12 pt-24 md:pt-32 pb-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-cyan-600/5 blur-[120px] -z-10"></div>
      <div className="absolute bottom-20 left-0 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[100px] -z-10"></div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Talent Network
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">Hire Top Talent</h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Browse through our community of talented musicians and composers.
            Find the perfect match for your next musical project.
          </p>

          <div className="mt-8 max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by username or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-surface-elevated border border-border-subtle rounded-2xl text-sm text-text-primary placeholder-text-muted outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all shadow-sm"
            />
          </div>
        </div>

        {(() => {
          const filteredUsers = users.filter(user => 
            (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
          );

          return filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div key={user._id} className="glass-card rounded-2xl p-8 flex flex-col items-center text-center hover:border-violet-500/30 transition-all duration-300 group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-500 p-[2px] mb-4 group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full rounded-full bg-surface-card flex items-center justify-center text-violet-400 text-2xl font-bold overflow-hidden">
                    {user.profileimage ? (
                      <img src={user.profileimage} alt={user.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-1">{user.username}</h3>
                <p className="text-sm text-text-muted mb-4 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {user.email}
                </p>
                <p className="text-text-secondary text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                  {user.bio || "This talented musician hasn't added a bio yet."}
                </p>
                <button
                  onClick={() => handleContactClick(user)}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold transition-all duration-300 mt-auto shadow-lg shadow-violet-500/15 cursor-pointer"
                >
                  Contact for Hire
                </button>
              </div>
              ))}
            </div>
          ) : (
            <div className="text-center glass-card p-12 rounded-2xl">
              <svg className="w-12 h-12 text-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <h3 className="text-xl font-medium text-text-primary mb-2">No musicians found</h3>
              <p className="text-text-muted">
                {searchTerm ? "No results match your search." : "Check back later as our community grows!"}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Hire Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="glass-card rounded-3xl shadow-2xl shadow-violet-500/10 w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-surface-card flex items-center justify-center text-violet-400 text-xl font-bold overflow-hidden">
                      {selectedUser.profileimage ? (
                        <img src={selectedUser.profileimage} alt={selectedUser.username} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        selectedUser.username.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">{selectedUser.username}</h2>
                    <p className="text-text-muted text-sm">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-text-muted hover:text-text-primary transition-colors p-1.5 hover:bg-white/5 rounded-lg cursor-pointer"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Contact Info</h4>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <a href={`mailto:${selectedUser.email}`} className="text-violet-400 hover:text-violet-300 transition-colors">{selectedUser.email}</a>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                      <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      {selectedUser.phone}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Biography</h4>
                  <p className="text-text-secondary bg-surface-elevated p-4 rounded-xl border border-border-subtle text-sm leading-relaxed">
                    {selectedUser.bio || "This talented musician hasn't added a bio yet."}
                  </p>
                </div>

                {token ? (
                  <div className="border-t border-border-subtle pt-4">
                    <label htmlFor="hire-message" className="block text-sm font-semibold text-text-secondary mb-2">Message to Convey</label>
                    <textarea
                      id="hire-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Explain details of your project, budget, and timelines..."
                      rows={4}
                      className="w-full p-3 bg-surface-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all duration-200 resize-none text-sm"
                      disabled={sending || !!successMsg}
                      required
                    />
                  </div>
                ) : (
                  <div className="bg-amber-500/5 border border-amber-500/15 text-amber-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Please log in to write a message and contact this musician.
                  </div>
                )}

                {errorMsg && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {successMsg}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-surface-elevated/50 px-8 py-4 border-t border-border-subtle flex justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                disabled={sending}
                className="px-6 py-2.5 border border-border-subtle hover:bg-white/5 text-text-secondary rounded-xl font-medium transition-all cursor-pointer text-sm"
              >
                Close
              </button>
              {token && (
                <button
                  onClick={handleSendHireEmail}
                  disabled={sending || !!successMsg || !message.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-violet-600/30 disabled:to-fuchsia-600/30 disabled:text-violet-200/50 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/15 cursor-pointer text-sm"
                >
                  {sending ? "Sending..." : "Send Email"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hire;
