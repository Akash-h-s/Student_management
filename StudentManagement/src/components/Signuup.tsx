import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, setRole } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";

type Role = "admin";
interface InputConfig {
  name: string;
  placeholder: string;
  type?: string;
  roles?: string[];
}

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    schoolName: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!form.schoolName.trim()) return "School name is required.";
    if (!emailRegex.test(form.email)) return "Please enter a valid email address.";
    if (!passwordRegex.test(form.password)) {
      return "Password must be at least 8 characters long and contain both letters and numbers.";
    }
    if (form.phone.length < 10) return "Please enter a valid phone number.";
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) return alert(error);

    try {
      const response = await fetch("/api/hasura/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: form.schoolName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: "admin",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return alert(result.message || "Signup failed");
      }
      const userData = {
        name: result.name || form.schoolName, 
        email: result.email || form.email,
        role: result.role || "admin",
      };

      dispatch(setUser(userData));
      dispatch(setRole("admin"));
      
      alert(`Signup Successful!`);
      navigate("/");

    } catch (err) {
      alert("Server not reachable");
    }
  };

  const inputs: InputConfig[] = [
    { name: "schoolName", placeholder: "School Name", roles: ["admin"] },
    { name: "email", placeholder: "Email", roles: ["admin"] },
    { name: "password", placeholder: "Password (Min. 8 chars, Alphanumeric)", type: "password", roles: ["admin"] },
    { name: "phone", placeholder: "Phone Number", type: "text", roles: ["admin"] },
  ];

  return (
    <div className="flex justify-center mt-12">
      <div className="w-96 p-6 rounded-lg bg-white shadow-lg border border-gray-100">
        <h2 className="text-center mb-5 font-semibold text-xl text-gray-800">Admin Signup</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {inputs.map((input) =>
            input.roles?.includes("admin") ? (
              <input
                key={input.name}
                className="w-full p-2 mb-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="w-full p-3 mt-2 rounded bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
          >
            Create Account
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}