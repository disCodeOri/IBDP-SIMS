"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';
import DoubtTracker from '@/components/DoubtTracker';
import { ArrowLeft } from 'lucide-react';

const DoubtTrackerPage: React.FC = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col h-screen">
            <header className="flex items-center justify-between p-4 border-b">
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </header>
            <main className="flex-1 overflow-auto">
                <DoubtTracker />
            </main>
        </div>
    );
};

export default DoubtTrackerPage;
