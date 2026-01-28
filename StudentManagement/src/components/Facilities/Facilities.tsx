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


  return (
    <div className="bg-slate-800 px-5 py-16 text-center font-akash">
      <h1 className="text-4xl text-white mb-1 font-semibold">
        Facilities for Students
      </h1>

      <p className="text-lg text-white mb-10">
        Supporting education through{" "}
        <span className="text-orange-500 font-bold">benefits</span> and resources
      </p>

      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-y-10 gap-x-16 max-w-3xl w-full">
          {facilities.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 text-left cursor-pointer"
            >
              <div className="w-16 h-16 bg-gray-300 rounded-xl text-3xl flex items-center justify-center">
                {item.icon}
              </div>

              <div>
                <h3 className="text-xl text-white leading-none">
                  {item.title}
                </h3>
                <p className="text-sm text-orange-200 mt-1 max-w-xs">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {popup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 text-center animate-scale">
            <h3 className="text-lg font-medium">{message}</h3>
            <button
              onClick={() => setPopup(false)}
              className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Facilities;
