'use client'

import React, { useState, useEffect } from 'react'
import { useBreakTimer } from './contexts/BreakTimerContext'
import { Button } from './ui/button'
import { Clock, Play, Pause, RotateCcw } from 'lucide-react'

const BreakTimer: React.FC = () => {
  const { timeLeft, isRunning, startTimer, pauseTimer, resetTimer, setTimeLeft } = useBreakTimer()
  const [editableTime, setEditableTime] = useState('05:00')

  useEffect(() => {
    setEditableTime(formatTime(timeLeft))
  }, [timeLeft])

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = time % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d{0,2}:\d{0,2}$/.test(value)) {
      setEditableTime(value)
    }
  }

  const handleTimeBlur = () => {
    const [mins, secs] = editableTime.split(':').map(Number)
    const totalSeconds = (mins || 0) * 60 + (secs || 0)
    setTimeLeft(totalSeconds)
    setEditableTime(formatTime(totalSeconds))
  }

  const handleStart = () => {
    const [mins, secs] = editableTime.split(':').map(Number)
    const totalSeconds = (mins || 0) * 60 + (secs || 0)
    startTimer(totalSeconds)
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg border border-green-700">
      <h2 className="text-3xl font-bold mb-6 text-green-500 flex items-center">
        <Clock className="mr-2" /> Break Timer
      </h2>
      <div className="space-y-6">
        <div className="text-center">
          <input
            type="text"
            value={editableTime}
            onChange={handleTimeChange}
            onBlur={handleTimeBlur}
            className="text-6xl font-bold mb-4 text-green-400 bg-transparent text-center w-full focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md"
            disabled={isRunning}
          />
          <div className="space-x-4">
            {!isRunning ? (
              <Button onClick={handleStart} className="bg-green-600 hover:bg-green-700 text-white">
                <Play className="mr-2 h-4 w-4" /> Start
              </Button>
            ) : (
              <Button onClick={pauseTimer} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                <Pause className="mr-2 h-4 w-4" /> Pause
              </Button>
            )}
            <Button onClick={resetTimer} className="bg-red-600 hover:bg-red-700 text-white">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BreakTimer

