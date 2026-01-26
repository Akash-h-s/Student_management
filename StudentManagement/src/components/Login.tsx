import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, setRole as setReduxRole } from "../features/auth/authSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [role, setRole] = useState("Student");
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");      
  const [studentName, setStudentName] = useState(""); 

  
  const requiresPassword = role === "Admin" || role === "Teacher" || role === "Parent";

  const handleLogin = async () => {
    if (!identifier) return alert(`Please enter your ${role === "Student" ? "Admission Number" : "Email"}`);
    
    if (requiresPassword && !password) {
      return alert(`${role} password is required`);
    }
    if (role === "Student" && !studentName) {
      return alert("Student name is required");
    }

    try {
      const response = await fetch("http://localhost:3000/hasura/login", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role.toLowerCase(),
          identifier,
          password: requiresPassword ? password : null,
          studentName: role === "Student" ? studentName : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return alert(result.message || "Login/Verification failed");
      }

      dispatch(setUser({
        name: result.user.name,
        email: result.user.email || "",
        role: result.user.role,
      }));
      dispatch(setReduxRole(result.user.role));

      alert(`Welcome, ${result.user.name}`);
      navigate("/");
    } catch (err) {
      alert("Database connection error. Is SAM running?");
    }
  };

  return (
    <div className="w-96 mx-auto mt-20 p-8 bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col gap-4">
      <h2 className="text-center text-blue-900 font-extrabold text-3xl mb-1">EduCloud</h2>
      <p className="text-center text-gray-400 text-sm mb-4 italic">Secure Role-Based Access</p>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-gray-700">Login As</label>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setIdentifier("");
            setPassword("");
            setStudentName("");
          }}
          className="p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option>Student</option>
          <option>Parent</option>
          <option>Teacher</option>
          <option>Admin</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-gray-700">
          {role === "Student" ? "Admission Number" : "Email Address"}
        </label>
        <input
          type="text"
          placeholder={role === "Student" ? "Enter ADM No." : "Enter Email"}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {requiresPassword && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">{role} Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      )}

      {role === "Student" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-700">Full Name</label>
          <input
            type="text"
            placeholder="Name as registered by Admin"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      )}

      <button
        onClick={handleLogin}
        className="mt-4 p-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-all shadow-lg active:scale-95"
      >
        {requiresPassword ? "Sign In" : "Verify & Enter"}
      </button>
    </div>
  );
}

export default Login;