import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HodDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [showAddAssistForm, setShowAddAssistForm] = useState(false);
  const [assistForm, setAssistForm] = useState({
    name: "",
    studentId: "",
    email: "",
    phone: "",
    password: "",
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
    if (parsedUser.role !== "hod") {
      navigate("/login");
      return;
    }

    setUser(parsedUser);
    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      setLoading(true);
      // Fetch pending
      const response = await fetch("http://localhost:5000/api/hod/pending-students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setPendingStudents(data.students);
      }

      // Fetch all students
      const allRes = await fetch("http://localhost:5000/api/hod/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allData = await allRes.json();
      if (allData.success) {
        setAllStudents(allData.students);
      }

      // Fetch history
      const histRes = await fetch("http://localhost:5000/api/hod/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const histData = await histRes.json();
      if (histData.success) {
        setHistoryList(histData.bookings);
      }
    } catch (err) {
      setError("Failed to fetch department dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (studentId, status) => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/hod/students/${studentId}/verify`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to verify student.");
      }

      setSuccess(`Student registration ${status === "approved" ? "approved" : "rejected"} successfully.`);
      fetchDashboardData(token);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  const handleCreateAssistant = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/hod/labassistants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assistForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create Lab Assistant.");
      }

      setSuccess("Lab Assistant registered successfully for your department.");
      setAssistForm({
        name: "",
        studentId: "",
        email: "",
        phone: "",
        password: "",
      });
      setShowAddAssistForm(false);
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
      <div className="mx-auto max-w-7xl">
        {/* Greetings header */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-800 to-indigo-950 p-6 text-white shadow-lg md:p-8 flex flex-wrap justify-between items-center gap-4">
          <div>
            <p className="text-blue-300 font-medium uppercase tracking-wider text-sm font-semibold">Head of Department Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">Hello, Dr. {user?.name}!</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-200">
              <span><strong>Department:</strong> {user?.department.replace("_", " ").toUpperCase()}</span>
              <span>•</span>
              <span><strong>Role:</strong> HOD</span>
            </div>
          </div>
          <div>
            <button
              onClick={() => setShowAddAssistForm(!showAddAssistForm)}
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-blue-950 shadow hover:bg-blue-50 transition"
            >
              {showAddAssistForm ? "Cancel Add Assistant" : "+ Create Lab Assistant"}
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

        {/* Create Lab Assistant Form */}
        {showAddAssistForm && (
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-md border border-slate-100 animate-slideDown">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Register Lab Assistant</h2>
            <p className="text-sm text-slate-600 mb-4">
              The assistant will be automatically locked to your department: <strong className="capitalize">{user?.department.replace("_", " ")}</strong>
            </p>
            <form onSubmit={handleCreateAssistant} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={assistForm.name}
                    onChange={(e) => setAssistForm({ ...assistForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Staff ID / User ID *</label>
                  <input
                    type="text"
                    required
                    value={assistForm.studentId}
                    onChange={(e) => setAssistForm({ ...assistForm, studentId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">College Email *</label>
                  <input
                    type="email"
                    required
                    value={assistForm.email}
                    onChange={(e) => setAssistForm({ ...assistForm, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={assistForm.phone}
                    onChange={(e) => setAssistForm({ ...assistForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={assistForm.password}
                    onChange={(e) => setAssistForm({ ...assistForm, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-700 px-6 py-2 font-semibold text-white hover:bg-blue-800 transition"
                >
                  Save Lab Assistant
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
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Pending Registrations ({pendingStudents.length})
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition ${
              activeTab === "students"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Manage Students ({allStudents.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition ${
              activeTab === "history"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Department Booking History
          </button>
        </div>

        {/* Tab Contents: Pending Approvals */}
        {activeTab === "pending" && (
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Review Student Registrations</h2>
            {pendingStudents.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No student registrations pending review in your department.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-700 text-sm font-semibold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                    {pendingStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-4 font-semibold text-slate-950">{student.name}</td>
                        <td className="py-4 px-4">{student.studentId}</td>
                        <td className="py-4 px-4">{student.email}</td>
                        <td className="py-4 px-4">Semester {student.semester}</td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleVerify(student._id, "rejected")}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleVerify(student._id, "approved")}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Contents: Manage Students */}
        {activeTab === "students" && (
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Manage Department Students</h2>
            {allStudents.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No student registrations found in your department.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-700 text-sm font-semibold">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                    {allStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-4 font-semibold text-slate-950">{student.name}</td>
                        <td className="py-4 px-4">{student.studentId}</td>
                        <td className="py-4 px-4">{student.email}</td>
                        <td className="py-4 px-4">Semester {student.semester}</td>
                        <td className="py-4 px-4">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                            student.verificationStatus === "approved"
                              ? "bg-green-100 text-green-800"
                              : student.verificationStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {student.verificationStatus === "approved" ? "Active" : student.verificationStatus === "pending" ? "Pending Approval" : "Restricted"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          {student.verificationStatus === "approved" && (
                            <button
                              onClick={() => handleVerify(student._id, "rejected")}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                            >
                              Restrict Login
                            </button>
                          )}
                          {student.verificationStatus === "rejected" && (
                            <button
                              onClick={() => handleVerify(student._id, "approved")}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition"
                            >
                              Enable Login
                            </button>
                          )}
                          {student.verificationStatus === "pending" && (
                            <>
                              <button
                                onClick={() => handleVerify(student._id, "rejected")}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleVerify(student._id, "approved")}
                                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition"
                              >
                                Approve
                              </button>
                            </>
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

        {/* Tab Contents: Department History */}
        {activeTab === "history" && (
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-100 animate-fadeIn">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Department Borrows History</h2>
            {historyList.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No equipment borrowings recorded in your department.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-700 text-sm font-semibold">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Equipment</th>
                      <th className="py-3 px-4">Qty</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 font-semibold">Approved By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                    {historyList.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-4 font-semibold text-slate-950">
                          {log.user?.name || "Deleted Student"}
                          <span className="block text-xs font-normal text-slate-500">ID: {log.user?.studentId}</span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-purple-900">
                          {log.equipment?.name || "Deleted Equipment"}
                          <span className="block text-xs font-normal text-slate-500">Cat: {log.equipment?.category}</span>
                        </td>
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
                        <td className="py-4 px-4 text-xs">{log.approvedBy?.name || "N/A"}</td>
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

export default HodDashboard;
