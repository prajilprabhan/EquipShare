import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-black text-white">

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-2">

            <Link to="/" className="text-2xl font-bold">
              Equip<span className="text-purple-500">Share</span>
            </Link>

            <p className="mt-4 max-w-md leading-7 text-gray-400">
              A simple platform that connects people who need
              equipment with those who have equipment to share.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Quick Links
            </h3>

            <div className="mt-4 flex flex-col gap-3">

              <Link
                to="/"
                className="text-gray-400 transition hover:text-purple-400"
              >
                Home
              </Link>

              <Link
                to="/about"
                className="text-gray-400 transition hover:text-purple-400"
              >
                About
              </Link>

              <Link
                to="/contact"
                className="text-gray-400 transition hover:text-purple-400"
              >
                Contact
              </Link>

            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Contact
            </h3>

            <div className="mt-4 space-y-3 text-gray-400">

              <p>
                support@equipshare.com
              </p>

              <p>
                +91 98765 43210
              </p>

              <p>
                Kerala, India
              </p>

            </div>
          </div>

        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-sm text-gray-500 md:flex-row">

          <p>
            © 2026 EquipShare. All rights reserved.
          </p>

          <p>
            Share • Connect • Equip
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;