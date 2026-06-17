import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden flex flex-col justify-center items-center text-center px-4 min-h-[80vh]">

        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl"></div>
          <div className="absolute top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
        </div>

        <div className="max-w-4xl space-y-8 z-10">
          <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 tracking-tight drop-shadow-sm">
            Welcome to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
              TuneTalent
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium">
            The ultimate platform for musicians to share their notes, get rated, and discover new talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            {localStorage.getItem("token") || localStorage.getItem("auth_token") ? (
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-lg transition-transform transform hover:scale-105 shadow-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-lg transition-transform transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-full font-semibold text-lg transition-transform transform hover:scale-105 shadow-sm"
                >
                  Login to Account
                </Link>
              </>
            )}
          </div>
        </div>

        <div id="about" className="w-full bg-white mt-24 py-16 px-4 border-t border-slate-100">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold text-slate-800">About Us</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              TuneTalent is a community-driven platform designed to bridge the gap between talented musicians and those looking to discover fresh, unique compositions. Whether you're a composer wanting to showcase your work, or a producer looking to hire the best talent, we provide the tools to upload, rate, bid on, and explore high-quality music notes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              <div className="p-6 bg-slate-50 rounded-xl">
                <div className="text-3xl mb-4">🎸</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Showcase</h3>
                <p className="text-slate-600">Upload your compositions and get them heard by the community.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl">
                <div className="text-3xl mb-4">⭐</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Rate & Review</h3>
                <p className="text-slate-600">Receive constructive feedback and ratings on your work.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl">
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Hire</h3>
                <p className="text-slate-600">Discover and hire top-rated musicians for your next big project.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
