import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Student");

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
    <div className="w-[350px] mx-auto mt-[80px] p-[25px] bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] flex flex-col gap-[12px] animate-fadeIn">
      <h3 className="text-center text-[#0C2B4E] font-bold mb-[15px] text-[24px]">Login</h3>

      <label className="font-semibold text-[#333] mt-[5px]">Role</label>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="p-[10px] border border-[#ccc] rounded-[6px] text-[16px] outline-none transition focus:border-[#0C2B4E] focus:shadow-[0_0_4px_rgba(12,43,78,0.4)]"
      >
        <option>Admin</option>
        <option>Lecturer</option>
        <option>Parent</option>
        <option>Student</option>
      </select>

      <label className="font-semibold text-[#333] mt-[5px]">Email</label>
      <input
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        className="p-[10px] border border-[#ccc] rounded-[6px] text-[16px] outline-none transition focus:border-[#0C2B4E] focus:shadow-[0_0_4px_rgba(12,43,78,0.4)]"
      />

      <label className="font-semibold text-[#333] mt-[5px]">Password</label>
      <input
        type="password"
        className="p-[10px] border border-[#ccc] rounded-[6px] text-[16px] outline-none transition focus:border-[#0C2B4E] focus:shadow-[0_0_4px_rgba(12,43,78,0.4)]"
      />

      <button
        onClick={handleLogin}
        className="mt-[12px] p-[12px] bg-[#0C2B4E] text-white text-[17px] rounded-[8px] cursor-pointer transition hover:bg-[#093159] hover:-translate-y-[2px]"
      >
        Login
      </button>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
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
