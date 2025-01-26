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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-10 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="px-3 py-1 text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {showDashboard ? "View Dashboard" : "View Workstage"}
            </button>
          </div>
        </header>
        <div className="flex flex-1 gap-4 p-4 pt-0">
          {showDashboard ? <WorkStage /> : <Dashboard />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}