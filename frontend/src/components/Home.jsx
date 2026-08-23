import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24">

          <div className="max-w-3xl">

            <p className="mb-4 font-semibold uppercase tracking-wider text-blue-400">
              Equipment Sharing Platform
            </p>

            <h1 className="text-5xl font-bold leading-tight md:text-6xl">
              Share Equipment.
              <br />
              <span className="text-blue-400">
                Build Opportunities.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              EquipShare connects people who need equipment with those
              who have equipment to share. Find, share, and manage
              equipment easily from one platform.
            </p>

            <div className="mt-8 flex gap-4">

              <Link
                to="/equipment"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-700"
              >
                Explore Equipment
              </Link>

              <Link
                to="/about"
                className="rounded-lg border border-slate-500 px-6 py-3 font-semibold transition hover:bg-white hover:text-slate-900"
              >
                Learn More
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20">

        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">
            Why Choose EquipShare?
          </h2>

          <p className="mt-3 text-slate-600">
            A simple and reliable way to share equipment.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">

          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-4 text-4xl">🔍</div>

            <h3 className="text-xl font-semibold text-slate-900">
              Find Equipment
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              Search and discover equipment available for sharing
              based on your requirements.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-4 text-4xl">🤝</div>

            <h3 className="text-xl font-semibold text-slate-900">
              Share Equipment
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              Sellers can list their equipment and make it available
              to people who need it.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-4 text-4xl">🔐</div>

            <h3 className="text-xl font-semibold text-slate-900">
              Secure Platform
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              User authentication and role-based access help keep
              the platform secure.
            </p>
          </div>

        </div>

      </section>

     {/* CTA */}
<section className="bg-purple-950 px-6 py-16 text-center text-white">

  <h2 className="text-3xl font-bold">
    Ready to share and discover?
  </h2>

  <p className="mx-auto mt-4 max-w-2xl text-purple-100">
    Join EquipShare and make equipment more accessible
    through a simple sharing platform.
  </p>

  <Link
    to="/signup"
    className="mt-8 inline-block rounded-lg bg-white px-7 py-3 font-semibold text-purple-950 transition hover:bg-purple-100"
  >
    Get Started
  </Link>

</section>

    </div>
  );
}

export default Home;