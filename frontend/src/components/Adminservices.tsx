import React, { useState } from "react";
import { AiOutlineFilePdf, AiOutlineFileExcel } from "react-icons/ai";

export default function FileUpload() {
  const [studentFiles, setStudentFiles] = useState<File[]>([]);
  const [teacherFiles, setTeacherFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "student" | "teacher") => {
    if (e.target.files?.length) {
      const filesArray = Array.from(e.target.files);
      if (type === "student") setStudentFiles((prev) => [...prev, ...filesArray]);
      else setTeacherFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (file: File, type: "student" | "teacher") => {
    if (type === "student") setStudentFiles(studentFiles.filter((f) => f !== file));
    else setTeacherFiles(teacherFiles.filter((f) => f !== file));
  };

  const renderFiles = (files: File[], type: "student" | "teacher") =>
    files.map((file, idx) => (
      <div
        key={idx}
        className="flex items-center justify-between p-3 border border-gray-200 rounded-md mb-2 shadow-sm hover:shadow-md transition"
      >
        <div className="flex items-center gap-3">
          {file.name.endsWith(".pdf") ? (
            <AiOutlineFilePdf className="text-red-500 text-3xl" />
          ) : (
            <AiOutlineFileExcel className="text-green-500 text-3xl" />
          )}
          <p className="text-gray-700 font-medium">{file.name}</p>
        </div>
        <button
          className="text-gray-400 hover:text-red-500 font-semibold"
          onClick={() => removeFile(file, type)}
        >
          Remove
        </button>
      </div>
    ));

  const FileContainer = ({
    title,
    files,
    type,
    color,
  }: {
    title: string;
    files: File[];
    type: "student" | "teacher";
    color: string;
  }) => (
    <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
      <input
        type="file"
        accept=".pdf,.xls,.xlsx"
        multiple
        onChange={(e) => handleFileChange(e, type)}
        className={`mb-4 cursor-pointer border border-${color}-400 text-${color}-600 px-4 py-2 rounded-md hover:bg-${color}-50 transition`}
      />
      <div className="mt-4">{renderFiles(files, type)}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-12 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-12">Upload Your Lists</h1>

      <FileContainer title="Student List" files={studentFiles} type="student" color="blue" />
      <FileContainer title="Teacher List" files={teacherFiles} type="teacher" color="green" />
    </div>
  );
}
