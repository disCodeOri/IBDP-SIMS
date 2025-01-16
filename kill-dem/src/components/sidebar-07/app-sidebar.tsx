"use client"

import * as React from "react"
import { NavMain } from "@/components/sidebar-07/nav-main"
import { NavUtilities } from "@/components/sidebar-07/nav-utilities"
import { NavUser } from "@/components/sidebar-07/nav-user"
import { SpaceSwitcher } from "@/components/sidebar-07/space-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {data} from "@/data/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SpaceSwitcher spaces={data.spaces} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavUtilities utilities={data.utilities} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
