import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    quantity: 1,
    purpose: "",
    startDate: "",
    endDate: "",
  });
  const [projectDescription, setProjectDescription] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [isQueryingAI, setIsQueryingAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    let parsedUser = null;
    try {
      parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      parsedUser = null;
    }

    if (!parsedUser || parsedUser.role !== "student") {
      navigate("/login");
      return;
    }

    setUser(parsedUser);
    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      setLoading(true);
      // Fetch Equipments
      const equipRes = await fetch(`${API_BASE_URL}/api/user/equipments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const equipData = await equipRes.json();
      if (equipData.success) {
        setEquipments(equipData.equipments);
      }

      // Fetch Bookings
      const bookingRes = await fetch(`${API_BASE_URL}/api/user/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookingData = await bookingRes.json();
      if (bookingData.success) {
        setBookings(bookingData.bookings);
      }
    } catch (err) {
      setError("Failed to fetch dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedEquip) {
      setError("Please select equipment to book.");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          equipmentId: selectedEquip._id,
          quantity: bookingForm.quantity,
          purpose: bookingForm.purpose,
          startDate: bookingForm.startDate,
          endDate: bookingForm.endDate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to book equipment.");
      }

      setSuccess("Booking request submitted successfully! Pending approval.");
      setBookingForm({ quantity: 1, purpose: "", startDate: "", endDate: "" });
      setSelectedEquip(null);
      
      // Refresh bookings
      fetchDashboardData(token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const handleQueryAI = async (e) => {
    e.preventDefault();
    if (!projectDescription.trim()) {
      setError("Please describe your project first.");
      return;
    }
    setError("");
    setSuccess("");
    setAiRecommendation("");
    setIsQueryingAI(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/recommend-equipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectDescription }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to query AI recommendations.");
      }

      setAiRecommendation(data.recommendation);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsQueryingAI(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel booking request.");
      }

      setSuccess("Booking request cancelled successfully.");
      
      // Refresh bookings
      fetchDashboardData(token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  if (loading && equipments.length === 0 && bookings.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        <p className="text-lg font-semibold text-slate-700">Loading student dashboard...</p>
      </div>
    );
  }

  const getDeptBadge = (dept) => {
    switch (dept) {
      case "computer_science":
        return { label: "💻 Computer Science", bg: "bg-purple-100 text-purple-800 border-purple-200" };
      case "electronics":
        return { label: "⚡ Electronics & Comm", bg: "bg-blue-100 text-blue-800 border-blue-200" };
      case "mechanical":
        return { label: "⚙️ Mechanical Eng", bg: "bg-amber-100 text-amber-800 border-amber-200" };
      case "civil":
        return { label: "🏗️ Civil Engineering", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      default:
        return { label: `🔬 ${dept ? dept.replace("_", " ").toUpperCase() : "GENERAL LAB"}`, bg: "bg-slate-100 text-slate-800 border-slate-200" };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* User Greeting header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-950 p-6 text-white shadow-lg md:p-8">
          <p className="text-purple-300 font-medium uppercase tracking-wider text-sm">Student Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">Hello, {user?.name}!</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-purple-200">
            <span><strong>Department:</strong> {user?.department.replace("_", " ").toUpperCase()}</span>
            <span>•</span>
            <span><strong>Semester:</strong> {user?.semester}</span>
            <span>•</span>
            <span><strong>ID:</strong> {user?.studentId}</span>
          </div>
        </div>

        {user?.verificationStatus === "pending" && (
          <div className="mb-6 rounded-xl bg-amber-50 p-4 border border-amber-200 text-amber-900 flex items-center gap-3 animate-fadeIn">
            <span className="text-2xl shrink-0">⏳</span>
            <div>
              <p className="font-bold text-sm">Account Verification Pending</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your student registration is awaiting approval from your Head of Department (HOD). You can explore the equipment catalog and use the AI Advisor below. Equipment borrowing requests will be enabled once your HOD approves your account.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-600 border border-green-200">
            {success}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {/* Main left content: AI Matcher & Catalog (Span 2) */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Advisor Panel */}
            <div className="rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 p-6 text-white shadow-lg border border-purple-900/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">✨</span>
                <h2 className="text-xl font-bold text-white">AI Equipment Matcher</h2>
              </div>
              <p className="text-xs text-purple-200 mb-4">
                Describe your project or what you want to measure, and our AI will recommend the exact tools from the catalog below!
              </p>
              
              <form onSubmit={handleQueryAI} className="space-y-4">
                <div>
                  <textarea
                    rows="2"
                    placeholder="e.g., I want to measure the electrical output of a solar panel and plot the current vs voltage curves..."
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full rounded-lg border border-purple-800 bg-purple-950/40 px-3 py-2 text-sm text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <button
                    type="submit"
                    disabled={isQueryingAI}
                    className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-5 py-2 font-bold text-white text-xs shadow-md transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {isQueryingAI ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing...
                      </>
                    ) : (
                      "✨ Ask AI Advisor"
                    )}
                  </button>
                  {aiRecommendation && (
                    <button
                      type="button"
                      onClick={() => {
                        setAiRecommendation("");
                        setProjectDescription("");
                      }}
                      className="text-purple-300 hover:text-white transition text-xs font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>

              {aiRecommendation && (
                <div className="mt-5 rounded-xl bg-purple-950/60 p-4 border border-purple-800/50 space-y-4 animate-fadeIn">
                  <div className="text-xs text-purple-100 leading-relaxed whitespace-pre-line">
                    {aiRecommendation}
                  </div>

                  {/* Clickable selectors based on recommendation */}
                  {(() => {
                    const matches = equipments.filter((e) =>
                      aiRecommendation.toLowerCase().includes(e.name.toLowerCase())
                    );
                    if (matches.length > 0) {
                      return (
                        <div className="border-t border-purple-800/40 pt-3">
                          <p className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider mb-2">
                            Quick Select Matches found in catalog:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {matches.map((match) => (
                              <button
                                key={match._id}
                                onClick={() => {
                                  setSelectedEquip(match);
                                  window.scrollTo({ top: 120, behavior: 'smooth' });
                                }}
                                className="rounded-lg bg-purple-500/20 hover:bg-purple-500/45 border border-purple-400/30 px-3 py-1.5 text-xs font-semibold text-purple-100 transition flex items-center gap-1.5"
                              >
                                🎯 Select {match.name}
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

            {/* Equipment Grid */}
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Available Department Equipment</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Click any equipment card below to fill out the booking form on the right</p>
                </div>
                <Link
                  to="/equipment"
                  className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition flex items-center gap-1"
                >
                  <span>🔬</span> Open Full Catalog & Filters →
                </Link>
              </div>
              {equipments.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">No equipment available for sharing right now.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {equipments.map((equip) => {
                    const isAvailable = equip.status === "available" && equip.availableQuantity > 0;
                    const deptInfo = getDeptBadge(equip.department);
                    const isSelected = selectedEquip?._id === equip._id;
                    return (
                      <div 
                        key={equip._id} 
                        className={`cursor-pointer rounded-xl p-5 border transition-all flex flex-col justify-between ${
                          !isAvailable
                            ? "bg-slate-50/50 border-slate-200 opacity-60 hover:border-slate-200 cursor-not-allowed"
                            : isSelected
                            ? "border-purple-600 bg-purple-50/40 shadow-md ring-2 ring-purple-500/50" 
                            : "border-slate-200 hover:border-purple-300 hover:shadow-sm"
                        }`}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedEquip(equip);
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                          }
                        }}
                      >
                        <div>
                          {/* Department and Category badges */}
                          <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${deptInfo.bg}`}>
                              {deptInfo.label}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {equip.category}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-bold text-slate-900 text-base leading-snug">{equip.name}</h3>

                          {/* Status and Stock Pill */}
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                              equip.status === "maintenance"
                                ? "bg-yellow-100 text-yellow-800"
                                : equip.status === "unavailable" || equip.availableQuantity === 0
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}>
                              {equip.status === "maintenance"
                                ? "Maintenance"
                                : equip.availableQuantity === 0
                                ? "Out of Stock"
                                : "Available"}
                            </span>
                            <span className="text-xs font-semibold text-slate-600">
                              Stock: <strong>{equip.availableQuantity} / {equip.totalQuantity}</strong>
                            </span>
                          </div>

                          {/* Location & Model/Serial Details */}
                          <div className="mt-3 text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <p className="flex items-center gap-1 text-slate-700">
                              <span>📍</span>
                              <span>Location: <strong className="text-slate-900">{equip.location || "Department Main Lab"}</strong></span>
                            </p>
                            {(equip.modelNumber || equip.serialNumber) && (
                              <p className="text-[10px] text-slate-500 font-mono">
                                {equip.modelNumber && `Model: ${equip.modelNumber}`}
                                {equip.serialNumber && ` | SN: ${equip.serialNumber}`}
                              </p>
                            )}
                            {equip.addedBy?.name && (
                              <p className="text-[10px] text-purple-700 font-medium">
                                👤 Lab In-Charge: {equip.addedBy.name}
                              </p>
                            )}
                          </div>

                          {/* Description */}
                          <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed" title={equip.description}>
                            {equip.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                          <span className="text-slate-400 text-[11px]">
                            {equip.status === "available" && equip.availableQuantity > 0 ? "Ready for Request" : "Currently Locked"}
                          </span>
                          {isAvailable ? (
                            <span className={`font-bold transition ${isSelected ? "text-purple-700" : "text-purple-600 hover:text-purple-800"}`}>
                              {isSelected ? "✓ Active in Booking Form" : "Select to Request →"}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">Request Locked</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right column: Quick Booking Guide & My Bookings navigation */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            {/* Quick Booking Guide Card */}
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="text-xl">🚀</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">How to Borrow Tools</h3>
                  <p className="text-[11px] text-slate-500">Fast 3-step institutional equipment checkout</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex gap-3 items-start">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">1</span>
                  <p><strong className="text-slate-900">Select an apparatus</strong> from the catalog or AI recommendations on the left.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">2</span>
                  <p><strong className="text-slate-900">Fill the pop-up request form</strong> specifying your quantity, dates, and purpose.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">3</span>
                  <p><strong className="text-slate-900">Pick up from lab location</strong> once approved by your HOD and Lab Assistant.</p>
                </div>
              </div>
            </div>

            {/* My Bookings Dedicated Page Link Card */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950 p-6 text-white shadow-md border border-purple-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>📋</span> My Bookings
                  </h3>
                  <p className="text-xs text-purple-200 mt-0.5">Track your requests & borrowed tools</p>
                </div>
                <span className="rounded-full bg-purple-500/30 border border-purple-400/30 px-3 py-1 text-xs font-bold text-purple-200">
                  {bookings.length} Total
                </span>
              </div>

              <div className="space-y-2 text-xs text-purple-100 bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="flex justify-between">
                  <span>⏳ Pending Review:</span>
                  <strong className="text-yellow-400">{bookings.filter(b => b.status === "pending").length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>✅ Active / Approved:</span>
                  <strong className="text-green-400">{bookings.filter(b => b.status === "approved" || b.status === "borrowed").length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>📦 Completed / Returned:</span>
                  <strong className="text-purple-300">{bookings.filter(b => b.status === "returned").length}</strong>
                </div>
              </div>

              <Link
                to="/user/bookings"
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 px-4 text-center transition block shadow-md"
              >
                Open Full My Bookings Page →
              </Link>
            </div>
          </div>
        </div>

        {/* Pop-up Modal Dialog for Requesting Equipment */}
        {selectedEquip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-scaleUp my-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>📝</span> Request Equipment Booking
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Submit request for departmental approval and pickup</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEquip(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition text-sm font-bold"
                  title="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Selected Equipment Specifications Highlight */}
              <div className="mb-4 rounded-xl bg-purple-50 p-4 border border-purple-100 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getDeptBadge(selectedEquip.department).bg}`}>
                    {getDeptBadge(selectedEquip.department).label}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-purple-100">
                    {selectedEquip.category}
                  </span>
                </div>
                <h3 className="font-bold text-purple-950 text-base">{selectedEquip.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedEquip.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-2 border-t border-purple-200/50">
                  <p>📍 Location: <strong>{selectedEquip.location || "Department Main Lab"}</strong></p>
                  <p>📦 Stock: <strong className="text-green-700">{selectedEquip.availableQuantity} of {selectedEquip.totalQuantity} available</strong></p>
                  {(selectedEquip.modelNumber || selectedEquip.serialNumber) && (
                    <p className="col-span-2 text-[10px] text-slate-500 font-mono">
                      {selectedEquip.modelNumber && `Model: ${selectedEquip.modelNumber}`} {selectedEquip.serialNumber && `| SN: ${selectedEquip.serialNumber}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Request Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity to Borrow (Max: {selectedEquip.availableQuantity})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedEquip.availableQuantity}
                    value={bookingForm.quantity}
                    onChange={(e) => setBookingForm({ ...bookingForm, quantity: e.target.value })}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={bookingForm.startDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, startDate: e.target.value })}
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-950 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={bookingForm.endDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, endDate: e.target.value })}
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-950 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purpose / Experiment Details
                  </label>
                  <textarea
                    rows="3"
                    placeholder="e.g., Final year capstone project testing, embedded IoT sensor calibration, VLSI lab assignment..."
                    value={bookingForm.purpose}
                    onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-950 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedEquip(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 px-6 py-2 text-xs font-bold text-white shadow-md transition"
                  >
                    Submit Booking Request →
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
