import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
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
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      // Store token and user details in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Navigate based on user role (student, admin, hod, labasist)
      const role = data.user.role;
      if (role === "student") {
        navigate("/user/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "hod") {
        navigate("/hod/dashboard");
      } else if (role === "labasist") {
        navigate("/labasist/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-12">

      <div className="mx-auto max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">

          <Link
            to="/"
            className="text-3xl font-bold text-black"
          >
            Equip<span className="text-purple-600">Share</span>
          </Link>

          <h1 className="mt-6 text-3xl font-bold text-black">
            Welcome Back
          </h1>

          <p className="mt-2 text-gray-600">
            Sign in to your EquipShare account
          </p>

        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">

          {/* Verification Notice */}
          <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-sm leading-6 text-purple-900">
              Only HOD-verified student accounts can access
              EquipShare.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
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
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block font-medium text-black">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-purple-700 hover:text-purple-900"
                >
                  Forgot Password?
                </Link>
              </div>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-black outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg py-3 font-semibold text-white transition ${
                loading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

          </form>

          {/* Signup */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}

            <Link
              to="/signup"
              className="font-semibold text-purple-700 hover:text-purple-900"
            >
              Register as Student
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;