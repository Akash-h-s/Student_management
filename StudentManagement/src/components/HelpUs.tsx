import React from "react";

const guides = [
  {
    title: "Admin Guide Made Simple",
    description:
      "Register your institution and manage teachers, students, and parents efficiently with complete control and visibility.",
    steps: [
      "Register your admin account.",
      "Set up school details and departments.",
      "Manage user roles and permissions.",
      "Monitor platform usage and reports.",
    ],
    image:
      "https://admin.expatica.com/uk/wp-content/uploads/sites/10/1970/01/secondary-school-uk.jpg",
    bgColor: "bg-emerald-300",
  },
  {
    title: "Teacher Guide",
    description:
      "Teachers can access the platform to manage classes, assignments, and communicate with students and parents seamlessly.",
    steps: [
      "Login with your teacher account.",
      "Set up classes, subjects, and schedules.",
      "Assign homework and grades.",
      "Communicate with students and parents directly.",
    ],
    image: "https://c.stocksy.com/a/u5DA00/z9/2433618.jpg",
    bgColor: "bg-purple-500",
  },
  {
    title: "Student Guide",
    description:
      "Students can access their classes, assignments, and track their academic progress in a simple and intuitive way.",
    steps: [
      "Login with your student account.",
      "Access courses, assignments, and grades.",
      "Track attendance and performance reports.",
      "Communicate with teachers and classmates.",
    ],
    image:
      "https://epe.brightspotcdn.com/53/66/b17323e84e668e02e25d5b4a7a93/teacher-students-classroom.jpg",
    bgColor: "bg-green-400",
  },
  {
    title: "Parent Guide",
    description:
      "Parents can track their child’s progress, attendance, and receive real-time notifications from teachers and the school.",
    steps: [
      "Create a parent account.",
      "Link your child’s profile.",
      "Monitor attendance, grades, and assignments.",
      "Receive notifications and announcements.",
    ],
    image: "https://c.stocksy.com/a/u5DA00/z9/2433618.jpg",
    bgColor: "bg-blue-400",
  },
];

const HelpUs = () => {
  return (
    <section className="bg-slate-900 py-20 px-6 font-akash space-y-20">
      <div className="max-w-6xl mx-auto  space-y-20">
        {guides.map((guide, index) => {
          const isImageLeft = index % 2 !== 0; 

          return (
            <div
              key={index}
              className="flex flex-col md:flex-row mb-10 justify-between rounded-3xl overflow-hidden shadow-xl"
            >
              {isImageLeft && (
                <div className="md:w-1/2 h-full">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`${guide.bgColor} md:w-1/2 px-12 py-16 flex flex-col justify-center`}
              >
                <h2 className="text-3xl font-bold text-white mb-6">
                  {guide.title}
                </h2>
                <p className="text-white/90 text-lg leading-relaxed max-w-md">
                  {guide.description}
                </p>
                <ul className="mt-8 space-y-4 list-disc list-inside text-white">
                  {guide.steps.map((step, idx) => (
                    <li key={idx} className="text-lg leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {!isImageLeft && (
                <div className="md:w-1/2 h-full">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HelpUs;
