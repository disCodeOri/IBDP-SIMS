import React, { useState, useRef, useEffect } from "react";

const Ticker: React.FC = () => {
  const [isTickingEnabled, setIsTickingEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      if (isTickingEnabled) {
        audioElement.loop = true;
        audioElement.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      } else {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    }

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [isTickingEnabled]);

  const handleToggle = () => {
    setIsTickingEnabled((prev) => !prev);
  };

  return (
    <div className="flex items-center space-x-4">
      <audio
        ref={audioRef}
        src="/audios/ticking.mp3" // Note the path is now from the public directory
        preload="auto"
      />
      <button
        onClick={handleToggle}
        className={`
          px-4 py-2 rounded-md transition-colors duration-300
          ${
            isTickingEnabled
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-700 px-4 py-2 rounded-md text-green-400 hover:bg-gray-600"
          }
        `}
      >
        {isTickingEnabled ? "Disable Ticking" : "Enable Ticking"}
      </button>
    </div>
  );
};

export default Ticker;
