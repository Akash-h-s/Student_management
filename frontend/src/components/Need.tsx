
 import React from "react";

const leftColumnImages = [
  "https://raghavfoundation.org.in/wp-content/uploads/2023/05/school-image.jpg",
  "https://thumbs.dreamstime.com/z/young-college-students-reading-books-preparing-exam-sitting-campus-education-lifestyle-concept-266180359.jpg",
  "https://c8.alamy.com/comp/K6P2PJ/indian-school-students-and-teacher-laptop-studying-e-learning-in-classroom-K6P2PJ.jpg",
];

const rightColumnImages = [
  "https://c.stocksy.com/a/u5DA00/z9/2433618.jpg",
  "https://thumbs.dreamstime.com/z/teacher-use-holographic-display-teaching-student-futuristic-classroom-technology-innovation-education-concept-355545887.jpg",
  "https://tse2.mm.bing.net/th/id/OIP.e_0TI4WEyJZBseFohsMsBAHaE8",
];

const Need: React.FC = () => {
  return (
    <section className="bg-[#0C2B4E] text-white">
      <div className="max-w-[1400px] mx-auto px-[5rem] py-[3rem]">
        <div className="flex flex-row items-center gap-[3rem] flex-nowrap">
          <div className="w-[550px] flex-shrink-0">
            <h2 className="text-[2.8rem] font-bold mb-[1rem] text-[white]">
              Why Smart Student Management System?
            </h2>

            <p className="text-[1.2rem] leading-[1.8] text-[#e1e1e1] mb-[1rem]">
              Manual record-keeping in schools leads to errors, delays, and
              communication gaps. Paper attendance and offline marks entry
              make the academic process inefficient.
            </p>

            <p className="text-[1.2rem] leading-[1.8] text-[#e1e1e1] mb-[1rem] ">
              A Smart Student Management System automates attendance, marks,
              parent notifications, and progress tracking.
            </p>

            <p className="text-[1.6rem] font-bold text-[white]">
              Save time, improve accuracy, and empower everyone.
            </p>
          </div>
          <div className="flex gap-[2rem] h-[460px] w-[680px] overflow-hidden flex-shrink-0">
            <div className="flex flex-col gap-[1.5rem] animate-scrollDown">
              {[...leftColumnImages, ...leftColumnImages].map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="student"
                  className="w-[320px] h-[200px] object-cover rounded-[16px]
                  shadow-[0_6px_16px_rgba(0,0,0,0.3)]"
                />
              ))}
            </div>
            <div className="flex flex-col gap-[1.5rem] animate-scrollUp">
              {[...rightColumnImages, ...rightColumnImages].map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="student"
                  className="w-[320px] h-[200px] object-cover rounded-[16px]
                  shadow-[0_6px_16px_rgba(0,0,0,0.3)]"
                />
              ))}
            </div>

          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes scrollDown {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
          }

          @keyframes scrollUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }

          .animate-scrollDown {
            animation: scrollDown 16s linear infinite;
          }

          .animate-scrollUp {
            animation: scrollUp 16s linear infinite;
          }
        `}
      </style>
    </section>
  );
};

export default Need;
