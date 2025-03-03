"use client";

import * as React from "react";
import { NavUtilities } from "@/components/sidebar-07/nav-utilities";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { data } from "@/data/sidebar";
import { UserButton } from "@clerk/nextjs";

/**
 * AppSidebar component is the main sidebar for the application.
 * It integrates various sidebar components to create a functional application sidebar.
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <UserButton />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavUtilities utilities={data.utilities} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}