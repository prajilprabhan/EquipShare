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

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main left content: Browse and book */}
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
                                  window.scrollTo({ top: 400, behavior: 'smooth' });
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
                  <p className="text-xs text-slate-500 mt-0.5">Click on any equipment card to request borrowing</p>
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
                    return (
                      <div 
                        key={equip._id} 
                        className={`cursor-pointer rounded-xl p-5 border transition-all flex flex-col justify-between ${
                          !isAvailable
                            ? "bg-slate-50/50 border-slate-200 opacity-60 hover:border-slate-200 cursor-not-allowed"
                            : selectedEquip?._id === equip._id 
                            ? "border-purple-600 bg-purple-50/40 shadow-md ring-2 ring-purple-400/40" 
                            : "border-slate-200 hover:border-purple-300 hover:shadow-sm"
                        }`}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedEquip(equip);
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
                            {equip.status === "available" && equip.availableQuantity > 0 ? "Ready for Checkout" : "Currently Unavailable"}
                          </span>
                          {isAvailable ? (
                            <span className={`font-bold transition ${selectedEquip?._id === equip._id ? "text-purple-700" : "text-purple-600 hover:text-purple-800"}`}>
                              {selectedEquip?._id === equip._id ? "✓ Selected for Request" : "Select to Request →"}
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

            {/* Booking Form (Visible when equipment selected) */}
            {selectedEquip && (
              <div className="rounded-2xl bg-white p-6 shadow-md border border-purple-200 animate-fadeIn">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Request Equipment Booking</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Submit request to your department HOD and Lab Assistant</p>
                  </div>
                  <button 
                    onClick={() => setSelectedEquip(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                  >
                    ✕ Close Request
                  </button>
                </div>

                {/* Selected Item Full Specs Box */}
                <div className="mb-6 rounded-xl bg-purple-50 p-4 border border-purple-100">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getDeptBadge(selectedEquip.department).bg}`}>
                        {getDeptBadge(selectedEquip.department).label}
                      </span>
                      <h3 className="text-lg font-bold text-purple-950 mt-1">{selectedEquip.name}</h3>
                      <p className="text-xs text-slate-600 mt-1">{selectedEquip.description}</p>
                    </div>
                    <div className="text-right text-xs text-slate-700 space-y-0.5 shrink-0">
                      <p>📍 Location: <strong>{selectedEquip.location || "Department Main Lab"}</strong></p>
                      <p>🏷️ Category: <strong>{selectedEquip.category}</strong></p>
                      <p>📦 Available: <strong className="text-green-700">{selectedEquip.availableQuantity} of {selectedEquip.totalQuantity}</strong></p>
                      {(selectedEquip.modelNumber || selectedEquip.serialNumber) && (
                        <p className="text-[10px] text-slate-500 font-mono">
                          {selectedEquip.modelNumber && `Mod: ${selectedEquip.modelNumber}`} {selectedEquip.serialNumber && `| SN: ${selectedEquip.serialNumber}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Quantity (Max: {selectedEquip.availableQuantity})</label>
                      <input 
                        type="number" 
                        min="1" 
                        max={selectedEquip.availableQuantity}
                        value={bookingForm.quantity}
                        onChange={(e) => setBookingForm({...bookingForm, quantity: e.target.value})}
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                      <input 
                        type="date" 
                        value={bookingForm.startDate}
                        onChange={(e) => setBookingForm({...bookingForm, startDate: e.target.value})}
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                      <input 
                        type="date" 
                        value={bookingForm.endDate}
                        onChange={(e) => setBookingForm({...bookingForm, endDate: e.target.value})}
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Purpose / Project Title</label>
                    <textarea 
                      rows="2"
                      placeholder="Please specify why you need this equipment (e.g. Capstone project, embedded IoT experiment, VLSI lab assignment)..."
                      value={bookingForm.purpose}
                      onChange={(e) => setBookingForm({...bookingForm, purpose: e.target.value})}
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setSelectedEquip(null)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 px-6 py-2 text-sm font-bold text-white shadow-md transition"
                    >
                      Submit Request to Lab
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right column: Bookings list */}
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 self-start">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">My Bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-slate-500 text-sm">You haven't requested any bookings yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking._id} className="rounded-xl border border-slate-100 p-4 shadow-sm bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{booking.equipment?.name || "Equipment deleted"}</h4>
                        {booking.equipment?.department && (
                          <span className="text-[10px] font-semibold text-purple-700 uppercase">
                            {booking.equipment.department.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                        booking.status === "approved" || booking.status === "returned"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-100">
                      <p>📍 Location: <strong>{booking.equipment?.location || "Main Department Lab"}</strong></p>
                      <p>📦 Quantity: <strong>{booking.quantity} unit(s)</strong></p>
                      <p>📅 Dates: <strong>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</strong></p>
                      {booking.purpose && (
                        <p className="text-slate-500 italic">"{booking.purpose}"</p>
                      )}
                      {booking.rejectionReason && (
                        <p className="text-red-600 mt-2 bg-red-50 p-2 rounded">Reason: {booking.rejectionReason}</p>
                      )}
                    </div>

                    {booking.status === "pending" && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 transition pt-1"
                      >
                        ✕ Cancel Request
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
