import React from "react";

export default function VideoContent({ videoUrl, onNext }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full h-full max-h-[80vh] md:w-1/2 aspect-video flex items-center justify-center">
        <iframe
          title="YouTube Video"
          src={`https://www.youtube.com/embed/${videoUrl.split("v=")[1].split("&")[0]}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
      <button onClick={onNext} className="mt-4 bg-green-500 text-white px-6 py-2 rounded text-base">
        Next
      </button>
    </div>
  );
}
