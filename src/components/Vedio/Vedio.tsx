
import background from "../../assets/background1.mp4";

const DEFAULT_CONTENT = {
  title: "Welcome to EduCloud",
  subtitle: "Smart Student Management System",
  videoSrc: background,
};

const Vedio = ({ 
  videoSrc = DEFAULT_CONTENT.videoSrc,
  title = DEFAULT_CONTENT.title,
  subtitle = DEFAULT_CONTENT.subtitle,
  titleClassName = "text-6xl font-bold text-yellow-400",
  subtitleClassName = "text-2xl mt-4",
}) => {
  return (
    <div className="relative w-full min-h-screen flex justify-center items-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src={videoSrc}
        className="absolute w-full h-full object-cover"
      >
        Your browser does not support the video tag.
      </video>
      <div className="relative text-center text-white">
        <h1 className={titleClassName}>{title}</h1>
        <p className={subtitleClassName}>{subtitle}</p>
      </div>
    </div>
  );
};

export default Vedio;