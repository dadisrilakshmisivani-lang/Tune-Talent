function ProfileCard({ user }) {
  if (!user) return null;

  return (
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
  );
}

export default ProfileCard;
