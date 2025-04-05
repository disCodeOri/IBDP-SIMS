"use client";

import React from "react";
import DoubtTracker from "@/components/DoubtTracker";
import { BackButton } from "@/components/ui/custom-ui/back-button";

const DoubtTrackerPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <BackButton />
      </header>
      <main className="flex-1 overflow-auto">
        <DoubtTracker />
      </main>
    </div>
  );
};

export default DoubtTrackerPage;
