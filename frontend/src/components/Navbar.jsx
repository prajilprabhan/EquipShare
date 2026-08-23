import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link to="/" className="text-2xl font-bold">
          Equip<span className="text-blue-400">Share</span>
        </Link>

        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="transition hover:text-blue-400"
          >
            Home
          </Link>

          <Link
            to="/about"
            className="transition hover:text-blue-400"
          >
            About
          </Link>

          <Link
            to="/contact"
            className="transition hover:text-blue-400"
          >
            Contact
          </Link>

          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium transition hover:bg-blue-700"
          >
            Login
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;