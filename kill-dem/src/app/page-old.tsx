// src/app/page.tsx
"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Focus,
  Target,
  Medal,
  Clock,
  Dumbbell,
  FlameKindling,
  Axe,
  ClockAlert
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BreakTimerProvider } from "@/components/contexts/BreakTimerContext";
import BreakTimer from "@/components/BreakTimer";
import Cookies from "@/components/CookieJar";
import PKM from "@/components/PKM";
import Workouts from "@/components/Workouts";
import Ticker from '@/components/Ticker';
import Randy from '@/components/Randy'
import Stopwatch from '@/components/Stopwatch'
import Trigger from '@/components/Trigger';

export default function MissionControlDashboard() {
  const [activeTab, setActiveTab] = useState("randy");
  return (
    <BreakTimerProvider>
      <div className="min-h-screen bg-black text-green-400 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-green-500 tracking-tight">
            MISSION CONTROL
          </h1>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Tabs List */}
            <TabsList className="grid w-full grid-cols-8 bg-gray-900 mb-6">
              <TabsTrigger
                value="randy"
                className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900 data-[state=active]:text-green-300"
              >
                <FlameKindling className="h-5 w-5" /> Randy
              </TabsTrigger>
              <TabsTrigger
                value="trigger"
                className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900 data-[state=active]:text-green-300"
              >
                <Axe className="h-5 w-5" /> Trigger
              </TabsTrigger>
              <TabsTrigger
                value="pkm"
                className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900 data-[state=active]:text-green-300"
              >
                <Focus className="h-5 w-5" /> PKM
              </TabsTrigger>
              <TabsTrigger
                value="cookies"
                className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900 data-[state=active]:text-green-300"
              >
                <Medal className="h-5 w-5" /> Cookies
              </TabsTrigger>
              <TabsTrigger
                value="stopwatch"
                className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900 data-[state=active]:text-green-300"
              >
                <Target className="h-5 w-5" /> Stopwatch
              </TabsTrigger>
              <TabsTrigger
                value="breaks"
                className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900 data-[state=active]:text-green-300"
              >
                <Clock className="h-5 w-5" /> Timer
              </TabsTrigger>
              <TabsTrigger
                value="workouts"
                className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900 data-[state=active]:text-green-300"
              >
                <Dumbbell className="h-5 w-5" /> Workouts
              </TabsTrigger>
              <TabsTrigger
                value="ticker"
                className="flex items-center gap-2 text-green-300 data-[state=active]:bg-green-900 data-[state=active]:text-green-300"
              >
                <ClockAlert className="h-5 w-5" /> Ticker
              </TabsTrigger>
            </TabsList>

            {/* Randy */}
            <TabsContent value="randy">
              <Card className="bg-gray-900 border-green-800">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-green-500">
                    Randy
                  </h2>
                  <Randy />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trigger */}
            <TabsContent value="trigger">
              <Card className="bg-gray-900 border-green-800">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-green-500">
                    Trigger
                  </h2>
                  <Trigger />
                </CardContent>
              </Card>
            </TabsContent>

            {/* PKM */}
            <TabsContent value="pkm">
              <Card className="bg-gray-900 border-green-800">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-green-500">
                    PKM
                  </h2>
                  <PKM />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stopwatch */}
            <TabsContent value="stopwatch">
              <Card className="bg-gray-900 border-green-800">
                <CardContent className="p-6">
                  <Stopwatch />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Acheivements */}
            <TabsContent value="cookies">
              <Card className="bg-gray-900 border-green-800">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-green-500">
                    Cookies
                  </h2>
                  <Cookies />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timer */}
            <TabsContent value="breaks">
              <BreakTimer />
            </TabsContent>

            {/* Workouts */}
            <TabsContent value="workouts">
              <Card className="bg-gray-900 border-green-800">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-green-500">
                    Workouts
                  </h2>
                  <Workouts />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ticker */}
            <TabsContent value="ticker">
              <Card className="bg-gray-900 border-green-800">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-green-500">
                    Ticker
                  </h2>
                  <Ticker />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </BreakTimerProvider>
  );
}
