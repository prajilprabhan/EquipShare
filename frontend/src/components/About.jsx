import { Link } from "react-router-dom";

function About() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 px-6 py-20 text-center text-white border-b border-purple-900/40">
        <div className="mx-auto max-w-4xl">
          <span className="inline-block rounded-full bg-purple-500/20 border border-purple-400/30 px-4 py-1 text-xs font-bold text-purple-300 uppercase tracking-widest mb-4">
            Department-Wise Equipment Sharing Network
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            About EquipShare
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-purple-200 leading-relaxed font-normal">
            A centralized digital ecosystem designed for academic institutions to manage, discover, and share laboratory equipment across all engineering and science departments.
          </p>
        </div>
      </section>

      {/* Institutional Mission & Context */}
      <section className="mx-auto max-w-5xl px-6 py-16">

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 md:p-12">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-700 block mb-2">
            Institutional Inter-Lab Sharing
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-950">
            Why Department-Wise Equipment Sharing Matters
          </h2>

          <div className="mt-6 space-y-4 text-sm md:text-base leading-relaxed text-slate-600">
            <p>
              In colleges and universities, technical laboratories often operate in complete isolation. While a <strong>Computer Science</strong> student building an IoT hardware prototype urgently needs an oscilloscope or a signal generator, that exact equipment may sit idle in the <strong>Electronics & Communication (ECE)</strong> lab next door.
            </p>
            <p>
              Similarly, <strong>Mechanical Engineering</strong> students working on structural robotics might require precision calibration sensors or 3D prototyping tools located in <strong>Civil</strong> or <strong>Central Instrumentation</strong> facilities.
            </p>
            <p>
              <strong>EquipShare</strong> bridges this departmental gap. It creates an institution-wide catalog where each academic department registers its lab apparatus, and verified students can easily search, discover, and request equipment with formal HOD and Lab Assistant approval.
            </p>
          </div>
        </div>

        {/* 3 Departmental Pillars */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-bold mb-4">
              🏛️
            </div>
            <h3 className="font-bold text-slate-900 text-base">Department Autonomy</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Every department maintains complete ownership of its lab instruments, determining stock levels, maintenance schedules, and student access guidelines.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xl font-bold mb-4">
              🔄
            </div>
            <h3 className="font-bold text-slate-900 text-base">Inter-Lab Sharing</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Students and researchers can borrow precision tools from other departments across the institution without bureaucratic delays or duplicated budget purchases.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold mb-4">
              🛡️
            </div>
            <h3 className="font-bold text-slate-900 text-base">HOD & Staff Custody</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Multi-tiered approvals ensure that student registrations are verified by their respective HODs and physical check-outs/returns are tracked by Lab Assistants.
            </p>
          </div>
        </div>

        {/* 4-Tier Institutional Governance Architecture */}
        <div className="mt-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-950">
              Department Role & Governance Hierarchy
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Structured roles ensuring security, accountability, and academic compliance
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-purple-100 flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl font-bold shrink-0">
                🎓
              </div>
              <div>
                <h3 className="font-bold text-slate-950 text-base">Students & Researchers</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Browse department lab inventories across campus, describe project hypotheses to the Gemini AI Matcher, and submit structured borrowing requests for coursework and capstone projects.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-blue-100 flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-2xl font-bold shrink-0">
                🔬
              </div>
              <div>
                <h3 className="font-bold text-slate-950 text-base">Lab Assistants & Technicians</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Manage their department's physical lab inventory, generate technical spec sheets with Gemini AI keyword assistance, log apparatus check-outs, and record return condition status.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-emerald-100 flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl font-bold shrink-0">
                🏛️
              </div>
              <div>
                <h3 className="font-bold text-slate-950 text-base">Heads of Department (HODs)</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Verify and approve student registrations within their academic department, maintain custody of department assets, and monitor inter-departmental equipment sharing logs.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-amber-100 flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl font-bold shrink-0">
                🛡️
              </div>
              <div>
                <h3 className="font-bold text-slate-950 text-base">Central System Administrators</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Oversee all institutional departments, manage user security, resolve inter-departmental bottlenecks, and maintain campus-wide equipment utilization audit trails.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* AI Innovation */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 text-white shadow-md border border-purple-800/40">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-4xl md:text-5xl">✨</div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Powered by Google Gemini 3.6 Flash
              </h3>
              <p className="mt-2 text-xs md:text-sm text-purple-200 leading-relaxed">
                EquipShare features intelligent cross-departmental AI matching. When students describe their project goals, Gemini analyzes the entire campus catalog to identify the exact instruments needed—regardless of which department lab houses them. Lab Assistants can also auto-generate comprehensive technical spec sheets with a single click.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <Link
            to="/equipment"
            className="inline-block rounded-xl bg-purple-700 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-purple-800 transition"
          >
            Explore Department Equipment Catalog →
          </Link>
        </div>

      </section>

    </div>
  );
}

export default About;