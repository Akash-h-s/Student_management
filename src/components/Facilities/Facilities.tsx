import React, { useState } from "react";
import type{ IconType } from "react-icons";
import { 
  FaVideo, 
  FaLaptop, 
  FaRobot, 
  FaComments, 
  FaBasketballBall, 
  FaSnowflake, 
  FaMobileAlt, 
  FaVideo as FaCctv, 
  FaBus, 
  FaBook 
} from "react-icons/fa";

interface HeaderContent {
  title: string;
  subtitle: string;
  highlightText: string;
  subtitleEnd: string;
}

interface Facility {
  id: number;
  Icon: IconType;
  title: string;
  desc: string;
  bgColor: string;
  iconColor: string;
}

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  highlightText: string;
  subtitleEnd: string;
}

interface FacilityCardProps {
  Icon: IconType;
  title: string;
  desc: string;
  bgColor: string;
  iconColor: string;
}

interface PopupProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

interface FacilitiesProps {
  facilities?: Facility[];
  headerContent?: HeaderContent;
}

const HEADER_CONTENT: HeaderContent = {
  title: "Facilities for Students",
  subtitle: "Supporting education through",
  highlightText: "benefits",
  subtitleEnd: "and resources",
};

const FACILITIES: Facility[] = [
  { 
    id: 1,
    Icon: FaVideo, 
    title: "Smart Classrooms", 
    desc: "Digital classrooms with projectors and interactive boards for enhanced learning.",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  { 
    id: 2,
    Icon: FaLaptop, 
    title: "Advanced Computer Labs", 
    desc: "Modern computer labs with the latest systems for programming and technology learning.",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600"
  },
  { 
    id: 3,
    Icon: FaRobot, 
    title: "Robotics & STEM Programs", 
    desc: "Hands-on robotics and STEM activities that promote innovation and problem-solving.",
    bgColor: "bg-green-100",
    iconColor: "text-green-600"
  },
  { 
    id: 4,
    Icon: FaComments, 
    title: "Spoken English & Personality Development", 
    desc: "Training to improve communication, confidence, and leadership skills.",
    bgColor: "bg-yellow-100",
    iconColor: "text-yellow-600"
  },
  { 
    id: 5,
    Icon: FaBasketballBall, 
    title: "Professional Sports Coaching", 
    desc: "Cricket, football, basketball, karate, and more trained by certified coaches.",
    bgColor: "bg-red-100",
    iconColor: "text-red-600"
  },
  { 
    id: 6,
    Icon: FaSnowflake, 
    title: "Air-Conditioned Classrooms", 
    desc: "Comfortable, air-conditioned classrooms for better learning during all seasons.",
    bgColor: "bg-cyan-100",
    iconColor: "text-cyan-600"
  },
  { 
    id: 7,
    Icon: FaMobileAlt, 
    title: "Digital Attendance & Parent App", 
    desc: "Mobile app for attendance, homework, announcements, and student progress tracking.",
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600"
  },
  { 
    id: 8,
    Icon: FaCctv, 
    title: "CCTV Security", 
    desc: "Full CCTV surveillance ensuring student safety throughout the campus.",
    bgColor: "bg-gray-100",
    iconColor: "text-gray-600"
  },
  { 
    id: 9,
    Icon: FaBus, 
    title: "School Transport with GPS", 
    desc: "Safe school buses with live GPS tracking for parents.",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600"
  },
  { 
    id: 10,
    Icon: FaBook, 
    title: "Library & Reading Programs", 
    desc: "A modern library with books, digital content, and weekly reading sessions.",
    bgColor: "bg-pink-100",
    iconColor: "text-pink-600"
  }
];

// Reusable Components
const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  highlightText, 
  subtitleEnd 
}) => (
  <div className="text-center mb-10">
    <h1 className="text-4xl text-white mb-1 font-semibold">{title}</h1>
    <p className="text-lg text-white">
      {subtitle}{" "}
      <span className="text-orange-500 font-bold">{highlightText}</span>{" "}
      {subtitleEnd}
    </p>
  </div>
);

const FacilityCard: React.FC<FacilityCardProps> = ({ 
  Icon, 
  title, 
  desc, 
  bgColor, 
  iconColor 
}) => (
  <div className="flex items-center gap-4 text-left cursor-pointer hover:scale-105 transition-transform">
    <div className={`w-16 h-16 ${bgColor} rounded-xl text-3xl flex items-center justify-center`}>
      <Icon className={iconColor} />
    </div>
    <div>
      <h3 className="text-xl text-white leading-none">{title}</h3>
      <p className="text-sm text-orange-200 mt-1 max-w-xs">{desc}</p>
    </div>
  </div>
);

const Popup: React.FC<PopupProps> = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-80 text-center animate-scale">
        <h3 className="text-lg font-medium text-gray-800">{message}</h3>
        <button
          onClick={onClose}
          className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main Component
const Facilities: React.FC<FacilitiesProps> = ({ 
  facilities = FACILITIES, 
  headerContent = HEADER_CONTENT 
}) => {
  const [popup, setPopup] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleClosePopup = () => setPopup(false);

  return (
    <div className="bg-slate-800 px-5 py-16 text-center font-akash">
      <SectionHeader
        title={headerContent.title}
        subtitle={headerContent.subtitle}
        highlightText={headerContent.highlightText}
        subtitleEnd={headerContent.subtitleEnd}
      />

      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16 max-w-3xl w-full">
          {facilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              Icon={facility.Icon}
              title={facility.title}
              desc={facility.desc}
              bgColor={facility.bgColor}
              iconColor={facility.iconColor}
            />
          ))}
        </div>
      </div>

      <Popup 
        isOpen={popup} 
        message={message} 
        onClose={handleClosePopup} 
      />
    </div>
  );
};

export default Facilities;