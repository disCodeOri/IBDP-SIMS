"use client";

import React, { useState, useRef, useCallback } from 'react';
import {
  Calendar, Code, Database, Image, Music, Video, FileText, User, MapPin,
  ArrowUp, Maximize2, Minimize2, X, XCircle, FilePlus // Added FilePlus icon
} from 'lucide-react';

const icons = [
  Calendar, Code, Database, Image, Music,   Video, FileText, User, MapPin,
  ArrowUp, Maximize2, Minimize2, X, XCircle // ... add more icons as needed
];

const getRandomIcon = () => icons[Math.floor(Math.random() * icons.length)];

// Utility function for generating unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Interface for Window type to improve type safety
interface Window {
  id: string;
  name: string;
  icon: typeof Calendar; // or any other Lucide icon type
  content: string;
  isActive: boolean;
  isFullScreen: boolean;
  isMinimized: boolean; // Added isMinimized state
  position: { x: number, y: number };
  zIndex: number;
}

const StageManagerInterface: React.FC = () => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveredWindowId, setHoveredWindowId] = useState<string | null>(null); // Track hovered window
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to create a new window
  const createNewWindow = useCallback(() => {
    // Create the new window object
    const newWindow: Window = {
      id: generateId(),
      name: `Window ${windows.length + 1}`,
      icon: getRandomIcon(),
      content: `Content for Window ${windows.length + 1}`,
      isActive: true,
      isFullScreen: false,
      isMinimized: false, // Initialize as not minimized
      position: {
        x: Math.random() * (window.innerWidth - 500),
        y: Math.random() * (window.innerHeight - 300)
      },
      zIndex: windows.length + 1,
    };

    // Reset active state for other windows
    const updatedWindows = windows.map(w => ({ ...w, isActive: false }));

    setWindows([...updatedWindows, newWindow]);
  }, [windows]);

  // Function to handle window selection
  const handleWindowSelect = (selectedWindow: Window) => {
    const updatedWindows = windows.map(window => ({
      ...window,
      isActive: window.id === selectedWindow.id,
      zIndex: window.id === selectedWindow.id
        ? Math.max(...windows.map(w => w.zIndex)) + 1
        : window.zIndex
    }));
    setWindows(updatedWindows);
  };

   // Improved drag handling with immediate cursor tracking
    const startDrag = useCallback((windowId: string, e: React.MouseEvent) => {
      if (!containerRef.current) return;

      const window = windows.find(w => w.id === windowId);
      if (!window || window.isFullScreen) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      // Calculate initial offset
      const offsetX = e.clientX - window.position.x;
      const offsetY = e.clientY - window.position.y;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!containerRef.current) return;

        // Calculate new position with immediate cursor tracking
        const newX = Math.max(
          0,
          Math.min(
            moveEvent.clientX - containerRect.left - offsetX,
            containerRect.width - 500
          )
        );

        const newY = Math.max(
          0,
          Math.min(
            moveEvent.clientY - containerRect.top - offsetY,
            containerRect.height - 300
          )
        );

        setWindows(prevWindows =>
          prevWindows.map(w =>
            w.id === windowId
              ? {
                  ...w,
                  position: { x: newX, y: newY },
                  isActive: true,
                  zIndex: Math.max(...prevWindows.map(win => win.zIndex)) + 1
              }
              : { ...w, isActive: false }
          )
        );
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
  }, [windows]);

  // Function to toggle window full screen
  const toggleFullScreen = (windowId: string) => {
    const updatedWindows = windows.map(window => {
      if (window.id === windowId) {
        return {
          ...window,
          isFullScreen: !window.isFullScreen,
          position: window.isFullScreen
            ? { x: window.position.x, y: window.position.y }
            : { x: 50, y: 50 },
        };
      }
      return window;
    });

    setWindows(updatedWindows);
  };

    // Function to close a window
    const closeWindow = (windowId: string) => {
      const updatedWindows = windows.filter(window => window.id !== windowId);

      // If there are remaining windows, activate the last one
      if (updatedWindows.length > 0) {
        updatedWindows[updatedWindows.length - 1].isActive = true;
      }

      setWindows(updatedWindows);
    };

    // Function to minimize a window
    const minimizeWindow = (windowId: string) => {
      setWindows(prevWindows =>
        prevWindows.map(window =>
          window.id === windowId ? { ...window, isMinimized: true, isActive: false } : window
        )
      );
    };

    // Function to restore a minimized window
    const restoreWindow = (windowId: string) => {
      setWindows(prevWindows =>
        prevWindows.map(window =>
          window.id === windowId ? { ...window, isMinimized: false, isActive: true, zIndex: Math.max(...prevWindows.map(win => win.zIndex)) + 1 } : { ...window, isActive: false }
        )
      );
    };

    // Custom scrollbar styles
    const scrollbarStyles: React.CSSProperties = {
        scrollbarWidth: 'thin', // Use thin scrollbars (if supported)
        scrollbarColor: 'rgba(128, 128, 128, 0.3) transparent', // Thumb and track color
      };

  return (
    <div
      ref={containerRef}
      className="flex h-screen bg-gray-100 overflow-hidden"
    >
      {/* Sidebar */}
      <div className={`
        transition-all duration-500 ease-in-out
        ${sidebarOpen ? 'w-80' : 'w-16'}
        bg-white/90 backdrop-blur-lg
        border-r border-gray-200
        flex flex-col
        overflow-hidden
        shadow-xl
        z-50
        relative
        ${!sidebarOpen ? 'overflow-x-hidden' : ''}
      `}>
        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 m-2 hover:bg-gray-100 rounded-full self-start z-50"
        >
          {sidebarOpen ? <X size={20} /> : <Maximize2 size={20} />}
        </button>

        {/* New Window Button */}
        <button
          onClick={createNewWindow}
          className="m-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {sidebarOpen ? 'New Window' : <FilePlus size={20} />}
        </button>

        {/* Minimized Windows Container */}
        <div className={`py-4 space-y-2 px-1 ${windows.some(w => w.isMinimized) ? 'block' : 'hidden'} max-h-48 overflow-y-auto`} style={scrollbarStyles}>
            <div className="text-sm font-bold text-gray-600 px-2">Minimized</div>
            <div className="flex-grow space-y-4">
                {windows.filter(w => w.isMinimized).map((window, index) => (
                    <div
                        key={window.id}
                        className="
                            relative
                            cursor-pointer
                            transition-all
                            duration-500
                            transform
                            perspective-1000
                            origin-left
                            group
                          "
                        style={{
                            transform: `
                              translateX(${sidebarOpen ? '0' : '0px'})
                              scale(${sidebarOpen ? '1' : '0.8'})
                            `,
                            opacity: sidebarOpen ? 1 : 0.7,
                            marginLeft: '0px',
                            marginRight: '0px',
                            zIndex: windows.length - index
                        }}
                        onMouseEnter={() => !sidebarOpen && setHoveredWindowId(window.id)}
                        onMouseLeave={() => !sidebarOpen && setHoveredWindowId(null)}
                    >
                        <div
                            onClick={() => {
                                if (!sidebarOpen) {
                                    closeWindow(window.id);
                                } else {
                                    restoreWindow(window.id);
                                }
                            }}
                            className={`
                              bg-white
                              shadow-lg
                              border
                              border-gray-200
                              flex
                              items-center
                              overflow-hidden
                              transition-colors
                              duration-300
                              ${sidebarOpen ? 'rounded-lg p-2 pr-10' : 'rounded w-full'} /* Adjusted width when closed */
                              ${!sidebarOpen && hoveredWindowId === window.id ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-gray-100'}
                            `}
                            style={{ height: sidebarOpen ? 'auto' : '40px' }} /* Consistent height */
                        >
                            {(!sidebarOpen && hoveredWindowId === window.id) ? (
                                <XCircle size={32} className="text-red-500" />
                            ) : (
                                <window.icon
                                    size={24}
                                    className={`${sidebarOpen ? 'mr-1' : ''} transition-transform duration-300`}
                                    strokeWidth={2}
                                />
                            )}
                            {sidebarOpen && (
                                <div className="flex-grow overflow-hidden">
                                    <div className="font-medium truncate">{window.name}</div>
                                    <div className="text-xs text-gray-500 truncate">
                                        {window.content}
                                    </div>
                                </div>
                            )}
                            {sidebarOpen && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeWindow(window.id);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-110 group-hover:bg-red-100 rounded-full p-1" /* Added hover effect */
                                >
                                    <XCircle size={18} className="text-red-500" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Regular Windows Container */}
        <div className={`flex-grow overflow-y-auto pt-4 space-y-4 px-1`} style={scrollbarStyles}>
          {windows.filter(w => !w.isFullScreen && !w.isMinimized).map((window, index) => (
              <div
                key={window.id}
                className="
                    relative
                    cursor-pointer
                    transition-all
                    duration-500
                    transform
                    perspective-1000
                    origin-left
                    group
                  "
                style={{
                  transform: `
                    translateX(${sidebarOpen ? '0' : '0px'})
                    scale(${sidebarOpen ? '1' : '0.8'})
                  `,
                  opacity: sidebarOpen ? 1 : 0.7,
                  marginLeft: '0px',
                  marginRight: '0px',
                  zIndex: windows.length - index
                }}
                onMouseEnter={() => !sidebarOpen && setHoveredWindowId(window.id)}
                onMouseLeave={() => !sidebarOpen && setHoveredWindowId(null)}
              >
                <div
                    onClick={() => {
                        if (!sidebarOpen) {
                            closeWindow(window.id);
                        } else {
                            handleWindowSelect(window);
                        }
                    }}
                  className={`
                    bg-white
                    shadow-lg
                    border
                    border-gray-200
                    flex
                    items-center
                    overflow-hidden
                    transition-colors
                    duration-300
                    ${sidebarOpen ? 'rounded-lg p-2 pr-10' : 'rounded w-full'} /* Adjusted width when closed */
                    ${!sidebarOpen && hoveredWindowId === window.id ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-gray-100'}
                  `}
                  style={{ height: sidebarOpen ? 'auto' : '40px' }} /* Consistent height */
                >
                  {(!sidebarOpen && hoveredWindowId === window.id) ? (
                      <XCircle size={32} className="text-red-500" />
                  ) : (
                      <window.icon
                          size={24}
                          className={`${sidebarOpen ? 'mr-1' : ''} transition-transform duration-300`}
                          strokeWidth={2}
                      />
                  )}
                  {sidebarOpen && (
                    <div className="flex-grow overflow-hidden">
                      <div className="font-medium truncate">{window.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {window.content}
                      </div>
                    </div>
                  )}
                  {sidebarOpen && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            closeWindow(window.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-110 group-hover:bg-red-100 rounded-full p-1" /* Added hover effect */
                    >
                        <XCircle size={18} className="text-red-500" />
                    </div>
                )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Main Stage Area */}
      <div className="flex-grow relative overflow-hidden">
        {windows.filter(window => !window.isMinimized).map(window => (
          <div
            key={window.id}
            className={`
              absolute
              bg-white
              rounded-xl
              shadow-2xl
              overflow-hidden
              ${window.isActive ? 'border-2 border-blue-500' : ''}
              cursor-move
            `}
            style={{
              width: window.isFullScreen ? 'calc(100% - 80px)' : '500px',
              height: window.isFullScreen ? 'calc(100% - 80px)' : '300px',
              left: window.isFullScreen ? '40px' : window.position.x,
              top: window.isFullScreen ? '40px' : window.position.y,
              zIndex: window.zIndex,
              transition: 'none',
            }}
            onMouseDown={() => handleWindowSelect(window)}
          >
            {/* Window Header */}
            <div
              className="
                bg-gray-100
                p-2
                flex
                justify-between
                items-center
                cursor-move
              "
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent text selection
                startDrag(window.id, e);
              }}
            >
              <div className="flex space-x-2">
                <button
                  onClick={() => closeWindow(window.id)}
                  className="bg-red-500 rounded-full w-3 h-3 hover:bg-red-600"
                ></button>
                <button
                  onClick={() => minimizeWindow(window.id)} // Call minimizeWindow
                  className="bg-yellow-500 rounded-full w-3 h-3 hover:bg-yellow-600"
                ></button>
                <button
                  onClick={() => toggleFullScreen(window.id)}
                  className="bg-green-500 rounded-full w-3 h-3 hover:bg-green-600"
                >
                  {window.isFullScreen ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4">
              <h2 className="text-xl font-semibold">{window.name}</h2>
              <p className="text-gray-600">{window.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StageManagerInterface;