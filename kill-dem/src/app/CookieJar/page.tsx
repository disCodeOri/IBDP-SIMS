"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';
import CookieJar from '@/components/CookieJar';
import { ArrowLeft } from 'lucide-react';
import { BackButton } from "@/components/custom-ui/back-button";

const CookieJarPage: React.FC = () => {
    const router = useRouter();

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
