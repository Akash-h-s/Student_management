import React from "react";
import Footer from "../Footer/Footer";

const AboutUs=() => {
  return (
    <section className="bg-gray-100 py-20 px-2">

      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center ml-24">
        <div className="mt-4 mr-20">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            About Us
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            Our Student Management System is designed to simplify and modernize
            academic administration. We help institutions manage students,
            teachers, parents, and academic data efficiently using secure and
            scalable technology.
          </p>

          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            From attendance tracking to performance monitoring, our platform
            ensures transparency, accuracy, and seamless communication between
            students, parents, and educators.
          </p>

          <p className="mt-5 text-lg text-blue-600">
            We believe technology should empower education — not complicate it.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {[
            {
              icon: "🎓",
              title: "Student Support",
              text:
                "Centralized student records, attendance tracking, and academic performance monitoring.",
            },
            {
              icon: "👨‍🏫",
              title: "Teacher Management",
              text:
                "Tools for managing classes, assignments, grading, and student evaluations.",
            },
            {
              icon: "👨",
              title: "Parent Access",
              text:
                "Real-time updates on attendance, results, and announcements to keep parents informed.",
            },
            {
              icon: "📊",
              title: "Smart Analytics",
              text:
                "Data-driven insights to help institutions make better academic and administrative decisions.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white flex gap-5 p-6 items-start shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="bg-blue-100 text-blue-600 text-2xl w-14 h-14 rounded-xl flex items-center justify-center mt-2">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-10 items-center mt-24">
        <div className="mt-16 mr-24">
          <img
            src="https://cdn.pixabay.com/photo/2023/01/30/14/03/education-7755785_1280.png"
            className="h-96"
          />
        </div>

        <div className="mt-20 mr-20">
          <h1 className="text-4xl font-bold text-slate-800 mb-5">
            Our Mission
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            We aim to bridge the gap between traditional education and modern
            technology. Our platform provides a centralized system to streamline
            all academic processes, saving time for teachers and giving students
            and parents real-time access to information.
          </p>

          <p className="mt-5 text-blue-600 text-lg">
            Where technology meets education.
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-10 items-center mt-24">
        <div className="mt-20 mr-20">
          <h1 className="text-4xl font-bold text-slate-800 mb-5">
            What Sets Us Apart
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            Unlike traditional education management systems, our platform integrates
            all academic processes in one centralized, user-friendly interface.
          </p>

          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            We focus on real-time communication, giving students, parents, and
            teachers instant access to vital information without delays.
          </p>

          <p className="mt-5 text-blue-600 text-lg">
            Innovating education for a brighter tomorrow.
          </p>
        </div>

        <div className="mt-16 ml-24">
          <img
            src="https://pngimg.com/uploads/student/student_PNG147.png"
            className="h-96"
          />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
