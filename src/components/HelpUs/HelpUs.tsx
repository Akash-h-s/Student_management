
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
    title: "Admin: Institutional Control",
    description:
      "Take full command of your institution's data. Use the Bulk Upload portal to onboard students and teachers in seconds using Excel or PDF files.",
    steps: [
      "Access the Admin Upload portal.",
      "Select 'Student' or 'Teacher' upload type.",
      "Upload your Excel/PDF and watch real-time Temporal processing.",
      "Credentials are automatically emailed to all registered users.",
    ],
    image:
      "https://admin.expatica.com/uk/wp-content/uploads/sites/10/1970/01/secondary-school-uk.jpg",
    imageAlt: "Admin managing school dashboard",
    bgColor: "bg-emerald-300",
  },
  {
    id: 2,
    title: "Must & Should: Data Rules",
    description:
      "To ensure zero errors during bulk uploads, your data files must strictly follow these mandatory and optional guidelines.",
    steps: [
      "MUST: Include full name and a unique email for every user.",
      "MUST: Provide Class and Section for student list uploads.",
      "MUST: Use a valid parent email to link students automatically.",
      "SHOULD: Include phone numbers for future SMS/WhatsApp alerts.",
      "FORMAT: Your files should be .xlsx, .xls, or .pdf format only.",
    ],
    image: "https://admin.expatica.com/uk/wp-content/uploads/sites/10/1970/01/secondary-school-uk.jpg",
    imageAlt: "Admin reviewing data requirements",
    bgColor: "bg-red-500",
  },
  {
    id: 3,
    title: "Teacher: Academic Management",
    description:
      "Simplify your classroom administration. Enter marks, manage subjects, and stay connected with your students through built-in messaging.",
    steps: [
      "Enter and manage student marks for your assigned subjects.",
      "Communicate directly with students through the secure chat.",
      "Create and manage student groups for collaborative learning.",
      "View your class performance through intuitive data grids.",
    ],
    image: "https://c.stocksy.com/a/u5DA00/z9/2433618.jpg",
    imageAlt: "Teacher in classroom",
    bgColor: "bg-purple-500",
  },
  {
    id: 4,
    title: "Student & Parent: Progress Tracking",
    description:
      "Stay informed and engaged. Students can track their academic growth, while parents get real-time visibility into their child's performance.",
    steps: [
      "View live marks and download progress cards instantly.",
      "Students can chat with teachers to clarify doubts.",
      "Parents receive instant updates on children's academic status.",
      "Access school-wide announcements through the global dashboard.",
    ],
    image:
      "https://epe.brightspotcdn.com/53/66/b17323e84e668e02e25d5b4a7a93/teacher-students-classroom.jpg",
    imageAlt: "Students learning in classroom",
    bgColor: "bg-blue-400",
  },
];

// Reusable Components (WITHOUT React.FC - Modern Approach)
const GuideImage = ({ src, alt }: GuideImageProps) => (
  <div className="w-full md:w-1/2 h-64 sm:h-80 md:h-auto md:min-h-[300px] lg:min-h-[500px]">
    <img src={src} alt={alt} className="w-full h-full object-cover" />
  </div>
);

const GuideContent = ({ title, description, steps, bgColor }: GuideContentProps) => (
  <div className={`${bgColor} w-full md:w-1/2 px-4 sm:px-8 md:px-12 py-8 sm:py-12 md:py-16 flex flex-col justify-center min-h-64 sm:min-h-80 md:min-h-[300px] lg:min-h-[500px]`}>
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-6">{title}</h2>
    <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed">
      {description}
    </p>
    <ul className="mt-4 sm:mt-6 md:mt-8 space-y-2 sm:space-y-3 md:space-y-4 list-disc list-inside text-white">
      {steps.map((step, idx) => (
        <li key={idx} className="text-sm sm:text-base md:text-lg leading-relaxed">
          {step}
        </li>
      ))}
    </ul>
  </div>
);

const GuideCard = ({ guide, isImageLeft }: GuideCardProps) => (
  <div className="flex flex-col md:flex-row mb-8 sm:mb-10 justify-between rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl">
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
    <section className="bg-slate-900 py-12 sm:py-16 md:py-20 px-4 sm:px-6 font-akash space-y-8 sm:space-y-12 md:space-y-20">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 md:space-y-20">
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