import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, setRole } from "../features/auth/authSlice";
import { Link } from "react-router-dom";

type Role = "admin" | "teacher" | "parent" | "student";

interface InputConfig {
  name: string;
  placeholder: string;
  type?: string;
  roles?: Role[]; // only show for these roles
}

export default function Signup() {
  const dispatch = useDispatch();

  const [role, setLocalRole] = useState<Role | "">("");
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

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value as Role;
    setLocalRole(selectedRole);
    dispatch(setRole(selectedRole));
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

    const user = {
      name: form.fullName || form.email.split("@")[0],
      email: form.email,
      role: role,
    };

    dispatch(setUser(user));
    localStorage.setItem("user", JSON.stringify(user));
    alert(`Signup Successful!\nRole: ${role.toUpperCase()}`);
    window.location.href = "/";
  };

  // Define all input fields in one array
  const inputs: InputConfig[] = [
    { name: "schoolName", placeholder: "School Name", roles: ["admin"] },
    { name: "fullName", placeholder: "Full Name", roles: ["admin", "teacher", "student"] },
    { name: "studentId", placeholder: "Student ID / Roll No", roles: ["student"] },
    { name: "email", placeholder: "Email", roles: ["admin", "teacher", "student", "parent"] },
    { name: "confirmEmail", placeholder: "Confirm Email", roles: ["teacher"] },
    { name: "password", placeholder: "Password", type: "password", roles: ["admin", "teacher", "student", "parent"] },
    { name: "confirmPassword", placeholder: "Confirm Password", type: "password", roles: ["admin", "teacher", "student", "parent"] },
  ];

  return (
    <div className="flex justify-center mt-12">
      <div className="w-96 p-6 rounded-lg bg-white shadow-lg">
        <h2 className="text-center mb-5 font-semibold text-xl">Signup</h2>

        {/* Role Selector */}
        <label className="font-semibold text-gray-700 mb-2 block">Role</label>
        <select
          value={role}
          onChange={handleRoleChange}
          className="w-full p-2 mb-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Role</option>
          {(["admin", "teacher", "parent", "student"] as Role[]).map(r => (
            <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
          ))}
        </select>

        <form onSubmit={handleSubmit} className="space-y-3">
          {inputs.map((input) =>
            role && input.roles?.includes(role) ? (
              <input
                key={input.name}
                className="w-full p-2 rounded border mb-3 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type={input.type || "text"}
                placeholder={input.placeholder}
                name={input.name}
                value={(form as any)[input.name]}
                onChange={handleChange}
              />
            ) : null
          )}

          <button
            type="submit"
            className="w-full p-3 mt-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
          >
            Continue
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
