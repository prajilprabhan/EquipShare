import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-850">

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-14">

        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-2 space-y-4">

            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                ⚡
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Equip<span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Share</span>
              </span>
            </Link>

            <p className="max-w-md leading-relaxed text-slate-400 text-sm">
              The institutional lab resource & equipment sharing network. Connecting engineering, science, and computing departments to eliminate idle assets and accelerate campus innovation.
            </p>

            <div className="flex items-center gap-2 text-xs text-purple-300 font-semibold">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              Central Instrumentation & Lab Coordination Network
            </div>

          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Campus Navigation
            </h3>

            <div className="mt-4 flex flex-col gap-2.5 text-sm">

              <Link
                to="/"
                className="text-slate-400 transition hover:text-purple-400"
              >
                Home & Overview
              </Link>

              <Link
                to="/about"
                className="text-slate-400 transition hover:text-purple-400"
              >
                About Inter-Lab Sharing
              </Link>

              <Link
                to="/equipment"
                className="text-slate-400 transition hover:text-purple-400"
              >
                Equipment Catalog
              </Link>

              <Link
                to="/contact"
                className="text-slate-400 transition hover:text-purple-400"
              >
                Department Lab Inquiries
              </Link>

              <Link
                to="/login"
                className="text-slate-400 transition hover:text-purple-400"
              >
                Institutional Portal Login
              </Link>

            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Lab Facilities Office
            </h3>

            <div className="mt-4 space-y-2.5 text-sm text-slate-400">

              <p className="flex items-center gap-2">
                <span>📧</span> labs@institution.edu
              </p>

              <p className="flex items-center gap-2">
                <span>📞</span> +91 (0484) 257-8900
              </p>

              <p className="flex items-center gap-2">
                <span>🏛️</span> Central Instrumentation Wing, Main Campus
              </p>

            </div>
          </div>

        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-900 bg-slate-950/80">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-slate-500 md:flex-row">

          <p>
            © 2026 EquipShare Institutional Campus Network. All rights reserved.
          </p>

          <p className="text-slate-400 font-medium">
            Academic Research • Inter-Departmental Access • Gemini AI-Powered
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;