import React from "react";

const HelpUs = () => {
  return (
    <section className="bg-[#0C2B4E] py-20 px-5 font-akash">
      <div className="max-w-[1200px] mx-auto space-y-20">
        <div className="grid grid-cols-2 rounded-[32px] overflow-hidden shadow-lg md:grid-cols-1">
          <div className="bg-[#66bfa6] p-[3rem] text-white flex flex-col justify-center">
            <h2 className="text-left font-bold mb-6 text-[white]">
              Admin Guide Made Simple
            </h2>
            <p className="text-lg leading-[1.5] mb-6 opacity-90 text-[white] text-left">
              Register your institution and manage teachers, students,
              and parents efficiently with complete control and visibility.
            </p>
            <ul className="font-semibold text-left ml-[2rem] text-[1.25rem] leading-[2] text-lg text-[white]">
              <li >Register your admin account.</li>
              <li>Set up school details and departments.</li>
              <li>Manage user roles and permissions.</li>
              <li>Monitor platform usage and reports.</li>
            </ul>
          </div>
          <div className="h-full">
            <img
              src="https://admin.expatica.com/uk/wp-content/uploads/sites/10/1970/01/secondary-school-uk.jpg"
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto space-y-20">
        <div className="grid grid-cols-2 rounded-[32px] overflow-hidden shadow-lg md:grid-cols-1 mt-[30px]">
          <div className="h-full">
            <img
              src="https://c.stocksy.com/a/u5DA00/z9/2433618.jpg"
              alt="Teacher"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-[#C47BE4] p-[3rem] text-white flex flex-col justify-center">
            <h2 className="text-left font-bold mb-6 text-[white]">
              Teacher Guide
            </h2>
            <p className="text-lg leading-[1.5] mb-6 opacity-90 text-[white] text-left">
              Teachers can access the platform to manage classes, assignments, and communicate with students and parents seamlessly.
            </p>
            <ul className="font-semibold text-left ml-[2rem] text-[1.25rem] leading-[2] text-lg text-[white]">
              <li>Login with your teacher account.</li>
              <li>Set up classes, subjects, and schedules.</li> 
              <li>Assign homework and grades.</li> 
              <li>Communicate with students and parents directly.</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto space-y-20">
        <div className="grid grid-cols-2 rounded-[32px] overflow-hidden shadow-lg md:grid-cols-1 mt-[30px]">
          <div className="bg-[#ABE7B2] p-[3rem] text-white flex flex-col justify-center">
            <h2 className="text-left font-bold mb-6 text-[white]">
              Student Guide
            </h2>
            <p className="text-lg leading-[1.5] mb-6 opacity-90 text-[white] text-left">
             Students can access their classes, assignments, and track their academic progress in a simple and intuitive way.
            </p>

            <ul className="font-semibold text-left ml-[2rem] text-[1.25rem] leading-[2] text-lg text-[white]">
             <li>Login with your student account.</li>
             <li>Access courses, assignments, and grades.</li>
             <li>Track attendance and performance reports.</li>
             <li>Communicate with teachers and classmates.</li>
            </ul>

          </div>
          <div className="h-full">
            <img
              src="https://epe.brightspotcdn.com/53/66/b17323e84e668e02e25d5b4a7a93/teacher-students-classroom.jpg"
              alt="Student"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto space-y-20">
        <div className="grid grid-cols-2 rounded-[32px] overflow-hidden shadow-lg md:grid-cols-1 mt-[30px]">
          <div className="h-full">
            <img
              src="https://c.stocksy.com/a/u5DA00/z9/2433618.jpg"
              alt="Teacher"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-[#AEDEFC] p-[3rem] text-white flex flex-col justify-center">
            <h2 className="text-left font-bold mb-6 text-[white]">
              Parents Guide
            </h2>
            <p className="text-lg leading-[1.5] mb-6 opacity-90 text-[white] text-left">
            Parents can track their child’s progress, attendance, and receive real-time notifications from teachers and the school.
            </p>
            <ul className="font-semibold text-left ml-[2rem] text-[1.25rem] leading-[2] text-lg text-[white]">
              <li>Create a parent account.</li> 
              <li>Link your child’s profile.</li> 
              <li>Monitor attendance, grades, and assignments.</li> 
              <li>Receive notifications and announcements.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpUs;
