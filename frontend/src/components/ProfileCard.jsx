function ProfileCard({ user }) {
  if (!user) return null;

  return (
    <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
      <div className="relative shrink-0">
        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-[3px]">
          <div className="w-full h-full rounded-full bg-surface-card flex items-center justify-center text-violet-400 text-3xl font-bold overflow-hidden">
            {user.profileimage ? (
              <img src={user.profileimage} alt={user.username} className="w-full h-full object-cover rounded-full" />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-surface-card"></div>
      </div>
      <div className="text-center md:text-left space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{user.username}</h1>
        <p className="text-text-muted text-sm flex items-center justify-center md:justify-start gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          {user.email}
        </p>
        {user.phone && (
          <p className="text-text-muted text-sm flex items-center justify-center md:justify-start gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            {user.phone}
          </p>
        )}
        <p className="text-text-secondary max-w-xl mt-3 leading-relaxed">
          {user.bio || "No bio added yet. Update your profile to add some details about your musical journey."}
        </p>
      </div>
    </div>
  );
}

export default ProfileCard;
