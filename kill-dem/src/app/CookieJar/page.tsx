"use client";

import React from "react";
import CookieJar from "@/components/CookieJar";
import { BackButton } from "@/components/custom-ui/back-button";

const CookieJarPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <BackButton />
      </header>
      <main className="flex-1 overflow-auto">
        <CookieJar />
      </main>
    </div>
  );
};

export default CookieJarPage;
