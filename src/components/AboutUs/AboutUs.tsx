import React from "react";
import type{ IconType } from "react-icons";
import { FaGraduationCap, FaChalkboardTeacher, FaUserFriends, FaChartLine } from "react-icons/fa";

interface AboutIntro {
  heading: string;
  paragraphs: string[];
  tagline: string;
}

interface Feature {
  id: number;
  Icon: IconType;
  title: string;
  text: string;
}

interface InfoSection {
  id: number;
  heading: string;
  paragraphs: string[];
  tagline: string;
  image: string;
  imageAlt: string;
  imagePosition: "left" | "right";
}

interface FeatureCardProps {
  Icon: IconType;
  title: string;
  text: string;
}

interface TextContentProps {
  heading: string;
  paragraphs: string[];
  tagline: string;
  className?: string;
}

interface ImageTextSectionProps {
  heading: string;
  paragraphs: string[];
  tagline: string;
  image: string;
  imageAlt: string;
  imagePosition: "left" | "right";
}


const ABOUT_INTRO: AboutIntro = {
  heading: "About Us",
  paragraphs: [
    "Our Student Management System is designed to simplify and modernize academic administration. We help institutions manage students, teachers, parents, and academic data efficiently using secure and scalable technology.",
    "From attendance tracking to performance monitoring, our platform ensures transparency, accuracy, and seamless communication between students, parents, and educators.",
  ],
  tagline: "We believe technology should empower education — not complicate it.",
};

const FEATURES: Feature[] = [
  {
    id: 1,
    Icon: FaGraduationCap,
    title: "Student Support",
    text: "Centralized student records, attendance tracking, and academic performance monitoring.",
  },
  {
    id: 2,
    Icon: FaChalkboardTeacher,
    title: "Teacher Management",
    text: "Tools for managing classes, assignments, grading, and student evaluations.",
  },
  {
    id: 3,
    Icon: FaUserFriends,
    title: "Parent Access",
    text: "Real-time updates on attendance, results, and announcements to keep parents informed.",
  },
  {
    id: 4,
    Icon: FaChartLine,
    title: "Smart Analytics",
    text: "Data-driven insights to help institutions make better academic and administrative decisions.",
  },
];

const INFO_SECTIONS: InfoSection[] = [
  {
    id: 1,
    heading: "Our Mission",
    paragraphs: [
      "We aim to bridge the gap between traditional education and modern technology. Our platform provides a centralized system to streamline all academic processes, saving time for teachers and giving students and parents real-time access to information.",
    ],
    tagline: "Where technology meets education.",
    image: "https://cdn.pixabay.com/photo/2023/01/30/14/03/education-7755785_1280.png",
    imageAlt: "Education illustration",
    imagePosition: "left",
  },
  {
    id: 2,
    heading: "What Sets Us Apart",
    paragraphs: [
      "Unlike traditional education management systems, our platform integrates all academic processes in one centralized, user-friendly interface.",
      "We focus on real-time communication, giving students, parents, and teachers instant access to vital information without delays.",
    ],
    tagline: "Innovating education for a brighter tomorrow.",
    image: "https://pngimg.com/uploads/student/student_PNG147.png",
    imageAlt: "Student illustration",
    imagePosition: "right",
  },
];


const FeatureCard: React.FC<FeatureCardProps> = ({ Icon, title, text }) => (
  <div className="bg-white flex flex-col sm:flex-row gap-3 sm:gap-5 p-4 sm:p-6 items-start shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 rounded-lg">
    <div className="bg-blue-100 text-blue-600 text-xl sm:text-2xl w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
      <Icon />
    </div>
    <div className="min-w-0">
      <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{text}</p>
    </div>
  </div>
);

const TextContent: React.FC<TextContentProps> = ({ heading, paragraphs, tagline, className = "" }) => (
  <div className={className}>
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-3 sm:mb-5">{heading}</h1>
    {paragraphs.map((paragraph, index) => (
      <p key={index} className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-3 sm:mb-4">
        {paragraph}
      </p>
    ))}
    <p className="mt-3 sm:mt-5 text-blue-600 text-base sm:text-lg font-medium">{tagline}</p>
  </div>
);

const ImageTextSection: React.FC<ImageTextSectionProps> = ({ 
  heading, 
  paragraphs, 
  tagline, 
  image, 
  imageAlt, 
  imagePosition 
}) => {
  const ImageComponent = (
    <div className={`flex justify-center md:justify-${imagePosition === "left" ? "start" : "end"}`}>
      <img src={image} alt={imageAlt} className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto rounded-lg" />
    </div>
  );

  const TextComponent = (
    <TextContent
      heading={heading}
      paragraphs={paragraphs}
      tagline={tagline}
      className="text-center md:text-left"
    />
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center mt-12 md:mt-24">
      {imagePosition === "left" ? (
        <>
          {ImageComponent}
          {TextComponent}
        </>
      ) : (
        <>
          {TextComponent}
          {ImageComponent}
        </>
      )}
    </div>
  );
};


const AboutUs=() => {
  return (
    <section className="bg-gray-100 py-10 sm:py-16 md:py-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
        <div className="text-center md:text-left">
          <TextContent
            heading={ABOUT_INTRO.heading}
            paragraphs={ABOUT_INTRO.paragraphs}
            tagline={ABOUT_INTRO.tagline}
          />
        </div>
        <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              Icon={feature.Icon}
              title={feature.title}
              text={feature.text}
            />
          ))}
        </div>
      </div>
      {INFO_SECTIONS.map((section) => (
        <ImageTextSection
          key={section.id}
          heading={section.heading}
          paragraphs={section.paragraphs}
          tagline={section.tagline}
          image={section.image}
          imageAlt={section.imageAlt}
          imagePosition={section.imagePosition}
        />
      ))}
    </section>
  );
};

export default AboutUs;