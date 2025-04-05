// app/components/WorkStage.tsx
"use client";

import { useState, useEffect } from "react";
import { Manager, Space, Spaces, BasicWindow } from "@/components/stage-manager";
import { Button } from "@/components/ui/button";
import { SpaceDeleteToast } from "./SpaceDeleteAlertToast";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";

// Interface defining the structure of a draggable/resizable window
interface WindowData {
  id: string;
  title: string;
  content: string;
  position: [number, number];
  size: [number, number];
}

// Interface defining a workspace containing multiple windows
interface SpaceData {
  id: number;
  windows: WindowData[];
}

export default function WorkStage() {
  // User authentication state
  const { user } = useUser();
  // State management for workspaces and current active space
  const [spaces, setSpaces] = useState<SpaceData[]>([]);
  const [currentSpace, setCurrentSpace] = useState(0);
  // Toast notification system
  const { toast } = useToast();

  /**
   * Persists current workspace state to Firestore
   * @param spacesToSave - Array of SpaceData to save
   */
  const saveData = async (spacesToSave: SpaceData[]) => {
    if (!user) return;
    const docRef = doc(db, "users", user.id, "stageManager", "data");
    await setDoc(docRef, { spaces: spacesToSave });
  };

  // Load user's workspace data on component mount or user change
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const docRef = doc(db, "users", user.id, "stageManager", "data");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Firestore data to properly typed format
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

  /**
   * Creates a new workspace with a default window
   */
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
    // Switch to the new space after creation
    setCurrentSpace(newSpace.id);
  };

  /**
   * Removes a workspace and adjusts current space selection
   * @param spaceId - ID of the space to remove
   */
  const deleteSpace = (spaceId: number) => {
    setSpaces((prev) => {
      const newSpaces = prev.filter((space) => space.id !== spaceId);
      saveData(newSpaces);
      return newSpaces;
    });
    // Ensure current space stays valid after deletion
    setCurrentSpace((prev) => Math.max(0, prev === spaceId ? prev - 1 : prev));
  };

  /**
   * Updates properties of a specific window
   * @param spaceId - Parent workspace ID
   * @param windowId - Target window ID
   * @param newData - Partial window data to update
   */
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
                    // Ensure content remains if not provided in update
                    content: newData.content || window.content,
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

  /**
   * Adds a new window to the specified workspace
   * @param spaceId - Target workspace ID
   */
  const addWindow = (spaceId: number) => {
    setSpaces((prev) => {
      const newSpaces = prev.map((space) => {
        if (space.id === spaceId) {
          const newWindow = {
            id: Date.now().toString(),
            title: "New Document",
            content: "",
            // Stagger window positions for visibility
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

  /**
   * Removes a window from its parent workspace
   * @param spaceId - Parent workspace ID
   * @param windowId - Target window ID to remove
   */
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
      {/* Workspace control buttons */}
      <div className="mb-4 flex gap-2">
        <Button onClick={addSpace}>Create New Space</Button>
        <Button onClick={() => addWindow(currentSpace)}>Add Window</Button>
        
        {/* Conditional delete space button with confirmation toast */}
        {spaces.length > 1 && (
          <SpaceDeleteToast
            spaceId={currentSpace}
            onSpaceDelete={deleteSpace}
          />
        )}
      </div>

      {/* Main workspace visualization component */}
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
                  onPositionChange={(newPosition) =>
                    updateWindow(space.id, window.id, { position: newPosition })
                  }
                  onSizeChange={(newSize) =>
                    updateWindow(space.id, window.id, { size: newSize })
                  }
                  onClose={() => {
                    // Toast confirmation flow for window deletion
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