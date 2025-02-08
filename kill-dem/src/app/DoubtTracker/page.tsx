"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";
import DoubtTracker from "@/components/DoubtTracker";
import { ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/custom-ui/back-button";

const DoubtTrackerPage: React.FC = () => {
  const router = useRouter();

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
