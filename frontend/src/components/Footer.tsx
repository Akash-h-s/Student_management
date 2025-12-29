import React from "react";

const Footer: React.FC = () => {
  const services = [
    "Student Management",
    "Teacher & Staff Management",
    "Attendance Tracking",
    "Exam & Result Management",
    "Parent Notifications",
  ];

  return (
    <footer className="bg-slate-800 text-gray-100 pt-10 px-5 font-sans">

      <div className="flex flex-wrap justify-center text-center gap-5 max-w-6xl mx-auto">

        <div className="flex-1 min-w-[250px] flex flex-col items-center">
          <h3 className="text-lg mb-4 text-yellow-400 font-bold">About Us</h3>
          <p className="text-sm leading-6 max-w-xs text-left">
            EduCloud Smart Management System is designed to simplify school,
            student, and teacher management with intelligent solutions for
            modern education.
          </p>
        </div>

        <div className="flex-1 min-w-[250px] flex flex-col items-center">
          <h3 className="text-lg mb-4 text-yellow-400 font-bold">Services</h3>
          <ul className="list-none p-0 m-0 text-left">
            {services.map((service, index) => (
              <li
                key={index}
                className="text-sm leading-6 mb-2"
              >
                {service}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 min-w-[250px] flex flex-col items-center">
          <h3 className="text-lg mb-4 text-yellow-400 font-bold">Contact Info</h3>
          <div className="text-left">
            <p className="text-sm leading-6">Email: support@educloud.com</p>
            <p className="text-sm leading-6">Phone: +91 6360434523</p>
            <p className="text-sm leading-6">Address: EduCloud St, Bengaluru, India</p>
          </div>
        </div>

      </div>

      <div className="text-center mt-8 text-sm text-gray-400 border-t border-gray-700 pt-4">
        <p>&copy; {new Date().getFullYear()} EduCloud Smart Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
