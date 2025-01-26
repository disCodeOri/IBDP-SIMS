import { useState, useEffect } from 'react';
import { Manager, Space, Spaces, BasicWindow } from "@/components/stage-manager";

export default function WorkStage() {
  const [currentSpace, setCurrentSpace] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        switch (e.key) {
          case 'ArrowLeft':
            setCurrentSpace(p => Math.max(0, p - 1));
            break;
          case 'ArrowRight':
            setCurrentSpace(p => p + 1);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="p-4 bg-gray-100">
      <div className="mb-4 flex gap-2">
        <button 
          onClick={() => setCurrentSpace(p => Math.max(0, p - 1))}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Previous Space
        </button>
        <button
          onClick={() => setCurrentSpace(p => p + 1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next Space
        </button>
        <div className="ml-4 p-2 self-center">
          Current Space: {currentSpace + 1}
        </div>
      </div>

      <Manager
        size={[1280, 700]}
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
          {/* Space 1 */}
          <Space>
            <BasicWindow
              title="Document 1"
              initialPosition={[100, 100]}
              initialSize={[400, 300]}
              style={{ background: "#fff" }}
            >
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">Space 1 Content</h2>
                <p>Try scrolling horizontally with mouse wheel</p>
                <p>Or swipe left/right on touch devices</p>
              </div>
            </BasicWindow>

            <BasicWindow
              title="Browser"
              initialPosition={[300, 200]}
              initialSize={[500, 400]}
              style={{ background: "#fff" }}
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Space 1 Browser</h3>
                <p>You should be able to switch spaces using:</p>
                <ul className="list-disc pl-4 mt-2">
                  <li>Mouse wheel</li>
                  <li>Touch gestures</li>
                  <li>Navigation buttons above</li>
                </ul>
              </div>
            </BasicWindow>
          </Space>

          {/* Space 2 */}
          <Space>
            <BasicWindow
              title="Settings"
              initialPosition={[700, 150]}
              initialSize={[300, 250]}
              style={{ background: "#fff" }}
            >
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">Space 2 Settings</h2>
                <p>Try navigating back to Space 1 using:</p>
                <ul className="list-disc pl-4 mt-2">
                  <li>Swipe right gesture</li>
                  <li>Mouse wheel (scroll left)</li>
                  <li>"Previous Space" button</li>
                </ul>
              </div>
            </BasicWindow>

            <BasicWindow
              title="Monitor"
              initialPosition={[200, 300]}
              initialSize={[400, 300]}
              style={{ background: "#fff" }}
            >
              <div className="p-4 bg-yellow-50 h-full">
                <h3 className="text-lg font-semibold">Space 2 Monitor</h3>
                <p className="mt-2">This is a different space with separate windows</p>
              </div>
            </BasicWindow>
          </Space>

          {/* Space 3 */}
          <Space>
            <div className="w-full h-full flex items-center justify-center bg-blue-50">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Space 3</h2>
                <p className="text-lg">Empty space demonstration</p>
                <p className="mt-2">Try all navigation methods:</p>
                <ul className="list-disc pl-4 mt-2 inline-block text-left">
                  <li>Mouse wheel</li>
                  <li>Touch swipes</li>
                  <li>Navigation buttons</li>
                </ul>
              </div>
            </div>
          </Space>
        </Spaces>
      </Manager>
    </div>
  );
}