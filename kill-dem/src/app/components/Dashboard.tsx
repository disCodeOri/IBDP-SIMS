import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import Cookies from "@/components/CookieJar";

export default function Dashboard() {
  return (
    <ResizablePanelGroup
      direction="vertical"
      className="rounded-lg border"
      style={{ width: '1600px' }}
    >
      <ResizablePanel minSize={30}>
        <ResizablePanelGroup
          direction="horizontal"
          className="rounded-lg border"
        >
          <ResizablePanel defaultSize={40} minSize={30}>
            <ScrollArea className="h-full w-full rounded-xl bg-muted/50">
              <Cookies disableEdit disableAdd disableDelete gridCols={3} />
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
        <ResizablePanelGroup
          direction="horizontal"
          className="rounded-lg border"
        >
          <ResizablePanel>Four</ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}