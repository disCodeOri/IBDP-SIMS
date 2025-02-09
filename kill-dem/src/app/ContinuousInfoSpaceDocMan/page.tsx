"use client";

import React from "react";
import DocumentJar from "@/components/ContinuousInfoSpace/ContinuousInfoSpaceDocMan";
import { BackButton } from "@/components/custom-ui/back-button";

const DocumentJarPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <BackButton />
      </header>
      <main className="flex-1 overflow-auto">
        <DocumentJar />
      </main>
    </div>
  );
};

export default DocumentJarPage;
