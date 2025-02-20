import React from "react";

export default function PDFContent({ pdfFileId, onNext }) {
  if (!pdfFileId) {
    return <div className="text-red-500 text-xl">PDF not found.</div>;
  }

  const pdfUrl = `${import.meta.env.VITE_API_URL}/api/files/${pdfFileId}`;

  return (
    <div className="flex flex-col items-center w-full">
      <iframe
        src={pdfUrl}
        title="PDF Document"
        className="w-full max-w-3xl h-[80vh] border rounded"
      />
      <button
        onClick={onNext}
        className="mt-4 bg-green-500 text-white px-6 py-2 rounded text-base"
      >
        Next
      </button>
    </div>
  );
}
