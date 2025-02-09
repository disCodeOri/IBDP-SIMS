"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { NavUtilities } from "@/components/sidebar-07/nav-utilities";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { data } from "@/data/sidebar";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <UserButton />
          {/*<ThemeToggle />*/}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavUtilities utilities={data.utilities} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
