import { AppSidebar } from "@/components/sidebar-07/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import Cookies from "@/components/CookieJar";


export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 gap-4 p-4 pt-0">
          <ResizablePanelGroup direction="vertical" className="rounded-lg border">
            <ResizablePanel minSize={30}>
              <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
                <ResizablePanel defaultSize={40} minSize={30}>
                  <ScrollArea className="h-full w-full rounded-xl bg-muted/50">
                    <Cookies disableEdit disableAdd disableDelete gridCols={3}/>
                  </ScrollArea>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>Two</ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>Three</ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
                <ResizablePanel>Four</ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
{/*
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <ScrollArea className="aspect-video rounded-xl bg-muted/50">
              <Cookies disableEdit disableAdd disableDelete gridCols={3}/>
            </ScrollArea>
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />*/}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
