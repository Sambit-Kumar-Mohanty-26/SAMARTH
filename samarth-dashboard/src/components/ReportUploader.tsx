// src/components/ReportUploader.tsx
import { useState } from "react";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { UploadCloud, File, Loader, CheckCircle, AlertTriangle } from "lucide-react";

export default function ReportUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Upload a CSV or Excel report to see the dashboard update in real-time.");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Basic validation for file type
      const allowedTypes = [
        "text/csv", 
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel" // .xls
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setStatus("error");
        setMessage("Invalid file type. Please upload a CSV or Excel file.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setStatus("idle");
      setMessage(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setMessage(`Uploading ${file.name}...`);

    try {
      const storage = getStorage();
      // To prevent filename collisions, append a timestamp
      const uniqueFileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `incoming_reports/${uniqueFileName}`);

      await uploadBytes(storageRef, file);

      setStatus("success");
      setMessage(`Success! Your file has been submitted for processing. The dashboard will update shortly.`);
      // Reset the component state after a delay
      setTimeout(() => {
        setStatus("idle");
        setMessage("Upload another CSV or Excel report.");
      }, 5000);
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatus("error");
      setMessage("Upload failed. Please check the console and try again.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        <UploadCloud className="inline-block w-6 h-6 mr-2 text-blue-500" />
        Live Data Upload
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Upload a "Good Work Done" report here. The system will automatically process the file and update the dashboard statistics in near real-time.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <label className="flex-1 block w-full">
          <span className="sr-only">Choose file</span>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv, .xlsx, .xls"
            className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800/50 cursor-pointer"
          />
        </label>
        <button
          onClick={handleUpload}
          disabled={!file || status === "uploading"}
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors duration-200"
        >
          {status === "uploading" ? (
            <Loader className="animate-spin w-5 h-5" />
          ) : (
            <UploadCloud className="w-5 h-5" />
          )}
          {status === 'uploading' ? 'Uploading...' : 'Submit Report'}
        </button>
      </div>
      
      {/* Status Message */}
      <div className="mt-4 text-sm text-center h-5">
        {status === "success" && <p className="text-green-600 flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> {message}</p>}
        {status === "error" && <p className="text-red-500 flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5" /> {message}</p>}
        {status === "idle" && file && <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2"><File className="w-5 h-5" /> Ready to upload: {file.name}</p>}
      </div>
    </div>
  );
}