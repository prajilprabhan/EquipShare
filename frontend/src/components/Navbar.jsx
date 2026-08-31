import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  let dashboardPath = "/";
  if (user) {
    if (user.role === "student") dashboardPath = "/user/dashboard";
    else if (user.role === "admin") dashboardPath = "/admin/dashboard";
    else if (user.role === "hod") dashboardPath = "/hod/dashboard";
    else if (user.role === "labasist") dashboardPath = "/labasist/dashboard";
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-slate-950 text-white shadow-xl border-b border-slate-850/60 sticky top-0 z-40 backdrop-blur-md bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Equip<span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Share</span>
            </span>
            <span className="hidden sm:block text-xxs uppercase tracking-widest text-slate-400 font-semibold -mt-1">
              Campus Lab Network
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6 text-sm md:text-base">
          <Link
            to="/"
            className="transition hover:text-purple-400 font-medium text-slate-200"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="transition hover:text-purple-400 font-medium text-slate-200"
          >
            About
          </Link>

          <Link
            to="/equipment"
            className="transition hover:text-purple-400 font-medium text-slate-200 flex items-center gap-1"
          >
            <span>🔬</span> Equipment
          </Link>

          <Link
            to="/contact"
            className="transition hover:text-purple-400 font-medium text-slate-200"
          >
            Contact
          </Link>

          {token && user ? (
            <div className="flex items-center gap-3">
              <Link
                to={dashboardPath}
                className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-purple-700 hover:to-indigo-700 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-red-500/40 bg-red-950/40 text-red-300 px-3.5 py-1.5 text-xs font-semibold hover:bg-red-900/60 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg border border-slate-700 px-4 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md hover:from-purple-700 hover:to-indigo-700 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;