// src/app/page.tsx
'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Focus, Book, Target, Medal, Clock, Dumbbell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BreakTimerProvider } from '@/components/contexts/BreakTimerContext';
import { EbbinghausProvider } from '@/components/contexts/EbbinghausContext';
import BreakTimer from '@/components/BreakTimer';
import FocusBeamTabbedTreeView from '@/components/FocusBeam';
import ReviewNotifications from '@/components/ReviewNotifications';

export default function MissionControlDashboard() {
  const [activeTab, setActiveTab] = useState('focus-beam');
  return (
    <EbbinghausProvider>
      <BreakTimerProvider>
        <ReviewNotifications />
        <div className="min-h-screen bg-black text-green-400 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-green-500 tracking-tight">MISSION CONTROL</h1>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-gray-900 mb-6">
                <TabsTrigger value="focus-beam" className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900">
                  <Focus className="h-5 w-5" /> Focus Beam
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900">
                  <Book className="h-5 w-5" /> Resources
                </TabsTrigger>
                <TabsTrigger value="habits" className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900">
                  <Target className="h-5 w-5" /> Habits
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900">
                  <Medal className="h-5 w-5" /> Achievements
                </TabsTrigger>
                <TabsTrigger value="breaks" className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900">
                  <Clock className="h-5 w-5" /> Break Timer
                </TabsTrigger>
                <TabsTrigger value="workouts" className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900">
                  <Dumbbell className="h-5 w-5" /> Workouts
                </TabsTrigger>
              </TabsList>
              <TabsContent value="focus-beam">
                <Card className="bg-gray-900 border-green-800">
                  <CardContent className="p-6">
                    <FocusBeamTabbedTreeView />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="resources">
                <Card className="bg-gray-900 border-green-800">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-green-500">Resources</h2>
                    {}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="habits">
                <Card className="bg-gray-900 border-green-800">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-green-500">Habits</h2>
                    {}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="achievements">
                <Card className="bg-gray-900 border-green-800">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-green-500">Achievements</h2>
                    {}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="breaks">
                <BreakTimer />
              </TabsContent>
              <TabsContent value="workouts">
                <Card className="bg-gray-900 border-green-800">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-green-500">Workouts</h2>
                    {}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </BreakTimerProvider>
    </EbbinghausProvider>
  );
}