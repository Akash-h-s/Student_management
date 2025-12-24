import React, { useState } from "react";
import { Link } from "react-router-dom";
type Role = "admin" | "teacher" | "parent" | "student";

export default function Signup() {
  const [role, setRole] = useState<Role | "">("");
  const [form, setForm] = useState({
    schoolName: "",
    fullName: "",
    email: "",
    confirmEmail: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) return alert("Please select a role");
    if (role === "admin" && !form.schoolName)
      return alert("School name is required for Admin");
    if (role === "teacher" && form.email !== form.confirmEmail)
      return alert("Emails do not match");
    if (form.password !== form.confirmPassword)
      return alert("Passwords do not match");

    alert(`Signup Successful!\nRole: ${role.toUpperCase()}`);

    const user = {
      name: form.fullName || form.email.split("@")[0],
      role: role,
    };
    localStorage.setItem("user", JSON.stringify(user));
    window.location.href = "/";
  };

  return (
    <div className="flex justify-center mt-[50px]">
      <div className="w-[400px] p-[25px] rounded-[12px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
        <h2 className="text-center mb-[20px] font-semibold text-[1.5rem]">
          Signup
        </h2>

        {/* Role Buttons */}
        <div className="flex justify-between mb-[20px]">
          {(["admin", "teacher", "parent", "student"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`w-[23%] py-[9px] rounded-[6px] text-[14px] transition duration-200 ${
                role === r
                  ? "bg-[#007bff] text-white"
                  : "bg-[#eee] text-black hover:bg-gray-300"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {role === "admin" && (
            <input
              className="w-full p-[10px] mb-[20px] rounded-[6px] border border-[#ccc] focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="School Name"
              name="schoolName"
              onChange={handleChange}
            />
          )}

          {(role === "admin" || role === "teacher" || role === "student") && (
            <input
              className="w-full p-[10px] mb-[20px] rounded-[6px] border border-[#ccc] focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Full Name"
              name="fullName"
              onChange={handleChange}
            />
          )}

          {role === "student" && (
            <input
              className="w-full p-[10px] mb-[20px] rounded-[6px] border border-[#ccc] focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Student ID / Roll No"
              name="studentId"
              onChange={handleChange}
            />
          )}

          <input
            className="w-full p-[10px] mb-[20px] rounded-[6px] border border-[#ccc] focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            placeholder="Email"
            name="email"
            onChange={handleChange}
          />

          {role === "teacher" && (
            <input
              className="w-full p-[10px] mb-[20px] rounded-[6px] border border-[#ccc] focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              placeholder="Confirm Email"
              name="confirmEmail"
              onChange={handleChange}
            />
          )}

          <input
            className="w-full p-[10px] mb-[20px] rounded-[6px] border border-[#ccc] focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleChange}
          />

          <input
            className="w-full p-[10px] rounded-[6px] border border-[#ccc] focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full p-[12px] mt-[10px] rounded-[6px] bg-[#28a745] text-white text-[16px] transition hover:bg-green-700"
          >
            Continue
          </button>
        </form>

        <p className="text-[px] mt-[20px] text-center">
           Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
