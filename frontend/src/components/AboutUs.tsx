import React from "react";
import Footer from "./Footer";


const AboutUs: React.FC = () => {
  return (
    <section className="bg-[#f4f6f9] pt-[80px] pb-[80px] pl-[10px] pr-[10px] font-akash" id="about-wrapper">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 gap-16 items-center " id="about-container">
        <div className="mt-[1rem] mr-[5rem]" id="about-left ">
          <h1 className="font-[48px] font-bold text-[#2c3e50] mb-[15px]" id="about-title">About Us</h1>

          <p className="text-[20px] text-[#555] leading-[1.8] mb-[16px]" id="about-text">
            Our Student Management System is designed to simplify and modernize
            academic administration. We help institutions manage students,
            teachers, parents, and academic data efficiently using secure and
            scalable technology.
          </p>

          <p className="text-[20px] text-[#555] leading-[1.8] mb-[16px]" id="about-text">
            From attendance tracking to performance monitoring, our platform
            ensures transparency, accuracy, and seamless communication between
            students, parents, and educators.
          </p>

          <p className="mt-[20px] text-[20px] font-normal text-[#1e88e5]" id="about-highlight">
            We believe technology should empower education — not complicate it.
          </p>
        </div>
        <div className="flex flex-col gap-[24px]" id="about-right">
          <div className="bg-[#ffffff] flex gap-[20px] p-[24px] p-3 items-start shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-in-out hover:shadow-2xl hover:scale-105 feature-card transition-transform transition-shadow duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)" id="feature-card">
            <div className="bg-[#e3f2fd] text-[#1e88e5] text-[28px] w-[56px] h-[56px] rounded-[12px] flex items-center justify-center flex-shrink-0 mt-[10px]" id="feature-icon">🎓</div>
            <div>
              <h3 className="text-[20px] text-[#2c3e50] mb-[6px]">Student Support</h3>
              <p className="text-[16px] text-[#666] leading-[1.6]">
                Centralized student records, attendance tracking, and academic
                performance monitoring.
              </p>
            </div>
          </div>
          <div className="bg-[#ffffff] flex gap-[20px] p-[24px] p-3 items-start shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-in-out hover:shadow-2xl hover:scale-105 feature-card transition-transform transition-shadow duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)" id="feature-card">
            <div className="bg-[#e3f2fd] text-[#1e88e5] text-[28px] w-[56px] h-[56px] rounded-[12px] flex items-center justify-center flex-shrink-0 mt-[10px]" id="feature-icon">👨‍🏫</div>
            <div>
              <h3 className="text-[20px] text-[#2c3e50] mb-[6px]">Teacher Management</h3>
              <p className="text-[18px] text-[#666] leading-[1.6]">
                Tools for managing classes, assignments, grading, and student
                evaluations.
              </p>
            </div>
          </div>
          <div className="bg-[#ffffff] flex gap-[20px] p-[24px] p-3 items-start shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-in-out hover:shadow-2xl hover:scale-105 feature-card transition-transform transition-shadow duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)" id="feature-card">
            <div className="bg-[#e3f2fd] text-[#1e88e5] text-[28px] w-[56px] h-[56px] rounded-[12px] flex items-center justify-center flex-shrink-0 mt-[10px]" id="feature-icon">👨</div>
            <div>
              <h3 className="text-[20px] text-[#2c3e50] mb-[6px]">Parent Access</h3>
              <p className="text-[18px] text-[#666] leading-[1.6]">
                Real-time updates on attendance, results, and announcements to
                keep parents informed.
              </p>
            </div>
          </div>
          <div className="bg-[#ffffff] flex gap-[20px] p-[24px] p-3 items-start shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-in-out hover:shadow-2xl hover:scale-105 feature-card transition-transform transition-shadow duration-300 ease-in-out hover:-translate-y-1.5 hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)" id="feature-card">
            <div className="bg-[#e3f2fd] text-[#1e88e5] text-[28px] w-[56px] h-[56px] rounded-[12px] flex items-center justify-center flex-shrink-0 mt-[10px]" id="feature-icon">📊</div>
            <div>
              <h3 className="text-[20px] text-[#2c3e50] mb-[6px]">Smart Analytics</h3>
              <p className="text-[18px] text-[#666] leading-[1.6]">
                Data-driven insights to help institutions make better academic
                and administrative decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 gap-10 items-cente " id="about-container">
        <div className="mt-[4rem] mr-[6rem]">
          <img src="https://cdn.pixabay.com/photo/2023/01/30/14/03/education-7755785_1280.png" className="h-[25rem]" />
        </div>
        <div className="mt-[5rem] mr-[5rem]" id="about-left ">
          <h1 className="font-[48px] font-bold text-[#2c3e50] mb-[20px]" id="about-title">Our Mission</h1>
          <p className="text-[18px] text-[#555] leading-[1.8] mb-[16px]" id="about-text">
            We aim to bridge the gap between traditional education and modern technology. Our platform provides a centralized system to streamline all academic processes, saving time for teachers and giving students and parents real-time access to information. By automating administrative tasks such as attendance tracking, grade management, and assignment submissions, we allow educators to focus on what truly matters: teaching and mentoring students
          </p>
          <p className="mt-[20px] font-normal text-[18px] text-[#1e88e5]" id="about-highlight">
            Where technology meets education.
          </p>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 gap-10 items-cente " id="about-container">
        <div className="mt-[5rem] mr-[5rem]" id="about-left ">
          <h1 className="font-[48px] font-bold text-[#2c3e50] mb-[20px]" id="about-title">What Sets Us Apart</h1>

          <p className="text-[18px] text-[#555] leading-[1.8] mb-[16px]" id="about-text">
            Unlike traditional education management systems, our platform integrates all academic processes in one centralized, user-friendly interface
          </p>
          <p className="text-[18px] text-[#555] leading-[1.8] mb-[16px]" id="about-text">
            We focus on real-time communication, giving students, parents, and teachers instant access to vital information without delays
          </p>
          <p className="mt-[20px] font-normal text-[18px] text-[#1e88e5]" id="about-highlight">
            Innovating education for a brighter tomorrow.
          </p>
        </div>
        <div className="mt-[4rem] ml-[6rem]">
          <img src="https://pngimg.com/uploads/student/student_PNG147.png" className="h-[25rem]" />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
