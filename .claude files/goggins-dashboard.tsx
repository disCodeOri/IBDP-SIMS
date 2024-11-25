import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Skull, Award, Target, Trophy, Brain } from 'lucide-react';

const GogginsDashboard = () => {
  const [motivation] = useState([
    "STAY HARD!",
    "WHO'S GONNA CARRY THE BOATS?",
    "YOU DON'T KNOW ME, SON!",
    "TAKE THEIR SOULS!",
    "IT'S TIME TO GO TO WAR!"
  ]);

  const [currentQuote, setCurrentQuote] = useState(motivation[0]);
  const [streakCount, setStreakCount] = useState(47);
  const [taskCount, setTaskCount] = useState(12);
  
  // Simulate intensity meter
  const [intensity, setIntensity] = useState(85);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-900 text-white">
      {/* Main Motivation Banner */}
      <Card className="mb-6 bg-gradient-to-r from-red-900 to-gray-900 border-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skull className="w-8 h-8 text-red-500" />
              <span className="text-2xl">GOGGINS MODE</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-red-500 animate-pulse" />
              <span className="text-xl">{streakCount} DAY STREAK</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-4xl font-bold text-red-500 mb-4 text-center">
              {currentQuote}
            </div>
            <button 
              className="px-8 py-4 bg-red-600 rounded-lg font-bold text-xl hover:bg-red-700 transition-all"
              onClick={() => setCurrentQuote(motivation[Math.floor(Math.random() * motivation.length)])}
            >
              STAY HARD!
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Intensity Meter */}
        <Card className="bg-gray-800 border-none">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-red-500" />
                  <span className="font-bold">INTENSITY</span>
                </div>
                <span className="text-2xl font-bold text-red-500">
                  {intensity}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000 ease-out"
                  style={{ width: `${intensity}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Completed */}
        <Card className="bg-gray-800 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-red-500" />
                <span className="font-bold">TASKS DESTROYED</span>
              </div>
              <span className="text-2xl font-bold text-red-500">
                {taskCount}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Mental Toughness Score */}
        <Card className="bg-gray-800 border-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-red-500" />
                <span className="font-bold">MENTAL TOUGHNESS</span>
              </div>
              <span className="text-2xl font-bold text-red-500">
                ELITE
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Callout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Challenges */}
        <Card className="bg-gray-800 border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-red-500" />
              ACTIVE CHALLENGES
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">4:30 AM WAKE UP</span>
                  <span className="text-red-500">7/30 DAYS</span>
                </div>
                <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-red-500"/>
                </div>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">10K STEPS DAILY</span>
                  <span className="text-red-500">23/30 DAYS</span>
                </div>
                <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-red-500"/>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-gray-800 border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-red-500" />
              ACHIEVEMENTS EARNED
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-700 rounded-lg text-center">
                <Award className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="font-bold">SOUL TAKER</div>
                <div className="text-sm text-gray-400">30 Day Streak</div>
              </div>
              <div className="p-3 bg-gray-700 rounded-lg text-center">
                <Skull className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="font-bold">UNCOMMON</div>
                <div className="text-sm text-gray-400">100 Tasks Done</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GogginsDashboard;
