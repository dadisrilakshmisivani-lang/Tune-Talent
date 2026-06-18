import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900/10 backdrop-blur-2xl text-black shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center gap-1 text-2xl font-bold bg-clip-text text-transparent bg-black"
            >
              <img src={logo} height="35" width="35" alt="TuneTalent logo" />
              <span >TuneTalent</span>
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link 
              to="/" 
              onClick={() => window.scrollTo(0, 0)}
              className="hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <a href="/#about" className="hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              About Us
            </a>
            <Link to="/hire" className="hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Hire
            </Link>
            <Link to="/explore" className="hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Explore
            </Link>
            <Link to="/compose" className="hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Studio
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-blue-200 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-200 hover:bg-blue-300 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
