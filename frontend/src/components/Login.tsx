import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const user = {
      name: email.split("@")[0],
      role: role,
    };

    localStorage.setItem("user", JSON.stringify(user));
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="w-80 mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg flex flex-col gap-3 animate-fadeIn">
      <h3 className="text-center text-blue-900 font-bold text-2xl mb-4">
        Login
      </h3>

      {/* Role */}
      <label className="font-semibold text-gray-700">Role</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="p-2 border border-gray-300 rounded-md text-base outline-none focus:border-blue-900 focus:shadow-md"
      >
        <option>Admin</option>
        <option>Teacher</option>
        <option>Parent</option>
        <option>Student</option>
      </select>

      {/* Email */}
      <label className="font-semibold text-gray-700 mt-2">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border border-gray-300 rounded-md text-base outline-none focus:border-blue-900 focus:shadow-md"
      />

      {/* Password */}
      <label className="font-semibold text-gray-700 mt-2">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border border-gray-300 rounded-md text-base outline-none focus:border-blue-900 focus:shadow-md"
      />

      {/* Login Button */}
      <button
        onClick={handleLogin}
        className="mt-4 p-3 bg-blue-900 text-white text-base rounded-md cursor-pointer transition hover:bg-blue-800 hover:-translate-y-0.5"
      >
        Login
      </button>

      {/* Fade-in Animation */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-0.5rem); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
          }
        `}
      </style>
    </div>
  );
}

export default Login;
