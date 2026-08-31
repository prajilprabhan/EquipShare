import { useState } from "react";
import { API_BASE_URL } from "../config";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "general",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit message. Please try again.");
      }

      setSuccess(data.message || "Thank you! Your inquiry has been sent to the lab coordination committee.");
      setFormData({
        name: "",
        email: "",
        department: "general",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 px-6 py-20 text-center text-white border-b border-purple-900/40">
        <div className="mx-auto max-w-4xl">
          <span className="inline-block rounded-full bg-purple-500/20 border border-purple-400/30 px-4 py-1 text-xs font-bold text-purple-300 uppercase tracking-widest mb-4">
            Campus Lab Support & Inquiries
          </span>
          <h1 className="text-4xl font-extrabold sm:text-5xl text-white">
            Contact Lab Coordination
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-purple-200">
            Have questions regarding cross-departmental equipment sharing, apparatus maintenance, or new laboratory onboarding? Reach out to our campus team.
          </p>
        </div>
      </section>

      {/* Form & Info Section */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2">

        {/* Institutional Contact Information */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-950">
              Department Facilities Office
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              The EquipShare coordination desk facilitates inter-departmental tool transfers, safety compliance, and laboratory resource optimization across all university departments.
            </p>
          </div>

          <div className="space-y-6">

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-bold shrink-0">
                🏛️
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Central Instrumentation Facility</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Main Academic Block, 3rd Floor, Engineering Complex
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hours: Mon – Fri (9:00 AM – 5:00 PM)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold shrink-0">
                📧
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Institutional Email Desks</h3>
                <p className="text-xs text-slate-600 mt-1 font-mono">
                  General: labs@institution.edu
                </p>
                <p className="text-xs text-slate-600 font-mono">
                  Coordination: support@equipshare.edu
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold shrink-0">
                📞
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Campus Intercom & Helpline</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Helpline: +91 (0484) 257-8900
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Intercom Ext: 4402 / 4403 (Lab Tech Desk)
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Connected Contact Form */}
        <div className="rounded-2xl bg-white p-8 shadow-md border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Send an Institutional Message</h3>
          <p className="text-xs text-slate-500 mb-6">
            Messages are directly logged in the central lab coordination system.
          </p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-xs font-semibold text-red-600 border border-red-200 animate-fadeIn">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-xs font-semibold text-green-700 border border-green-200 animate-fadeIn">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Prof. John Doe / Student Name"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  College Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@institution.edu"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                >
                  <option value="general">Central Coordination</option>
                  <option value="computer_science">Computer Science & Eng</option>
                  <option value="electronics">Electronics & Comm</option>
                  <option value="mechanical">Mechanical Engineering</option>
                  <option value="civil">Civil Engineering</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Inquiring about Oscilloscope availability for capstone project"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Message / Inquiry Details *
              </label>
              <textarea
                rows="4"
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Please describe your apparatus requirements, research project details, or lab inquiries..."
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 py-3 text-sm font-bold text-white shadow-md hover:from-purple-800 hover:to-indigo-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting Inquiry...
                </>
              ) : (
                "📤 Submit Inquiry to Lab Committee"
              )}
            </button>

          </form>

        </div>

      </section>

    </div>
  );
}

export default Contact;