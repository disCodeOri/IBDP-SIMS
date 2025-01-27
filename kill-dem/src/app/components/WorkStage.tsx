import { useState } from 'react';
import { Manager, Space, Spaces, BasicWindow } from "@/components/stage-manager";
import { Button } from "@/components/ui/button"
import { SpaceDeleteAlertDialog } from './SpaceDeleteAlertDialog';

export default function WorkStage() {
  const [spaces, setSpaces] = useState([0]); // Start with one space
  const [currentSpace, setCurrentSpace] = useState(0);

  const addSpace = () => {
    const newSpaceId = spaces.length; // Simple ID generation for new spaces
    setSpaces([...spaces, newSpaceId]);
    setCurrentSpace(newSpaceId);
  };

  const deleteSpace = (spaceIdToDelete: number) => {
    setSpaces(spaces.filter((id) => id !== spaceIdToDelete));
    // If the deleted space is the current one, adjust the current space
    if (currentSpace === spaceIdToDelete) {
      setCurrentSpace(Math.max(0, spaces.length - 2)); // Go to the previous space or 0
    }
  };

  return (
    <div className="p-4 bg-gray-100">
      <div className="mb-4 flex gap-2">
        <Button onClick={addSpace}>Create New Space</Button>
        {spaces.length > 1 && (
          <SpaceDeleteAlertDialog
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
          {spaces.map((spaceId) => (
            <Space key={spaceId}>
              {/* Example windows for each space */}
              <BasicWindow
                title={`Document ${spaceId + 1}`}
                initialPosition={[100, 100]}
                initialSize={[400, 300]}
                style={{ background: "#fff" }}
              >
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">
                    Space {spaceId + 1} Content
                  </h2>
                  <p>This is a sample document in space {spaceId + 1}.</p>
                </div>
              </BasicWindow>

              <BasicWindow
                title={`Browser ${spaceId + 1}`}
                initialPosition={[300, 200]}
                initialSize={[500, 400]}
                style={{ background: "#fff" }}
              >
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    Space {spaceId + 1} Browser
                  </h3>
                  <p>
                    You can browse the web in space {spaceId + 1}.
                  </p>
                </div>
              </BasicWindow>
            </Space>
          ))}
        </Spaces>
      </Manager>
    </div>
  );
}