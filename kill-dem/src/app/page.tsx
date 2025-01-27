"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/sidebar-07/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Dashboard from "@/app/components/Dashboard"
import WorkStage from "@/app/components/WorkStage"

export default function Page() {
  const [showDashboard, setShowDashboard] = useState(true);
  const [viewMode, setViewMode] = useState('toggle'); // 'toggle' or 'side-by-side'

  const handleSideBySideToggle = () => {
    setViewMode(viewMode === 'toggle' ? 'side-by-side' : 'toggle');
    console.log("Side by Side Toggle Clicked - viewMode:", viewMode === 'toggle' ? 'side-by-side' : 'toggle'); // Log after setting state
  };

  console.log("Component Render - viewMode:", viewMode); // Log on every render

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-10 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <button
              onClick={handleSideBySideToggle}
              className="px-3 py-1 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {viewMode === 'toggle' ? "View Side by Side" : "View Toggle"}
            </button>
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="px-3 py-1 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              style={{ display: viewMode === 'toggle' ? 'block' : 'none' }} // Conditionally show toggle view button - THIS LINE IS KEY
            >
              {showDashboard ? "View Workstage" : "View Dashboard"}
            </button>
          </div>
        </header>
        <div className="flex flex-1 gap-4 p-4 pt-0 overflow-x-auto"> {/* overflow-x-auto for horizontal scroll */}
          {viewMode === 'toggle' ? (
            showDashboard ? <WorkStage /> : <Dashboard />
          ) : (
            <div className="flex w-full gap-4"> {/* flex and w-full to enable side by side layout */}
              <div className="flex-1"> <Dashboard /> </div> {/* flex-1 to make them take equal width */}
              <div className="flex-1"> <WorkStage /> </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 