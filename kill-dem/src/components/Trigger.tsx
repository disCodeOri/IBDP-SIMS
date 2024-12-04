// src/components/Trigger.tsx
"use client";
import { useState } from 'react';

const Trigger = () => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <button
        onClick={() => setShowVideo(!showVideo)}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        {showVideo ? 'Hide Video' : 'Show Video'}
      </button>
      {showVideo && (
        <div className="mt-4">
          <iframe
            width="1120" // original/default:560
            height="630" // original/default:315
            src="https://www.youtube.com/embed/1PGkSRBkrt8?si=R0VqS2oG2TPXNM8A"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default Trigger;