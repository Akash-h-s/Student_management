import React from "react";
import type{ IconType } from "react-icons";
import { FaGraduationCap, FaChalkboardTeacher, FaUserFriends, FaChartLine } from "react-icons/fa";

// Type Definitions
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

// Constants
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

// Reusable Components
const FeatureCard: React.FC<FeatureCardProps> = ({ Icon, title, text }) => (
  <div className="bg-white flex gap-5 p-6 items-start shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
    <div className="bg-blue-100 text-blue-600 text-2xl w-14 h-14 rounded-xl flex items-center justify-center mt-2">
      <Icon />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{text}</p>
    </div>
  </div>
);

const TextContent: React.FC<TextContentProps> = ({ heading, paragraphs, tagline, className = "" }) => (
  <div className={className}>
    <h1 className="text-4xl font-bold text-slate-800 mb-5">{heading}</h1>
    {paragraphs.map((paragraph, index) => (
      <p key={index} className="text-lg text-gray-600 leading-relaxed mb-4">
        {paragraph}
      </p>
    ))}
    <p className="mt-5 text-blue-600 text-lg">{tagline}</p>
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
    <div className={imagePosition === "left" ? "mt-16 mr-24" : "mt-16 ml-24"}>
      <img src={image} alt={imageAlt} className="h-96" />
    </div>
  );

  const TextComponent = (
    <TextContent
      heading={heading}
      paragraphs={paragraphs}
      tagline={tagline}
      className="mt-20 mr-20"
    />
  );

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-2 gap-10 items-center mt-24">
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

// Main Component
const AboutUs=() => {
  return (
    <section className="bg-gray-100 py-20 px-2">
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center ml-24">
        <TextContent
          heading={ABOUT_INTRO.heading}
          paragraphs={ABOUT_INTRO.paragraphs}
          tagline={ABOUT_INTRO.tagline}
          className="mt-4 mr-20"
        />
        <div className="flex flex-col gap-6">
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