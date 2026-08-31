import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    studentId: "",
    email: "",
    phone: "",
    department: "",
    semester: "N/A",
    password: "",
    role: "hod",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [changingPasswordUser, setChangingPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
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

    if (!parsedUser || parsedUser.role !== "admin") {
      navigate("/login");
      return;
    }

    setUser(parsedUser);
    fetchAdminData(token);
  }, [navigate]);

  const fetchAdminData = async (token) => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsersList(usersData.users);
      }

      // Fetch history
      const historyRes = await fetch(`${API_BASE_URL}/api/admin/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const historyData = await historyRes.json();
      if (historyData.success) {
        setHistoryList(historyData.bookings);
      }
    } catch (err) {
      setError("Failed to fetch admin dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUserForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create user.");
      }

      setSuccess(`User (${newUserForm.role.toUpperCase()}) created successfully.`);
      setNewUserForm({
        name: "",
        studentId: "",
        email: "",
        phone: "",
        department: "",
        semester: "N/A",
        password: "",
        role: "hod",
      });
      setShowAddUserForm(false);
      fetchAdminData(token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update user role.");
      }

      setSuccess("User role updated successfully.");
      fetchAdminData(token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const handleUpdatePassword = async (userId) => {
    if (!newPassword || newPassword.trim().length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to change user password.");
      }

      setSuccess(`Password for user '${changingPasswordUser.name}' updated successfully.`);
      setChangingPasswordUser(null);
      setNewPassword("");
      fetchAdminData(token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This will also remove all their bookings.")) {
      return;
    }

    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user.");
      }


      setSuccess("User deleted successfully.");
      fetchAdminData(token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const filteredUsers = usersList.filter((usr) => {
    // 1. Search Query filter (matches name, email, or studentId)
    const matchesSearch =
      searchQuery.trim() === "" ||
      usr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usr.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usr.studentId.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Role filter
    const matchesRole = filterRole === "all" || usr.role === filterRole;

    // 3. Department filter
    const matchesDept = filterDept === "all" || usr.department === filterDept;

    // 4. Verification Status filter
    const matchesStatus = filterStatus === "all" || usr.verificationStatus === filterStatus;

    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  if (loading && !stats && usersList.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
        <p className="text-lg font-semibold text-slate-700">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header banner */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-950 p-6 text-white shadow-lg md:p-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-purple-300 font-medium uppercase tracking-wider text-sm">Super Admin Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">System Control Center</h1>
            <p className="mt-2 text-purple-200 text-sm">Welcome back, {user?.name}. You have full operational control.</p>
          </div>
          <div>
            <button
              onClick={() => setShowAddUserForm(!showAddUserForm)}
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-purple-950 shadow hover:bg-purple-50 transition"
            >
              {showAddUserForm ? "Cancel Add User" : "+ Create HOD / Staff"}
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

        {/* System Stats Cards */}
        {stats && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Users</span>
              <p className="text-4xl font-extrabold text-slate-900 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Equipments</span>
              <p className="text-4xl font-extrabold text-slate-900 mt-2">{stats.totalEquipments}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
              <p className="text-4xl font-extrabold text-slate-900 mt-2">{stats.totalBookings}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Pending Bookings</span>
              <p className="text-4xl font-extrabold text-purple-800 mt-2">{stats.bookingStats?.pending || 0}</p>
            </div>
          </div>
        )}

        {/* Add User Form */}
        {showAddUserForm && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-md border border-slate-100 animate-slideDown">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Create New HOD, Assistant, or Staff</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">User ID / Staff ID *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.studentId}
                    onChange={(e) => setNewUserForm({ ...newUserForm, studentId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
                  <select
                    required
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950"
                  >
                    <option value="">Select Department</option>
                    <option value="computer_science">Computer Science</option>
                    <option value="information_technology">Information Technology</option>
                    <option value="electronics">Electronics</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="civil">Civil</option>
                    <option value="admin">Administrative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950"
                  >
                    <option value="hod">HOD (Department Head)</option>
                    <option value="labasist">Lab Assistant</option>
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-purple-700 px-6 py-2 font-semibold text-white hover:bg-purple-800 transition"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition ${
              activeTab === "users"
                ? "border-purple-700 text-purple-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            User Accounts
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition ${
              activeTab === "history"
                ? "border-purple-700 text-purple-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            System Booking History
          </button>
        </div>

        {/* Tab Contents: Users List */}
        {activeTab === "users" && (
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">User Accounts Management</h2>

            {/* Filter Bar */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Search Users
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, ID, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pl-9 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Filter by Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="hod">HOD</option>
                  <option value="labasist">Lab Assist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Filter by Department
                </label>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Departments</option>
                  <option value="computer_science">Computer Science</option>
                  <option value="information_technology">Information Tech</option>
                  <option value="electronics">Electronics</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="civil">Civil</option>
                  <option value="admin">Administrative</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Verification Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 text-left align-middle">User</th>
                    <th className="py-3 px-4 text-left align-middle">College Email</th>
                    <th className="py-3 px-4 text-left align-middle">Department</th>
                    <th className="py-3 px-4 text-center align-middle">Current Role</th>
                    <th className="py-3 px-4 text-center align-middle">Verification</th>
                    <th className="py-3 px-4 text-right align-middle">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500 text-sm">
                        No users found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((usr) => (
                      <tr key={usr._id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-4 text-left align-middle">
                          <span className="font-semibold text-slate-950 block">{usr.name}</span>
                          <span className="block text-xs font-normal text-slate-500">ID: {usr.studentId}</span>
                        </td>
                        <td className="py-4 px-4 text-left align-middle text-slate-600">{usr.email}</td>
                        <td className="py-4 px-4 text-left align-middle capitalize">{usr.department.replace("_", " ")}</td>
                        <td className="py-4 px-4 text-center align-middle capitalize font-medium text-slate-950 whitespace-nowrap">{usr.role}</td>
                        <td className="py-4 px-4 text-center align-middle whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                            usr.verificationStatus === "approved"
                              ? "bg-green-100 text-green-800"
                              : usr.verificationStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {usr.verificationStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right align-middle whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setChangingPasswordUser(usr);
                                setNewPassword("");
                              }}
                              className="rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition whitespace-nowrap"
                            >
                              🔑 Password
                            </button>
                            {user?._id !== usr._id && (
                              <button
                                onClick={() => handleDeleteUser(usr._id)}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition whitespace-nowrap"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Contents: System History */}
        {activeTab === "history" && (
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Department-Wise Booking Logs</h2>
            {historyList.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No equipment borrowings recorded in the system.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4 text-left align-middle">Borrower</th>
                      <th className="py-3 px-4 text-left align-middle">Equipment</th>
                      <th className="py-3 px-4 text-left align-middle">Department</th>
                      <th className="py-3 px-4 text-center align-middle">Qty</th>
                      <th className="py-3 px-4 text-left align-middle">Period</th>
                      <th className="py-3 px-4 text-center align-middle">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                    {historyList.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-4 text-left align-middle">
                          <span className="font-semibold text-slate-950 block">{log.user?.name || "Deleted User"}</span>
                          <span className="block text-xs font-normal text-slate-500">ID: {log.user?.studentId}</span>
                        </td>
                        <td className="py-4 px-4 text-left align-middle font-semibold text-purple-900">
                          {log.equipment?.name || "Deleted Equipment"}
                          <span className="block text-xs font-normal text-slate-500 font-sans">Cat: {log.equipment?.category}</span>
                        </td>
                        <td className="py-4 px-4 text-left align-middle capitalize text-slate-700">{log.equipment?.department.replace("_", " ") || "N/A"}</td>
                        <td className="py-4 px-4 text-center align-middle font-semibold whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs">
                            {log.quantity}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-left align-middle text-xs text-slate-600 whitespace-nowrap">
                          {new Date(log.startDate).toLocaleDateString()} - {new Date(log.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-center align-middle whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Change Password Modal */}
        {changingPasswordUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-slate-150 pb-3 mb-4">
                <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                <button
                  onClick={() => setChangingPasswordUser(null)}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-650">
                    Set a new password for <strong>{changingPasswordUser.name}</strong> (ID: {changingPasswordUser.studentId}).
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setChangingPasswordUser(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdatePassword(changingPasswordUser._id)}
                    className="rounded-lg bg-purple-700 px-5 py-2 font-semibold text-white hover:bg-purple-800 transition text-sm"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
