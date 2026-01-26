import React, { useState } from "react";

type UploadType = "student" | "teacher";

export default function Adminservices() {
  const [uploadType, setUploadType] = useState<UploadType | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentClass, setStudentClass] = useState("");
  const [studentSection, setStudentSection] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
      ];

      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert("Please select a PDF or Excel file");
        e.target.value = "";
      }
    }
  };

  const handleUpload = async () => {
   
    if (!selectedFile || !uploadType) {
      return alert("Please select a file and upload type");
    }

    if (uploadType === "student" && (!studentClass || !studentSection)) {
      return alert("Please provide Class and Section for student list");
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1];

       
        const res = await fetch("/api/hasura/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          
          body: JSON.stringify({
            type: uploadType,       
            class: studentClass.trim(),
            section: studentSection.trim(),
            filename: selectedFile.name,
            fileBase64: base64
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Server Error");
        }

        alert(`Upload Successful! ${uploadType} records processed.`);
        
        setSelectedFile(null);
        setStudentClass("");
        setStudentSection("");
        setUploadType("");

      } catch (err: any) {
        alert("Upload failed: " + err.message);
        console.error("Frontend Error:", err);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  return (
    <section className="flex flex-col items-center mt-12">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Admin Upload Portal</h2>

        <label className="block font-semibold text-gray-700 mb-2">Select Upload Category</label>
        <select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value as UploadType)}
          className="w-full p-2 mb-4 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">-- Choose Type --</option>
          <option value="student">Student List</option>
          <option value="teacher">Teacher List</option>
        </select>

    
        {uploadType === "student" && (
          <div className="mb-4 space-y-3 animate-fade-in">
            <input
              type="text"
              placeholder="Enter Class (e.g. 10)"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full p-2 mb-5 rounded border border-gray-300 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Enter Section (e.g. A)"
              value={studentSection}
              onChange={(e) => setStudentSection(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:border-blue-500 outline-none"
            />
          </div>
        ) }

        <label className="block font-semibold text-gray-700 mb-2">Choose File (Excel/PDF)</label>
        <input
          type="file"
          accept=".pdf, .xls, .xlsx"
          onChange={handleFileChange}
          className="w-full mb-4 p-2 border rounded bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        {selectedFile && (
          <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
            <p className="text-sm text-green-700">Ready: <strong>{selectedFile.name}</strong></p>
            <button
              onClick={() => setSelectedFile(null)}
              className="mt-2 text-xs text-red-600 underline"
            >
              Remove file
            </button>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading || !uploadType || !selectedFile}
          className={`w-full p-3 rounded font-bold transition-colors ${
            loading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          }`}
        >
          {loading ? "Processing..." : "Start Upload"}
        </button>
      </div>
    </section>
  );
}