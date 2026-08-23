function Contact() {
  return (
    <div className="min-h-screen bg-slate-50">

      <section className="bg-slate-900 px-6 py-20 text-center text-white">
        <h1 className="text-4xl font-bold md:text-5xl">
          Contact Us
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
          Have a question or need help? Get in touch with the
          EquipShare team.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">

        {/* Contact Information */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Get in Touch
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            If you have questions about equipment sharing,
            account management, or the platform, feel free to
            contact us.
          </p>

          <div className="mt-8 space-y-5">

            <div>
              <h3 className="font-semibold text-slate-900">
                Email
              </h3>
              <p className="text-slate-600">
                support@equipshare.com
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Phone
              </h3>
              <p className="text-slate-600">
                +91 98765 43210
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Location
              </h3>
              <p className="text-slate-600">
                Kerala, India
              </p>
            </div>

          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-2xl bg-white p-8 shadow-md">

          <form className="space-y-5">

            <div>
              <label className="mb-2 block font-medium text-slate-700">
                Name
              </label>

              <input
                type="text"
                placeholder="Enter your name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-slate-700">
                Message
              </label>

              <textarea
                rows="5"
                placeholder="Enter your message"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Send Message
            </button>

          </form>

        </div>

      </section>

    </div>
  );
}

export default Contact;