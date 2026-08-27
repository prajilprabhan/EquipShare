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
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link to="/" className="text-2xl font-bold">
          Equip<span className="text-blue-400">Share</span>
        </Link>

        <div className="flex items-center gap-8 text-sm md:text-base">
          <Link
            to="/"
            className="transition hover:text-blue-400 font-medium"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="transition hover:text-blue-400 font-medium"
          >
            About
          </Link>

          {token && user ? (
            <>
              <Link
                to={dashboardPath}
                className="transition hover:text-blue-400 font-medium text-purple-300"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600/80 px-4 py-2 font-medium transition hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium transition hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;