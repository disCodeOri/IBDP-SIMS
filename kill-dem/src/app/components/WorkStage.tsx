// app/components/WorkStage.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Manager,
  Space,
  Spaces,
  BasicWindow,
} from "@/components/stage-manager";
import { Button } from "@/components/ui/button";
import { SpaceDeleteToast, WindowDeleteToast } from "./SpaceDeleteAlertToast";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";

interface WindowData {
  id: string;
  title: string;
  content: string;
  position: [number, number];
  size: [number, number];
}

interface SpaceData {
  id: number;
  windows: WindowData[];
}

export default function WorkStage() {
  const { user } = useUser();
  const [spaces, setSpaces] = useState<SpaceData[]>([]);
  const [currentSpace, setCurrentSpace] = useState(0);

  const { toast } = useToast();

  // Immediate save function
  const saveData = async (spacesToSave: SpaceData[]) => {
    if (!user) return;
    const docRef = doc(db, "users", user.id, "stageManager", "data");
    await setDoc(docRef, { spaces: spacesToSave });
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const docRef = doc(db, "users", user.id, "stageManager", "data");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const formattedSpaces = data.spaces.map((space: any) => ({
          ...space,
          windows: space.windows.map((window: any) => ({
            ...window,
            position: window.position as [number, number],
            size: window.size as [number, number],
            content: window.content,
          })),
        }));
        setSpaces(formattedSpaces);
      }
    };

    loadData();
  }, [user]);

  const addSpace = () => {
    const newSpace: SpaceData = {
      id: spaces.length,
      windows: [
        {
          id: Date.now().toString(),
          title: "New Document",
          content: "",
          position: [100, 100],
          size: [400, 300],
        },
      ],
    };

    setSpaces((prev) => {
      const newSpaces = [...prev, newSpace];
      saveData(newSpaces);
      return newSpaces;
    });
    setCurrentSpace(newSpace.id);
  };

  const deleteSpace = (spaceId: number) => {
    setSpaces((prev) => {
      const newSpaces = prev.filter((space) => space.id !== spaceId);
      saveData(newSpaces);
      return newSpaces;
    });
    setCurrentSpace((prev) => Math.max(0, prev === spaceId ? prev - 1 : prev));
  };

  const updateWindow = (
    spaceId: number,
    windowId: string,
    newData: Partial<WindowData>
  ) => {
    setSpaces((prev) => {
      const newSpaces = prev.map((space) => {
        if (space.id === spaceId) {
          return {
            ...space,
            windows: space.windows.map((window) =>
              window.id === windowId
                ? {
                    ...window,
                    ...newData,
                    content: newData.content || window.content, // Ensure content exists
                  }
                : window
            ),
          };
        }
        return space;
      });
      saveData(newSpaces);
      return newSpaces;
    });
  };

  const addWindow = (spaceId: number) => {
    setSpaces((prev) => {
      const newSpaces = prev.map((space) => {
        if (space.id === spaceId) {
          const newWindow = {
            id: Date.now().toString(),
            title: "New Document",
            content: "",
            position: [
              100 + space.windows.length * 20,
              100 + space.windows.length * 20,
            ] as [number, number],
            size: [400, 300] as [number, number],
          };
          return {
            ...space,
            windows: [...space.windows, newWindow],
          };
        }
        return space;
      });
      saveData(newSpaces);
      return newSpaces;
    });
  };

  const deleteWindow = (spaceId: number, windowId: string) => {
    setSpaces((prev) => {
      const newSpaces = prev.map((space) => {
        if (space.id === spaceId) {
          return {
            ...space,
            windows: space.windows.filter((window) => window.id !== windowId),
          };
        }
        return space;
      });
      saveData(newSpaces);
      return newSpaces;
    });
  };

  return (
    <div className="p-4 bg-gray-100">
      <div className="mb-4 flex gap-2">
        <Button onClick={addSpace}>Create New Space</Button>
        <Button onClick={() => addWindow(currentSpace)}>Add Window</Button>
        {spaces.length > 1 && (
          <SpaceDeleteToast
            spaceId={currentSpace}
            onSpaceDelete={deleteSpace}
          />
        )}
      </div>
      <Manager
        size={[1600, 760]}
        style={{
          margin: "0 auto",
          border: "2px solid #333",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Spaces
          space={currentSpace}
          onSpaceChange={setCurrentSpace}
          className="bg-white"
        >
          {spaces.map((space) => (
            <Space key={space.id}>
              {space.windows.map((window) => (
                <BasicWindow
                  key={window.id}
                  title={window.title}
                  content={window.content}
                  initialPosition={window.position}
                  initialSize={window.size}
                  style={{ background: "#fff" }}
                  onTitleChange={(newTitle) =>
                    updateWindow(space.id, window.id, { title: newTitle })
                  }
                  onContentChange={(newContent) =>
                    updateWindow(space.id, window.id, { content: newContent })
                  }
                  onClose={() => {
                    const triggerToast = () => {
                      toast({
                        title: "Delete Window",
                        description: `Are you sure you want to delete "${window.title}"?`,
                        action: (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              deleteWindow(space.id, window.id);
                              toast({
                                title: "Window deleted",
                                description: `"${window.title}" has been deleted successfully.`,
                              });
                            }}
                          >
                            Delete
                          </Button>
                        ),
                      });
                    };
                    triggerToast();
                  }}
                />
              ))}
            </Space>
          ))}
        </Spaces>
      </Manager>
    </div>
  );
}
