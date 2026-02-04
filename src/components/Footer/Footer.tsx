import React from "react";

// Type Definitions
interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

interface ContactItem {
  label: string;
  value: string;
}

interface FooterProps {
  services?: string[];
  aboutText?: string;
  contactInfo?: ContactInfo;
  companyName?: string;
}

// Constants
const DEFAULT_SERVICES: string[] = [
  "Student Management",
  "Teacher & Staff Management",
  "Attendance Tracking",
  "Exam & Result Management",
  "Parent Notifications",
];

const DEFAULT_ABOUT_TEXT: string = 
  "EduCloud Smart Management System is designed to simplify school, student, and teacher management with intelligent solutions for modern education.";

const DEFAULT_CONTACT_INFO: ContactInfo = {
  email: "support@educloud.com",
  phone: "+91 6360434523",
  address: "EduCloud St, Bengaluru, India",
};

const DEFAULT_COMPANY_NAME: string = "EduCloud Smart Management System";

// Reusable Components
const FooterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ 
  title, 
  children 
}) => (
  <div className="flex-1 min-w-[250px] flex flex-col items-center">
    <h3 className="text-lg mb-4 text-yellow-400 font-bold">{title}</h3>
    {children}
  </div>
);

const ServicesList: React.FC<{ services: string[] }> = ({ services }) => (
  <ul className="list-none p-0 m-0 text-left">
    {services.map((service, index) => (
      <li key={index} className="text-sm leading-6 mb-2">
        {service}
      </li>
    ))}
  </ul>
);

const ContactDetails: React.FC<{ contactInfo: ContactInfo }> = ({ contactInfo }) => {
  const contactItems: ContactItem[] = [
    { label: "Email", value: contactInfo.email },
    { label: "Phone", value: contactInfo.phone },
    { label: "Address", value: contactInfo.address },
  ];

  return (
    <div className="text-left">
      {contactItems.map((item, index) => (
        <p key={index} className="text-sm leading-6">
          {item.label}: {item.value}
        </p>
      ))}
    </div>
  );
};

const Copyright: React.FC<{ companyName: string }> = ({ companyName }) => (
  <div className="text-center mt-8 text-sm text-gray-400 border-t border-gray-700 pt-4">
    <p>
      &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
    </p>
  </div>
);

// Main Component
const Footer = ({
  services = DEFAULT_SERVICES,
  aboutText = DEFAULT_ABOUT_TEXT,
  contactInfo = DEFAULT_CONTACT_INFO,
  companyName = DEFAULT_COMPANY_NAME,
}) => {
  return (
    <footer className="bg-slate-800 text-gray-100 pt-10 px-5 font-sans">
      <div className="flex flex-wrap justify-center text-center gap-5 max-w-6xl mx-auto">
        
        {/* About Section */}
        <FooterSection title="About Us">
          <p className="text-sm leading-6 max-w-xs text-left">
            {aboutText}
          </p>
        </FooterSection>

        {/* Services Section */}
        <FooterSection title="Services">
          <ServicesList services={services} />
        </FooterSection>

        {/* Contact Section */}
        <FooterSection title="Contact Info">
          <ContactDetails contactInfo={contactInfo} />
        </FooterSection>

      </div>

      <Copyright companyName={companyName} />
    </footer>
  );
};

export default Footer;