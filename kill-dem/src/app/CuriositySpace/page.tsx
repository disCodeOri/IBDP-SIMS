"use client";

import React from "react";
import IdeaTracker from "@/components/IdeaTracker";
import { BackButton } from "@/components/custom-ui/back-button";

const IdeaTrackerPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <BackButton />
      </header>
      <main className="flex-1 overflow-auto">
        <IdeaTracker />
      </main>
    </div>
  );
};

export default IdeaTrackerPage;
