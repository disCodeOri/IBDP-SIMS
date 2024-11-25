'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

type BreakTimerContextType = {
  timeLeft: number
  isRunning: boolean
  startTimer: (seconds: number) => void
  pauseTimer: () => void
  resetTimer: () => void
  setTimeLeft: (seconds: number) => void
}

const BreakTimerContext = createContext<BreakTimerContextType | undefined>(undefined)

export const useBreakTimer = () => {
  const context = useContext(BreakTimerContext)
  if (!context) {
    throw new Error('useBreakTimer must be used within a BreakTimerProvider')
  }
  return context
}

export const BreakTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)

  const playSound = useCallback(() => {
    if (!audioContextRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    if (audioBufferRef.current) {
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBufferRef.current
      source.connect(audioContextRef.current.destination)
      source.start()
    } else {
      fetch('/sounds/digital-clock-alarm.mp3')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContextRef.current!.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          audioBufferRef.current = audioBuffer
          const source = audioContextRef.current!.createBufferSource()
          source.buffer = audioBuffer
          source.connect(audioContextRef.current!.destination)
          source.start()
        })
        .catch(error => console.error('Error playing sound:', error))
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      playSound()
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, playSound])

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds)
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(0)
  }

  return (
    <BreakTimerContext.Provider
      value={{
        timeLeft,
        isRunning,
        startTimer,
        pauseTimer,
        resetTimer,
        setTimeLeft,
      }}
    >
      {children}
    </BreakTimerContext.Provider>
  )
}

