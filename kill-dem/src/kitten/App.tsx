// src/kitten/App.tsx
import React, { useState, useEffect } from "react";
import {
  Manager,
  Spaces,
  Space,
  Window,
  TitleBar,
  Title,
  Buttons,
  CloseButton,
  usePosition,
  useSize,
  useKittenId,
  StageButton,
} from "@/kitten";
import "@fontsource-variable/merienda";
import "@fontsource-variable/josefin-sans";
import "./App.css";

const SPACES_NUM = 10;

/**
 * Main application component.
 * Initializes the desktop environment, manages spaces and window resizing.
 * 
 * @returns {JSX.Element} The rendered application.
 */
function App() {
  const [size, setSize] = useState<[number, number]>([800, 600]); // Default size
  const [space, setSpace] = useState(0);

  useEffect(() => {
    // set the initial size using window object only in the browser
    if (typeof window !== "undefined") {
      setSize([window.innerWidth, window.innerHeight]);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setSize([window.innerWidth, window.innerHeight]);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="App">
      <Manager size={size}>
        <Spaces space={space} onSpaceChange={setSpace}>
          <Space>
            <h1 className="colorful colorful__secondary">
              Welcome to React&lt;Kitten&gt;
            </h1>
            <p>
              React&lt;Kitten&gt; is a desktop environment for the web. It is a
              React component library that allows you to create desktop-like
              applications in the browser.
            </p>
            <p>Kitten is inspired by macOS&apos; Aqua and Stage Manager.</p>

            <button style={{ marginRight: 10 }}>Previous Space</button>
            <button onClick={() => setSpace(space + 1)}>Next Space</button>

            <MyWindow title="Cats and Kittens">
              <h2>Window</h2>
              <p>Window content</p>
            </MyWindow>
          </Space>
          {Array.from({ length: SPACES_NUM }).map((_, i) => (
            <Space key={i}>
              <h1 className="">Space {i}</h1>
              <p>
                Space {i} Lorem ipsum dolor sit amet consectetur adipisicing
                elit. Possimus repellat, inventore dolores cum aliquid nam. Ex
                in deleniti minima cum tempora eum placeat perspiciatis, quasi,
                quod, iusto a consequuntur cumque.
              </p>

              <button
                onClick={() => setSpace(Math.max(space - 1, 0))}
                style={{ marginRight: 10 }}
              >
                Previous Space
              </button>
              <button onClick={() => setSpace(Math.min(space + 1, SPACES_NUM))}>
                Next Space
              </button>

              <MyWindow title="Cats and Kittens">
                <h2>Window {i}</h2>
                <p>Window {i} content</p>
              </MyWindow>
            </Space>
          ))}
        </Spaces>
      </Manager>
    </div>
  );
}

/**
 * A custom window component with controls for positioning, resizing, 
 * staging, and opening/closing.
 * 
 * @param {React.PropsWithChildren & { title?: string }} props - Props including an optional title.
 * @returns {JSX.Element} The rendered window.
 */
function MyWindow({ title }: React.PropsWithChildren & { title?: string }) {
  const [kittenId] = useKittenId();
  const [position, setPosition] = usePosition([300, 100]);
  const [opened, setOpened] = useState(true);
  const [size, setSize] = useSize([500, 400]);
  const [staged, setStaged] = useState(false);
  const [alwaysOnTop] = useState(false);

  return (
    <>
      {opened ? (
        <Window
          kittenId={kittenId}
          position={position}
          onPositionChange={setPosition}
          size={size}
          onSizeChange={setSize}
          staged={staged}
          onStagedChange={setStaged}
          alwaysOnTop={alwaysOnTop}
        >
          <TitleBar onMove={setPosition}>
            <Buttons>
              <CloseButton onClick={() => setOpened(false)} />
              <StageButton onClick={() => setStaged(!staged)} />
            </Buttons>
            <Title>{title}</Title>
          </TitleBar>
        </Window>
      ) : (
        <div style={{ margin: 10 }}>
          <button onClick={() => setOpened(true)}>Open Window</button>
        </div>
      )}
    </>
  );
}

export default App;
