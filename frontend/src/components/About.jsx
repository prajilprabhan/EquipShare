function About() {
  return (
    <div className="min-h-screen bg-slate-50">

      <section className="bg-slate-900 px-6 py-20 text-center text-white">
        <h1 className="text-4xl font-bold md:text-5xl">
          About EquipShare
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
          Making equipment sharing easier, more accessible,
          and more organized.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">

        <div className="rounded-2xl bg-white p-8 shadow-md md:p-12">

          <h2 className="text-3xl font-bold text-slate-900">
            What is EquipShare?
          </h2>

          <p className="mt-5 leading-8 text-slate-600">
            EquipShare is an equipment-sharing platform designed to
            connect equipment owners with people who need access to
            equipment. Instead of purchasing expensive equipment
            for occasional use, users can discover available
            equipment through the platform.
          </p>

          <p className="mt-5 leading-8 text-slate-600">
            Sellers can list their equipment, provide information
            about availability, and manage their listings. Users
            can explore equipment and find resources that match
            their requirements.
          </p>

        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-3">

          <div className="rounded-xl bg-white p-7 text-center shadow-md">
            <div className="text-4xl">🎯</div>
            <h3 className="mt-4 text-xl font-semibold">
              Our Goal
            </h3>
            <p className="mt-3 text-slate-600">
              Make equipment access simple and convenient.
            </p>
          </div>

          <div className="rounded-xl bg-white p-7 text-center shadow-md">
            <div className="text-4xl">🌐</div>
            <h3 className="mt-4 text-xl font-semibold">
              Our Platform
            </h3>
            <p className="mt-3 text-slate-600">
              Connect equipment owners and users in one place.
            </p>
          </div>

          <div className="rounded-xl bg-white p-7 text-center shadow-md">
            <div className="text-4xl">🔒</div>
            <h3 className="mt-4 text-xl font-semibold">
              Our Focus
            </h3>
            <p className="mt-3 text-slate-600">
              Provide secure and organized equipment sharing.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}

export default About;