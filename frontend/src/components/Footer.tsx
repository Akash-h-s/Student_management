import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0C2B4E] text-[#f1f1f1] pt-[40px] pr-[20px] pb-[20px] pl-[20px] font-['Arial',sans-serif]">

      <div className="flex flex-wrap justify-center text-center gap-[20px] max-w-[1200px] my-0 mx-auto">

        <div className="flex-[1_1_250px] flex flex-col items-center ">
          <h3 className="text-[1.2rem] mb-[15px] text-[#ffcb05] font-bold">About Us</h3>
          <p className="text-[0.95rem] leading-[1.6] text-[#f1f1f1] max-w-[300px] text-left">
            EduCloud Smart Management System is designed to simplify school,
            student, and teacher management with intelligent solutions for
            modern education.
          </p>
        </div>

        <div className="flex-[1_1_250px] flex flex-col items-center">
          <h3 className="text-[1.2rem] mb-[15px] text-[#ffcb05] font-bold">Services</h3>
          <ul className="list-none p-0 m-0 text-left">
            <li className="text-[0.95rem] leading-[1.6] text-[#f1f1f1] mb-[8px]">Student Management</li>
            <li className="text-[0.95rem] leading-[1.6] text-[#f1f1f1] mb-[8px]">Teacher & Staff Management</li>
            <li className="text-[0.95rem] leading-[1.6] text-[#f1f1f1] mb-[8px]">Attendance Tracking</li>
            <li className="text-[0.95rem] leading-[1.6] text-[#f1f1f1] mb-[8px]">Exam & Result Management</li>
            <li className="text-[0.95rem] leading-[1.6] text-[#f1f1f1] mb-[8px]">Parent Notifications</li>
          </ul>
        </div>


        <div className="flex-[1_1_250px] flex flex-col items-center">
          <h3 className="text-[1.2rem] mb-[15px] text-[#ffcb05] font-bold ">Contact Info</h3>
          <div className="text-left">
            <p className="text-[0.95rem] leading-[1.6] text-[#f1f1f1]">Email: support@educloud.com</p>
          <p className="text-[0.95rem] leading-[1.6] text-[#f1f1f1]">Phone: +91 6360434523</p>
          <p className="text-[0.95rem] leading-[1.6] text-[#f1f1f1]">Address: EduCloud St, Bengaluru, India</p>
          </div>
        </div>
      </div>


      <div className="text-center mt-[30px] text-[0.9rem] text-[#aaa] border-t border-t-[#333]/50 pt-[15px]">
        <p>&copy; {new Date().getFullYear()} EduCloud Smart Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;