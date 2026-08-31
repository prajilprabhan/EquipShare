import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    email: "",
    phone: "",
    department: "",
    semester: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      setLoading(false);
      return;
    }

    const signupData = {
      name: formData.name,
      studentId: formData.studentId,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      semester: formData.semester,
      password: formData.password,
      role: "student",
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error((data && data.message) || `Registration failed with status ${response.status}. Please try again.`);
      }

      setSuccess("Registration successful! Redirecting to login page...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      if (err.message && err.message.includes("Failed to fetch")) {
        setError("Unable to connect to backend server. Please check your internet connection.");
      } else {
        setError(err.message || "Failed to connect to the server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">

      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">

          <Link
            to="/"
            className="text-3xl font-bold text-black"
          >
            Equip<span className="text-purple-600">Share</span>
          </Link>

          <h1 className="mt-6 text-3xl font-bold text-black">
            Student Registration
          </h1>

          <p className="mt-2 text-gray-600">
            Register for institutional department-wise equipment sharing
          </p>

        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">

          {/* Verification Notice */}
          <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-sm leading-6 text-purple-900">
              Your registration will be reviewed and verified by
              your Department Head (HOD) for campus-wide equipment borrowing access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name + Student ID */}
            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block font-medium text-black">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-black">
                  Student ID / Register Number
                </label>

                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="Enter your register number"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                />
              </div>

            </div>

            {/* Email + Phone */}
            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block font-medium text-black">
                  College Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your college email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-black">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                />
              </div>

            </div>

            {/* Department + Semester */}
            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block font-medium text-black">
                  Department
                </label>

                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                >
                  <option value="">
                    Select Department
                  </option>

                  <option value="computer_science">
                    Computer Science
                  </option>

                  <option value="information_technology">
                    Information Technology
                  </option>

                  <option value="electronics">
                    Electronics
                  </option>

                  <option value="electrical">
                    Electrical Engineering
                  </option>

                  <option value="mechanical">
                    Mechanical Engineering
                  </option>

                  <option value="civil">
                    Civil Engineering
                  </option>

                  <option value="other">
                    Other
                  </option>

                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-black">
                  Semester
                </label>

                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                >
                  <option value="">
                    Select Semester
                  </option>

                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>

                </select>
              </div>

            </div>

            {/* Password */}
            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block font-medium text-black">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-black">
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
                />
              </div>

            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 font-medium">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg py-3 font-semibold text-white transition ${
                loading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"
              }`}
            >
              {loading ? "Registering..." : "Submit Registration"}
            </button>

          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-purple-700 hover:text-purple-900"
            >
              Sign In
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Signup;