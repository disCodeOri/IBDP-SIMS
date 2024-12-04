// src/components/Stopwatch.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";

const Stopwatch: React.FC = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(Date.now() - startTime);
      }, 10); // Update every 10ms for smoother display
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const formatTime = (time: number) => {
    const totalSeconds = Math.floor(time / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const milliseconds = Math.floor((time % 1000) / 10); // Display milliseconds
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      setStartTime(Date.now() - timeElapsed);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeElapsed(0);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg border border-green-700">
      <h2 className="text-3xl font-bold mb-6 text-green-500 flex items-center">
        <Clock className="mr-2" /> Stopwatch
      </h2>
      <div className="space-y-6">
        <div className="text-center">
          <p
            className="text-6xl font-bold mb-4 text-green-400 bg-transparent text-center w-full rounded-md"
          >
            {formatTime(timeElapsed)}
          </p>
          <div className="space-x-4">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Pause className="mr-2 h-4 w-4" /> Pause
              </Button>
            )}
            <Button
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stopwatch;