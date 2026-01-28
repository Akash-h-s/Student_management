import React, { useState } from "react";

type UploadType = "student" | "teacher";

export default function Adminservices() {
  const [uploadType, setUploadType] = useState<UploadType | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentClass, setStudentClass] = useState("");
  const [studentSection, setStudentSection] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel"
      ) {
        setSelectedFile(file);
      } else {
        alert("Please select a PDF or Excel file");
        e.target.value = "";
      }
    }
  };

  const handleUpload = () => {
    if (!uploadType) return alert("Please select upload type");
    if (!selectedFile) return alert("No file selected");
    if (uploadType === "student" && (!studentClass || !studentSection))
      return alert("Please enter Class and Section for student list");

    alert(
      `${
        uploadType === "student"
          ? `Student List for Class ${studentClass}, Section ${studentSection}`
          : "Teacher List"
      } uploaded successfully!\nFile: ${selectedFile.name}`
    );

    // Reset fields
    setSelectedFile(null);
    setStudentClass("");
    setStudentSection("");
    setUploadType("");
  };

  return (
    <section className="flex flex-col items-center mt-12">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">Upload List</h2>

        {/* Upload Type Selector */}
        <label className="block font-semibold text-gray-700 mb-2">Select Type</label>
        <select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value as UploadType)}
          className="w-full p-2 mb-4 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Upload Type</option>
          <option value="student">Student List</option>
          <option value="teacher">Teacher List</option>
        </select>

        {/* Student Details */}
        {uploadType === "student" && (
          <div className="mb-4 space-y-3">
            <input
              type="text"
              placeholder="Class"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full p-2 rounded mb-5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Section"
              value={studentSection}
              onChange={(e) => setStudentSection(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* File Upload */}
        <input
          type="file"
          accept=".pdf, .xls, .xlsx"
          onChange={handleFileChange}
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Selected File Display */}
        {selectedFile && (
          <div className="mb-4 flex flex-col gap-2">
            <p className="text-gray-700">
              Selected file: <span className="font-medium">{selectedFile.name}</span>
            </p>
            <button
              onClick={() => setSelectedFile(null)}
              className="w-full p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
            >
              Change File
            </button>
          </div>
        )}

        <button
          onClick={handleUpload}
          className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Upload
        </button>
      </div>
    </section>
  );
}
