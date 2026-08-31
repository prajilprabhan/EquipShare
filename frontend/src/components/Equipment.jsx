import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Equipment() {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // AI Matcher States
  const [showAiAdvisor, setShowAiAdvisor] = useState(false);
  const [projectDescription, setProjectDescription] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [isQueryingAI, setIsQueryingAI] = useState(false);

  // Booking Modal State (for logged-in students)
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    quantity: 1,
    startDate: "",
    endDate: "",
    purpose: "",
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const user = userStr ? JSON.parse(userStr) : null;
  const isStudent = user && user.role === "student";

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/equipments`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load equipment catalog.");
      }
      setEquipments(data.equipments || []);
    } catch (err) {
      setError(err.message || "Failed to load equipment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  const handleQueryAI = async (e) => {
    e.preventDefault();
    if (!projectDescription.trim()) {
      setError("Please describe your project first.");
      return;
    }
    setError("");
    setAiRecommendation("");
    setIsQueryingAI(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/equipments/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectDescription }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to query AI recommendations.");
      }

      setAiRecommendation(data.recommendation);
    } catch (err) {
      setError(err.message || "Failed to get AI recommendation.");
    } finally {
      setIsQueryingAI(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isStudent || !token) {
      navigate("/login");
      return;
    }

    setSubmittingBooking(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipmentId: selectedEquip._id,
          quantity: Number(bookingForm.quantity),
          startDate: bookingForm.startDate,
          endDate: bookingForm.endDate,
          purpose: bookingForm.purpose,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit booking request.");
      }

      setSuccess(`Booking request for "${selectedEquip.name}" submitted successfully! You can track approval in your Student Dashboard.`);
      setSelectedEquip(null);
      setBookingForm({ quantity: 1, startDate: "", endDate: "", purpose: "" });
      fetchEquipments(); // refresh quantities
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Filtered Equipment List
  const filteredEquipments = equipments.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.modelNumber && item.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDept === "all" || item.department === selectedDept;
    const matchesCategory = selectedCategory === "all" || item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesDept && matchesCategory;
  });

  // Extract unique categories for filter
  const uniqueCategories = Array.from(new Set(equipments.map((e) => e.category).filter(Boolean)));

  const getDeptIcon = (dept) => {
    switch (dept) {
      case "computer_science":
        return "💻 CS";
      case "electronics":
        return "⚡ ECE";
      case "mechanical":
        return "⚙️ MECH";
      case "civil":
        return "🏗️ CIVIL";
      default:
        return "🔬 LAB";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">

      {/* Hero Header */}
      <section className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 px-6 py-16 text-center text-white border-b border-purple-900/40">
        <div className="mx-auto max-w-4xl">
          <span className="inline-block rounded-full bg-purple-500/20 border border-purple-400/30 px-4 py-1 text-xs font-bold text-purple-300 uppercase tracking-widest mb-3">
            Campus Laboratory Inventory
          </span>
          <h1 className="text-3xl font-extrabold sm:text-5xl text-white">
            Institutional Equipment Catalog
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-purple-200">
            Browse and discover laboratory instruments, computing kits, and precision apparatus available across all university academic departments.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowAiAdvisor(!showAiAdvisor)}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-xs md:text-sm font-bold text-white shadow-lg hover:from-purple-600 hover:to-indigo-600 transition flex items-center gap-2"
            >
              <span>✨</span>
              {showAiAdvisor ? "Hide AI Project Matcher" : "Ask AI Equipment Matcher"}
            </button>
            {isStudent && (
              <Link
                to="/user/dashboard"
                className="rounded-xl border border-purple-400/30 bg-purple-900/40 px-5 py-2.5 text-xs md:text-sm font-semibold text-purple-200 hover:bg-purple-800/60 transition"
              >
                Go to My Dashboard & Bookings →
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">

        {/* Global Feedback Banners */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200 animate-fadeIn">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl bg-green-50 p-4 text-sm text-green-700 border border-green-200 animate-fadeIn">
            ✅ {success}
          </div>
        )}

        {/* Expandable AI Matcher Panel */}
        {showAiAdvisor && (
          <div className="mb-10 rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl border border-purple-800/50 animate-slideDown">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✨</span>
              <h2 className="text-xl font-bold text-white">Gemini AI Project Advisor</h2>
            </div>
            <p className="text-xs text-purple-200 mb-4 max-w-2xl">
              Describe your project goals or the signal/parameters you need to test. Gemini will analyze the entire university catalog and recommend the exact tools.
            </p>

            <form onSubmit={handleQueryAI} className="space-y-4">
              <textarea
                rows="2"
                placeholder="e.g. I am testing a wireless sensor node and need to measure microamp current draw and verify RF transmission packet logs..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full rounded-lg border border-purple-800 bg-purple-950/50 px-3.5 py-2.5 text-sm text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isQueryingAI}
                  className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:from-purple-600 hover:to-indigo-600 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isQueryingAI ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing Catalog...
                    </>
                  ) : (
                    "✨ Get Recommendations"
                  )}
                </button>

                {aiRecommendation && (
                  <button
                    type="button"
                    onClick={() => {
                      setAiRecommendation("");
                      setProjectDescription("");
                    }}
                    className="text-purple-300 hover:text-white text-xs font-semibold"
                  >
                    Clear AI Response
                  </button>
                )}
              </div>
            </form>

            {aiRecommendation && (
              <div className="mt-5 rounded-xl bg-purple-950/60 p-4 border border-purple-800/40 space-y-3 animate-fadeIn">
                <div className="text-xs text-purple-100 leading-relaxed whitespace-pre-line">
                  {aiRecommendation}
                </div>

                {/* Direct quick matches */}
                {(() => {
                  const matches = equipments.filter((e) =>
                    aiRecommendation.toLowerCase().includes(e.name.toLowerCase())
                  );
                  if (matches.length > 0) {
                    return (
                      <div className="border-t border-purple-800/40 pt-3">
                        <p className="text-xxs font-bold text-purple-300 uppercase tracking-wider mb-2">
                          Matches Found in Available Inventory:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {matches.map((match) => (
                            <button
                              key={match._id}
                              onClick={() => {
                                setSearchQuery(match.name);
                              }}
                              className="rounded-lg bg-purple-500/25 hover:bg-purple-500/50 border border-purple-400/40 px-3 py-1 text-xs font-semibold text-purple-100 transition flex items-center gap-1.5"
                            >
                              🔍 View {match.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm border border-slate-200 grid gap-4 md:grid-cols-3 items-center">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by equipment name, specs, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 pl-9 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              <option value="computer_science">Computer Science & Eng</option>
              <option value="electronics">Electronics & Communication</option>
              <option value="mechanical">Mechanical Engineering</option>
              <option value="civil">Civil Engineering</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent capitalize"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Equipment Results Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
            <p className="text-base font-semibold text-slate-600">Loading equipment catalog...</p>
          </div>
        ) : filteredEquipments.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-200">
            <span className="text-4xl">🔍</span>
            <h3 className="text-lg font-bold text-slate-900 mt-3">No matching equipment found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try adjusting your search query, clearing your department filter, or asking the Gemini AI Advisor.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDept("all");
                setSelectedCategory("all");
              }}
              className="mt-4 rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEquipments.map((item) => {
              const isAvailable = item.status === "available" && item.availableQuantity > 0;
              return (
                <div
                  key={item._id}
                  className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md hover:border-purple-300 transition group"
                >
                  <div>
                    {/* Header: Dept Badge & Category */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="rounded-md bg-purple-50 text-purple-700 font-bold text-xxs px-2.5 py-1 uppercase tracking-wider">
                        {getDeptIcon(item.department)}
                      </span>
                      <span className="text-xxs font-semibold uppercase tracking-wider text-slate-500">
                        {item.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition">
                      {item.name}
                    </h3>

                    {/* Stock Status Pill */}
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                          isAvailable
                            ? "bg-green-100 text-green-800"
                            : item.status === "maintenance"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {isAvailable ? "Available" : item.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        Stock: {item.availableQuantity} / {item.totalQuantity}
                      </span>
                    </div>

                    {/* Location & Model */}
                    <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                      <p className="flex items-center gap-1.5">
                        <span>📍</span>
                        <span>Location: <strong>{item.location || "Department Main Lab"}</strong></span>
                      </p>
                      {(item.modelNumber || item.serialNumber) && (
                        <p className="text-xxs text-slate-400 font-mono">
                          {item.modelNumber && `Model: ${item.modelNumber}`}
                          {item.serialNumber && ` | SN: ${item.serialNumber}`}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed" title={item.description}>
                      {item.description || "High-precision laboratory apparatus for institutional academic research."}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    {isStudent ? (
                      <button
                        onClick={() => setSelectedEquip(item)}
                        disabled={!isAvailable}
                        className="w-full rounded-xl bg-purple-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        {isAvailable ? "🎯 Request to Borrow" : "Currently Unavailable"}
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/login")}
                        className="w-full rounded-xl border border-purple-200 bg-purple-50/50 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition flex items-center justify-center gap-1.5"
                      >
                        🔐 Sign in as Student to Borrow
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Booking Modal */}
      {selectedEquip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-150 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Borrow Request</h3>
                <p className="text-xs text-purple-700 font-semibold">{selectedEquip.name}</p>
              </div>
              <button
                onClick={() => setSelectedEquip(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-150 space-y-1">
                <p>Department: <strong className="capitalize">{selectedEquip.department.replace("_", " ")}</strong></p>
                <p>Available in Lab: <strong>{selectedEquip.availableQuantity} units</strong></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Quantity Required *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedEquip.availableQuantity}
                  required
                  value={bookingForm.quantity}
                  onChange={(e) => setBookingForm({ ...bookingForm, quantity: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingForm.startDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingForm.endDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Purpose of Borrowing *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Specify your academic project, course name, or research hypothesis..."
                  value={bookingForm.purpose}
                  onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedEquip(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="rounded-lg bg-purple-700 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-800 transition disabled:opacity-50"
                >
                  {submittingBooking ? "Submitting..." : "Submit Borrow Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Equipment;
