import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function MyBookings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    fetchBookings(token);
  }, [navigate]);

  const fetchBookings = async (token) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/user/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      setError("Failed to fetch your bookings. Please try again.");
    } finally {
      setLoading(false);
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
      fetchBookings(token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

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

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      b.equipment?.name?.toLowerCase().includes(term) ||
      b.equipment?.category?.toLowerCase().includes(term) ||
      b.equipment?.location?.toLowerCase().includes(term) ||
      b.purpose?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const approvedCount = bookings.filter((b) => b.status === "approved" || b.status === "borrowed").length;
  const returnedCount = bookings.filter((b) => b.status === "returned").length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-950 p-6 text-white shadow-lg md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-300 font-medium uppercase tracking-wider text-xs mb-1">
              <Link to="/user/dashboard" className="hover:underline">Dashboard</Link>
              <span>/</span>
              <span>My Bookings</span>
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">My Equipment Bookings</h1>
            <p className="mt-1 text-sm text-purple-200">
              Track status, approval logs, and pickup locations for all your requested laboratory tools.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/user/dashboard"
              className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold text-white transition flex items-center gap-2 shadow-sm"
            >
              <span>←</span> Return to Dashboard
            </Link>
            <Link
              to="/equipment"
              className="rounded-xl bg-purple-500 hover:bg-purple-600 px-4 py-2.5 text-xs font-bold text-white transition flex items-center gap-2 shadow-md"
            >
              <span>🔬</span> Explore Catalog
            </Link>
          </div>
        </div>

        {/* Status Counters */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-2xl font-bold text-yellow-600 mt-1">{pendingCount}</h3>
            </div>
            <span className="text-2xl p-3 bg-yellow-50 rounded-xl">⏳</span>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active / Approved</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{approvedCount}</h3>
            </div>
            <span className="text-2xl p-3 bg-green-50 rounded-xl">✅</span>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed / Returned</p>
              <h3 className="text-2xl font-bold text-purple-600 mt-1">{returnedCount}</h3>
            </div>
            <span className="text-2xl p-3 bg-purple-50 rounded-xl">📦</span>
          </div>
        </div>

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

        {/* Filter and Search Bar */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["all", "pending", "approved", "borrowed", "returned", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  filterStatus === st
                    ? "bg-purple-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {st === "all" ? "All Bookings" : st}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by equipment, location, purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
            <p className="text-sm font-semibold text-slate-600 mt-2">Loading your bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-slate-100">
            <span className="text-4xl block mb-2">📋</span>
            <h3 className="text-lg font-bold text-slate-900">No Bookings Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery || filterStatus !== "all"
                ? "No booking records match your filter criteria."
                : "You haven't requested any laboratory equipment yet. Visit the equipment catalog to borrow tools for your lab work."}
            </p>
            <Link
              to="/user/dashboard"
              className="mt-4 inline-block rounded-xl bg-purple-700 px-5 py-2 text-xs font-bold text-white hover:bg-purple-800 transition shadow-sm"
            >
              Browse Equipment on Dashboard →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBookings.map((booking) => {
              const equip = booking.equipment;
              const deptBadge = getDeptBadge(equip?.department);
              return (
                <div
                  key={booking._id}
                  className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    {/* Header: Dept badge & status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${deptBadge.bg}`}>
                        {deptBadge.label}
                      </span>
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

                    {/* Equipment Name */}
                    <h3 className="text-base font-bold text-slate-950">{equip?.name || "Equipment deleted"}</h3>
                    <p className="text-xs text-slate-500 mb-3">{equip?.category || "General Tool"}</p>

                    {/* Metadata Box */}
                    <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
                      <p className="flex items-center gap-1">
                        <span>📍</span>
                        <span>Pickup Location: <strong className="text-slate-900">{equip?.location || "Department Central Lab"}</strong></span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span>📦</span>
                        <span>Quantity Borrowed: <strong className="text-slate-900">{booking.quantity} unit(s)</strong></span>
                      </p>
                      <p className="flex items-center gap-1">
                        <span>📅</span>
                        <span>
                          Period: <strong>{new Date(booking.startDate).toLocaleDateString()}</strong> - <strong>{new Date(booking.endDate).toLocaleDateString()}</strong>
                        </span>
                      </p>
                      {(equip?.modelNumber || equip?.serialNumber) && (
                        <p className="text-[10px] text-slate-400 font-mono pt-0.5">
                          {equip?.modelNumber && `Model: ${equip.modelNumber}`} {equip?.serialNumber && `| SN: ${equip.serialNumber}`}
                        </p>
                      )}
                    </div>

                    {/* Purpose */}
                    {booking.purpose && (
                      <div className="mt-3 text-xs text-slate-600 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100/50">
                        <p className="font-semibold text-purple-900 text-[11px] mb-0.5">Stated Purpose:</p>
                        <p className="italic">"{booking.purpose}"</p>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {booking.rejectionReason && (
                      <div className="mt-2 text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-100">
                        <p className="font-bold text-[11px]">Rejection Reason:</p>
                        <p>{booking.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Requested on {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                    {booking.status === "pending" && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 transition"
                      >
                        ✕ Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
