interface ImageColumnProps {
  images: string[];
  animationClass: string;
  alt: string;
}

interface ContentSectionProps {
  title: string;
  paragraphs: string[];
  highlight: string;
}

// Constants
const LEFT_COLUMN_IMAGES: string[] = [
  "https://raghavfoundation.org.in/wp-content/uploads/2023/05/school-image.jpg",
  "https://thumbs.dreamstime.com/z/young-college-students-reading-books-preparing-exam-sitting-campus-education-lifestyle-concept-266180359.jpg",
  "https://c8.alamy.com/comp/K6P2PJ/indian-school-students-and-teacher-laptop-studying-e-learning-in-classroom-K6P2PJ.jpg",
];

const RIGHT_COLUMN_IMAGES: string[] = [
  "https://c.stocksy.com/a/u5DA00/z9/2433618.jpg",
  "https://thumbs.dreamstime.com/z/teacher-use-holographic-display-teaching-student-futuristic-classroom-technology-innovation-education-concept-355545887.jpg",
  "https://tse2.mm.bing.net/th/id/OIP.e_0TI4WEyJZBseFohsMsBAHaE8",
];

const CONTENT = {
  title: "Why Smart Student Management System?",
  paragraphs: [
    "Manual record-keeping in schools leads to errors, delays, and communication gaps. Paper attendance and offline marks entry make the academic process inefficient.",
    "A Smart Student Management System automates attendance, marks, parent notifications, and progress tracking.",
  ],
  highlight: "Save time, improve accuracy, and empower everyone.",
};

const ANIMATIONS = `
  @keyframes scrollDown {
    0% { transform: translateY(-25%); }
    100% { transform: translateY(0); }
  }
  @keyframes scrollUp {
    0% { transform: translateY(0); }
    100% { transform: translateY(-25%); }
  }
  .animate-scrollDown {
    animation: scrollDown 10s linear infinite;
  }
  .animate-scrollUp {
    animation: scrollUp 10s linear infinite;
  }
`;

// Reusable Components
const ImageColumn = ({ images, animationClass, alt }: ImageColumnProps) => {
  const duplicatedImages = [...images, ...images];
  return (
    <div className={`flex flex-col gap-[1.5rem] max-[1023px]:gap-[1rem] max-[480px]:gap-[0.8rem] ${animationClass}`}>
      {duplicatedImages.map((src, idx) => (
        <img
          key={`${alt}-${idx}`}
          src={src}
          alt={`${alt} ${idx + 1}`}
          className="w-[320px] h-[200px] min-[1024px]:max-[1366px]:w-[220px] min-[1024px]:max-[1366px]:h-[150px] max-[1023px]:w-[240px] max-[1023px]:h-[160px] max-[768px]:w-[180px] max-[768px]:h-[130px] max-[480px]:w-[150px] max-[480px]:h-[110px] object-cover rounded-[16px] max-[480px]:rounded-[12px] shadow-[0_6px_16px_rgba(0,0,0,0.3)]"
        />
      ))}
    </div>
  );
};

const ContentSection = ({ title, paragraphs, highlight }: ContentSectionProps) => (
  <div className="w-[550px] min-[1024px]:max-[1366px]:w-[380px] max-[1023px]:w-full max-[1023px]:max-w-[500px] flex-shrink-0 max-[768px]:text-center">
    <h2 className="text-[2.8rem] min-[1024px]:max-[1366px]:text-[2rem] max-[768px]:text-[2rem] max-[480px]:text-[1.6rem] font-bold mb-[1rem] max-[480px]:mb-[0.8rem] text-white">
      {title}
    </h2>
    
    {paragraphs.map((paragraph, index) => (
      <p key={index} className="text-[1.2rem] min-[1024px]:max-[1366px]:text-[1rem] max-[768px]:text-[1rem] max-[480px]:text-[0.95rem] leading-[1.8] max-[480px]:leading-[1.6] text-[#e1e1e1] mb-[1rem] max-[480px]:mb-[0.8rem]">
        {paragraph}
      </p>
    ))}
    
    <p className="text-[1.6rem] min-[1024px]:max-[1366px]:text-[1.3rem] max-[768px]:text-[1.3rem] max-[480px]:text-[1.1rem] font-bold text-white">
      {highlight}
    </p>
  </div>
);

const ImageGallery = () => (
  <div className="flex gap-[2rem] min-[1024px]:max-[1366px]:gap-[1.2rem] max-[1023px]:gap-[1rem] max-[768px]:gap-[1rem] max-[480px]:gap-[0.8rem] h-[460px] min-[1024px]:max-[1366px]:h-[380px] max-[1023px]:h-[400px] max-[768px]:h-[350px] max-[480px]:h-[300px] w-[680px] min-[1024px]:max-[1366px]:w-[480px] max-[1023px]:w-full max-[1023px]:max-w-[500px] overflow-hidden flex-shrink-0">
    <ImageColumn
      images={LEFT_COLUMN_IMAGES}
      animationClass="animate-scrollDown"
      alt="student learning"
    />
    <ImageColumn
      images={RIGHT_COLUMN_IMAGES}
      animationClass="animate-scrollUp"
      alt="classroom technology"
    />
  </div>
);

// Main Component
const Need = () => {
  return (
    <section className="bg-[#0C2B4E] text-white">
      <div className="max-w-[1400px] mx-auto px-[5rem] min-[1024px]:max-[1366px]:px-[2rem] max-[1023px]:px-[2rem] max-[768px]:px-[2rem] max-[480px]:px-[1.5rem] py-[3rem]">
        <div className="flex flex-row max-[1023px]:flex-col items-center gap-[3rem] min-[1024px]:max-[1366px]:gap-[1.5rem] max-[1023px]:gap-[2rem] flex-nowrap">
          <ContentSection
            title={CONTENT.title}
            paragraphs={CONTENT.paragraphs}
            highlight={CONTENT.highlight}
          />
          <ImageGallery />
        </div>
      </div>
      <style>{ANIMATIONS}</style>
    </section>
  );
};

export default Need;