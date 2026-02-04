import React from "react";

// Type Definitions
interface Guide {
  id: number;
  title: string;
  description: string;
  steps: string[];
  image: string;
  imageAlt: string;
  bgColor: string;
}

interface GuideCardProps {
  guide: Guide;
  isImageLeft: boolean;
}

interface GuideContentProps {
  title: string;
  description: string;
  steps: string[];
  bgColor: string;
}

interface GuideImageProps {
  src: string;
  alt: string;
}

interface HelpUsProps {
  guides?: Guide[];
}

// Constants
const DEFAULT_GUIDES: Guide[] = [
  {
    id: 1,
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
    imageAlt: "Admin managing school dashboard",
    bgColor: "bg-emerald-300",
  },
  {
    id: 2,
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
    imageAlt: "Teacher in classroom",
    bgColor: "bg-purple-500",
  },
  {
    id: 3,
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
    imageAlt: "Students learning in classroom",
    bgColor: "bg-green-400",
  },
  {
    id: 4,
    title: "Parent Guide",
    description:
      "Parents can track their child's progress, attendance, and receive real-time notifications from teachers and the school.",
    steps: [
      "Create a parent account.",
      "Link your child's profile.",
      "Monitor attendance, grades, and assignments.",
      "Receive notifications and announcements.",
    ],
    image: "https://c.stocksy.com/a/u5DA00/z9/2433618.jpg",
    imageAlt: "Parent reviewing child's progress",
    bgColor: "bg-blue-400",
  },
];

// Reusable Components (WITHOUT React.FC - Modern Approach)
const GuideImage = ({ src, alt }: GuideImageProps) => (
  <div className="md:w-1/2">
    <img src={src} alt={alt} className="w-full h-full object-cover min-h-[500px]" />
  </div>
);

const GuideContent = ({ title, description, steps, bgColor }: GuideContentProps) => (
  <div className={`${bgColor} md:w-1/2 px-12 py-16 flex flex-col justify-center min-h-[500px]`}>
    <h2 className="text-3xl font-bold text-white mb-6">{title}</h2>
    <p className="text-white/90 text-lg leading-relaxed max-w-md">
      {description}
    </p>
    <ul className="mt-8 space-y-4 list-disc list-inside text-white">
      {steps.map((step, idx) => (
        <li key={idx} className="text-lg leading-relaxed">
          {step}
        </li>
      ))}
    </ul>
  </div>
);

const GuideCard = ({ guide, isImageLeft }: GuideCardProps) => (
  <div className="flex flex-col md:flex-row mb-10 justify-between rounded-3xl overflow-hidden shadow-xl">
    {isImageLeft && <GuideImage src={guide.image} alt={guide.imageAlt} />}
    
    <GuideContent
      title={guide.title}
      description={guide.description}
      steps={guide.steps}
      bgColor={guide.bgColor}
    />
    
    {!isImageLeft && <GuideImage src={guide.image} alt={guide.imageAlt} />}
  </div>
);

// Main Component
const HelpUs = ({ guides = DEFAULT_GUIDES }: HelpUsProps) => {
  return (
    <section className="bg-slate-900 py-20 px-6 font-akash space-y-20">
      <div className="max-w-6xl mx-auto space-y-20">
        {guides.map((guide, index) => {
          const isImageLeft = index % 2 !== 0;

          return (
            <GuideCard 
              key={guide.id} 
              guide={guide} 
              isImageLeft={isImageLeft} 
            />
          );
        })}
      </div>
    </section>
  );
};

export default HelpUs;