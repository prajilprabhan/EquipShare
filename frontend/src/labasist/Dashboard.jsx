import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LabasistDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [equipmentsList, setEquipmentsList] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEquip, setEditingEquip] = useState(null);
  const [editForm, setEditForm] = useState({
    totalQuantity: 1,
    availableQuantity: 1,
    status: "available",
    location: "",
  });
  const [equipmentForm, setEquipmentForm] = useState({
    name: "",
    description: "",
    category: "",
    modelNumber: "",
    serialNumber: "",
    totalQuantity: 1,
    location: "",
  });
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

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "labasist") {
      navigate("/login");
      return;
    }

    setUser(parsedUser);
    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      setLoading(true);
      // Fetch bookings
      const response = await fetch("http://localhost:5000/api/labasist/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }

      // Fetch equipments
      const equipRes = await fetch("http://localhost:5000/api/labasist/equipments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const equipData = await equipRes.json();
      if (equipData.success) {
        setEquipmentsList(equipData.equipments);
      }

      // Fetch history
      const histRes = await fetch("http://localhost:5000/api/labasist/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const histData = await histRes.json();
      if (histData.success) {
        setHistoryList(histData.bookings);
      }
    } catch (err) {
      setError("Failed to fetch booking requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/labasist/equipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...equipmentForm,
          department: user.department,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to add equipment.");
      }

      setSuccess("Equipment added successfully!");
      setEquipmentForm({
        name: "",
        description: "",
        category: "",
        modelNumber: "",
        serialNumber: "",
        totalQuantity: 1,
        location: "",
      });
      setShowAddForm(false);
      fetchDashboardData(token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/labasist/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update booking status.");
      }

      setSuccess(`Booking status updated to '${status}' successfully.`);
      fetchDashboardData(token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const startEditing = (equip) => {
    setEditingEquip(equip);
    setEditForm({
      totalQuantity: equip.totalQuantity,
      availableQuantity: equip.availableQuantity,
      status: equip.status,
      location: equip.location || "",
    });
  };

  const handleUpdateEquipment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/labasist/equipments/${editingEquip._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update equipment.");
      }

      setSuccess("Equipment details updated successfully.");
      setEditingEquip(null);
      fetchDashboardData(token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const handleDeleteEquipment = async (equipId) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) return;
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/labasist/equipments/${equipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete equipment.");
      }

      setSuccess("Equipment deleted successfully.");
      fetchDashboardData(token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-xl font-semibold text-slate-700">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl animate-fadeIn">
        {/* Greetings header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-950 p-6 text-white shadow-lg md:p-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-purple-300 font-medium uppercase tracking-wider text-sm">Lab Assistant Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">Hello, {user?.name}!</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-purple-200">
              <span><strong>Department:</strong> {user?.department.replace("_", " ").toUpperCase()}</span>
              <span>•</span>
              <span><strong>Role:</strong> Lab Assistant</span>
            </div>
          </div>
          <div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-purple-950 shadow hover:bg-purple-50 transition"
            >
              {showAddForm ? "Cancel Add" : "+ Add Equipment"}
            </button>
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

        {/* Add Equipment Form overlay/drawer */}
        {showAddForm && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-md border border-slate-100 animate-slideDown">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Add Equipment to Catalog</h2>
            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Equipment Name *</label>
                  <input
                    type="text"
                    required
                    value={equipmentForm.name}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electronics, Lab Kits"
                    value={equipmentForm.category}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={equipmentForm.totalQuantity}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, totalQuantity: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Model Number</label>
                  <input
                    type="text"
                    value={equipmentForm.modelNumber}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, modelNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={equipmentForm.serialNumber}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, serialNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location / Cabinet</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 402, shelf B"
                    value={equipmentForm.location}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea
                  rows="2"
                  required
                  value={equipmentForm.description}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-purple-700 px-6 py-2 font-semibold text-white hover:bg-purple-800 transition"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition ${
              activeTab === "pending"
                ? "border-purple-700 text-purple-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Pending Requests ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition ${
              activeTab === "catalog"
                ? "border-purple-700 text-purple-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Equipment Catalog ({equipmentsList.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition ${
              activeTab === "history"
                ? "border-purple-700 text-purple-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Processed Bookings History
          </button>
        </div>

        {/* Tab Contents: Pending Requests */}
        {activeTab === "pending" && (
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Equipment Booking Requests</h2>
            {bookings.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No booking requests found for your department's equipment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-700 text-sm font-semibold">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Equipment Name</th>
                      <th className="py-3 px-4">Qty</th>
                      <th className="py-3 px-4">Dates</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-4 font-semibold text-slate-950">
                          {booking.user?.name}
                          <span className="block text-xs font-normal text-slate-500">ID: {booking.user?.studentId}</span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-purple-900">{booking.equipment?.name}</td>
                        <td className="py-4 px-4">{booking.quantity}</td>
                        <td className="py-4 px-4 text-xs">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
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
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking._id, "rejected")}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking._id, "approved")}
                                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition"
                              >
                                Approve
                              </button>
                            </>
                          )}
                          {booking.status === "approved" && (
                            <button
                              onClick={() => handleUpdateBookingStatus(booking._id, "borrowed")}
                              className="rounded-lg bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-800 transition"
                            >
                              Mark Borrowed
                            </button>
                          )}
                          {booking.status === "borrowed" && (
                            <button
                              onClick={() => handleUpdateBookingStatus(booking._id, "returned")}
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                            >
                              Mark Returned
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Contents: Equipment Catalog */}
        {activeTab === "catalog" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Edit Equipment Details Panel */}
            {editingEquip && (
              <div className="rounded-2xl bg-white p-6 shadow-md border border-purple-100">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Edit Equipment: {editingEquip.name}</h3>
                <form onSubmit={handleUpdateEquipment} className="grid gap-4 md:grid-cols-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Quantity</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editForm.totalQuantity}
                      onChange={(e) => setEditForm({ ...editForm, totalQuantity: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Available Quantity</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editForm.availableQuantity}
                      onChange={(e) => setEditForm({ ...editForm, availableQuantity: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status / Availability</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950"
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable (Disabled)</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setEditingEquip(null)}
                      className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-purple-700 px-5 py-2 font-semibold text-white hover:bg-purple-800 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Catalog List */}
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Department Equipment Catalog</h2>
              {equipmentsList.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">No equipment added to your department catalog yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-700 text-sm font-semibold">
                        <th className="py-3 px-4">Equipment</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Qty (Avail / Total)</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Availability</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                      {equipmentsList.map((equip) => (
                        <tr key={equip._id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-4">
                            <p className="font-semibold text-slate-950">{equip.name}</p>
                            <p className="text-xs text-slate-500">{equip.description}</p>
                            {(equip.modelNumber || equip.serialNumber) && (
                              <p className="text-xxs text-slate-400 mt-0.5">
                                {equip.modelNumber && `Model: ${equip.modelNumber}`} 
                                {equip.serialNumber && ` | SN: ${equip.serialNumber}`}
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-4 capitalize">{equip.category}</td>
                          <td className="py-4 px-4 font-semibold">
                            {equip.availableQuantity} / {equip.totalQuantity}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-600">{equip.location || "N/A"}</td>
                          <td className="py-4 px-4">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                              equip.status === "available"
                                ? "bg-green-100 text-green-800"
                                : equip.status === "maintenance"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {equip.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right space-x-2">
                            <button
                              onClick={() => startEditing(equip)}
                              className="rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition"
                            >
                              Edit Status
                            </button>
                            <button
                              onClick={() => handleDeleteEquipment(equip._id)}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Contents: Processed History */}
        {activeTab === "history" && (
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Department Borrows History</h2>
            {historyList.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No completed borrowings logged in your department.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-700 text-sm font-semibold">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Equipment</th>
                      <th className="py-3 px-4">Qty</th>
                      <th className="py-3 px-4">Borrowing Period</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date Actioned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                    {historyList.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-4 font-semibold text-slate-950">
                          {log.user?.name || "Deleted User"}
                          <span className="block text-xs font-normal text-slate-500">ID: {log.user?.studentId}</span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-purple-900">{log.equipment?.name}</td>
                        <td className="py-4 px-4 font-semibold">{log.quantity}</td>
                        <td className="py-4 px-4 text-xs text-slate-600">
                          {new Date(log.startDate).toLocaleDateString()} - {new Date(log.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                            log.status === "approved" || log.status === "returned"
                              ? "bg-green-100 text-green-800"
                              : log.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : log.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500">
                          {log.returnedDate
                            ? `Returned: ${new Date(log.returnedDate).toLocaleDateString()}`
                            : `Updated: ${new Date(log.updatedAt).toLocaleDateString()}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LabasistDashboard;
