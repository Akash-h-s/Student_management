import React, { useState } from "react";

function Facilities() {
  const [popup, setPopup] = useState(false);
  const [message, setMessage] = useState("");

  const facilities = [
    { icon: "🎥", title: "Smart Classrooms", desc: "Digital classrooms with projectors and interactive boards for enhanced learning." },
    { icon: "🖥️", title: "Advanced Computer Labs", desc: "Modern computer labs with the latest systems for programming and technology learning." },
    { icon: "🤖", title: "Robotics & STEM Programs", desc: "Hands-on robotics and STEM activities that promote innovation and problem-solving." },
    { icon: "🗣️", title: "Spoken English & Personality Development", desc: "Training to improve communication, confidence, and leadership skills." },
    { icon: "🏏", title: "Professional Sports Coaching", desc: "Cricket, football, basketball, karate, and more trained by certified coaches." },
    { icon: "❄️", title: "Air-Conditioned Classrooms", desc: "Comfortable, air-conditioned classrooms for better learning during all seasons." },
    { icon: "📱", title: "Digital Attendance & Parent App", desc: "Mobile app for attendance, homework, announcements, and student progress tracking." },
    { icon: "🎥", title: "CCTV Security", desc: "Full CCTV surveillance ensuring student safety throughout the campus." },
    { icon: "🚌", title: "School Transport with GPS", desc: "Safe school buses with live GPS tracking for parents." },
    { icon: "📖", title: "Library & Reading Programs", desc: "A modern library with books, digital content, and weekly reading sessions." }
  ];

  const handleClick = () => {
    const user = localStorage.getItem("user");
    setMessage(user ? "Access Granted!" : "You need to login to access this facility.");
    setPopup(true);
  };

  return (
    <div className="bg-[#0C2B4E] px-[20px] py-[60px] text-center font-akash">
      <h1 className="text-[40px] !text-[white] mb-[5px] font-semibold">
        Facilities for Students
      </h1>

      <p className="text-[18px] text-[white] mb-[40px]">
        Supporting education through{" "}
        <span className="text-[#e67e22] font-bold">benefits</span> and resources
      </p>
      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-y-[40px] gap-x-[60px] max-w-[900px] w-full">
          {facilities.map((item, i) => (
            <div
              key={i}
              onClick={handleClick}
              className="flex items-center gap-[15px] text-left cursor-pointer"
            >
              <div className="w-[65px] h-[65px] bg-[#ddd] rounded-[12px] text-[30px] flex items-center justify-center">
                {item.icon}
              </div>

              <div>
                <h3 className="text-[20px] text-[white] leading-none">
                  {item.title}
                </h3>
                <p className="text-[14px] text-[bisque] mt-[3px] max-w-[300px]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {popup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999]">
          <div className="bg-white p-[25px] rounded-[10px] w-[350px] text-center animate-popup">
            <h3>{message}</h3>
            <button
              onClick={() => setPopup(false)}
              className="mt-[15px] px-[18px] py-[10px] bg-[#0C2B4E] text-white rounded-[6px] hover:bg-[#0a203b]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes popupAnim {
            from { transform: scale(0.7); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-popup {
            animation: popupAnim 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
}

export default Facilities;
