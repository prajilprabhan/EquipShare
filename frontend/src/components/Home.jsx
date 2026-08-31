import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
        {/* Background glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/60 px-4 py-1.5 text-xs font-semibold text-purple-300 shadow-inner mb-6 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              Department-Wise Equipment Sharing Network
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl text-white">
              Institutional Department-Wise Equipment Sharing.
            </h1>

            <p className="mt-6 max-w-2xl text-base md:text-lg leading-relaxed text-purple-100/90 font-normal">
              Break down laboratory silos across academic departments in your institution. EquipShare connects Computer Science, Electronics, Mechanical, and Civil engineering facilities—enabling students, lab technicians, and faculty to discover, share, and borrow precision instruments through unified department governance.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Link
                to="/signup"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:from-purple-500 hover:to-indigo-500 transition transform hover:-translate-y-0.5"
              >
                🎓 Join Campus Network
              </Link>

              <Link
                to="/about"
                className="rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:border-slate-600"
              >
                Learn Institutional Model
              </Link>

              <Link
                to="/contact"
                className="rounded-xl border border-purple-800/40 bg-purple-950/30 px-6 py-3.5 text-sm font-semibold text-purple-300 transition hover:bg-purple-900/40 hover:text-white"
              >
                Department Inquiries
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-purple-900/40 pt-8">
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-white">5+ Depts</p>
                <p className="text-xs text-purple-300 mt-1">CS, ECE, MECH, CIVIL & Labs</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-purple-300">100%</p>
                <p className="text-xs text-purple-300 mt-1">Inter-Lab Asset Visibility</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-extrabold text-indigo-300">Gemini AI</p>
                <p className="text-xs text-purple-300 mt-1">Smart Project Matching</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Institutional Value Pillars */}
      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="mb-14 text-center max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-2">
            Why Campus Resource Sharing?
          </h2>
          <p className="text-3xl font-bold text-slate-950">
            A smarter, connected laboratory ecosystem for higher education
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-md transition">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl mb-5 font-bold">
              🔬
            </div>
            <h3 className="text-lg font-bold text-slate-950">
              Inter-Departmental Access
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Eliminate budget redundancies. Allow engineering students to borrow precision multimeters, oscilloscopes, IoT boards, and testing rigs from other labs across the institution.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-md transition">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-2xl mb-5 font-bold">
              ✨
            </div>
            <h3 className="text-lg font-bold text-slate-950">
              Gemini AI Equipment Matching
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Students can describe their project requirements in natural language. Gemini AI recommends the exact tools needed and auto-generates technical catalog specs for lab assistants.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 hover:shadow-md transition">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl mb-5 font-bold">
              🏛️
            </div>
            <h3 className="text-lg font-bold text-slate-950">
              Department Governance & HOD Oversight
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Multi-role authorization keeps lab assets safe. HODs verify student registrations, Lab Assistants log apparatus handovers, and Admins monitor campus-wide audit trails.
            </p>
          </div>

        </div>

      </section>

      {/* Departments Grid */}
      <section className="bg-slate-100/70 py-20 border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-950">
              Participating Academic Departments
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Unified inventory sharing across university technical facilities
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              <span className="text-3xl">💻</span>
              <h4 className="mt-3 font-bold text-slate-900">Computer Science</h4>
              <p className="text-xs text-slate-500 mt-1">Raspberry Pi, NVIDIA Jetson, VR Headsets, Logic Analyzers, Prototyping Kits</p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              <span className="text-3xl">⚡</span>
              <h4 className="mt-3 font-bold text-slate-900">Electronics & Comm</h4>
              <p className="text-xs text-slate-500 mt-1">Digital Storage Oscilloscopes, Function Generators, Spectrum Analyzers, Multimeters</p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              <span className="text-3xl">⚙️</span>
              <h4 className="mt-3 font-bold text-slate-900">Mechanical Eng</h4>
              <p className="text-xs text-slate-500 mt-1">Thermal Imaging Cameras, 3D Printers, Vibration Meters, Stroboscopes, Tachometers</p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              <span className="text-3xl">🏗️</span>
              <h4 className="mt-3 font-bold text-slate-900">Civil & Structural</h4>
              <p className="text-xs text-slate-500 mt-1">Total Stations, Laser Rangefinders, Ultrasonic Concrete Testers, Soil Gauges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Workflows */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-slate-950">
            How EquipShare Works on Campus
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            A seamless four-tier workflow built for universities and technical institutions
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="relative rounded-2xl bg-white p-7 shadow-sm border border-slate-200">
            <span className="absolute -top-3 left-6 rounded-full bg-purple-700 px-3 py-0.5 text-xxs font-bold text-white uppercase tracking-wider">
              Step 1: Student Request
            </span>
            <h3 className="mt-3 text-base font-bold text-slate-900">
              1. Discover & Ask AI Advisor
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Students sign up with their College ID. They describe project goals into the AI Matcher, find available tools, and submit borrowing requests with designated start and end dates.
            </p>
          </div>

          <div className="relative rounded-2xl bg-white p-7 shadow-sm border border-slate-200">
            <span className="absolute -top-3 left-6 rounded-full bg-blue-700 px-3 py-0.5 text-xxs font-bold text-white uppercase tracking-wider">
              Step 2: Department Verification
            </span>
            <h3 className="mt-3 text-base font-bold text-slate-900">
              2. Faculty & HOD Review
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Department Heads (HODs) verify student identities and maintain department-level control over who can borrow apparatus, ensuring academic safety and accountability.
            </p>
          </div>

          <div className="relative rounded-2xl bg-white p-7 shadow-sm border border-slate-200">
            <span className="absolute -top-3 left-6 rounded-full bg-emerald-700 px-3 py-0.5 text-xxs font-bold text-white uppercase tracking-wider">
              Step 3: Lab Handover
            </span>
            <h3 className="mt-3 text-base font-bold text-slate-900">
              3. Assistant Check-Out & Return
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Lab Assistants manage the equipment inventory, check out apparatus when students arrive at the lab, track return deadlines, and mark condition status upon return.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-950 via-slate-950 to-indigo-950 px-6 py-16 text-center text-white border-t border-purple-900/40">
        <h2 className="text-3xl font-extrabold sm:text-4xl text-white">
          Ready to Modernize Your Campus Laboratories?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-purple-200">
          Empower your students and faculty with unified inter-departmental equipment sharing. Sign in with your institutional credentials or contact the lab coordination team.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/signup"
            className="rounded-xl bg-white px-7 py-3 text-sm font-bold text-purple-950 shadow-md transition hover:bg-purple-50"
          >
            Register Student / Staff
          </Link>
          <Link
            to="/contact"
            className="rounded-xl border border-purple-400/40 bg-purple-900/40 px-7 py-3 text-sm font-bold text-white transition hover:bg-purple-800/60"
          >
            Contact Lab Coordinator
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Home;