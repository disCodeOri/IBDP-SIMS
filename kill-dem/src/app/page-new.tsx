"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Maximize2, Minimize2, X, XCircle } from 'lucide-react';

// Utility function for generating unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Interface for Window type to improve type safety
interface Window {
  id: string;
  name: string;
  icon: string;
  content: string;
  isActive: boolean;
  isFullScreen: boolean;
  position: { x: number; y: number };
  zIndex: number;
  rotation: number;
}

const StageManagerInterface: React.FC = () => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to create a new window
  const createNewWindow = () => {
    const newWindow: Window = {
      id: generateId(),
      name: `Window ${windows.length + 1}`,
      icon: `/api/placeholder/40/40`,
      content: `Content for Window ${windows.length + 1}`,
      isActive: true,
      isFullScreen: false,
      position: { 
        x: Math.random() * (window.innerWidth - 500), 
        y: Math.random() * (window.innerHeight - 300) 
      },
      zIndex: windows.length + 1,
      rotation: 0,
    };

    // Reset active state for other windows
    const updatedWindows = windows.map(w => ({ ...w, isActive: false }));
    
    setWindows([...updatedWindows, newWindow]);
  };

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
            rotation: window.isFullScreen ? 0 : 0,
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

    const calculateRotation = (index: number, windowId: string) => {
      const activeWindow = windows.find((w) => w.isActive);
      if (!activeWindow) return 0;
  
      // Determine if this card is before or after the active card.
      const activeIndex = windows.findIndex((w) => w.id === activeWindow.id);
      const currentIndex = windows.findIndex((w) => w.id === windowId);
      
      if (currentIndex === activeIndex) return 0;
  
      // Adjust rotation calculation for a more pronounced effect.
      const rotationScale = 10;
  
      if (currentIndex < activeIndex) {
        return -rotationScale * (activeIndex - currentIndex);
      } else {
        return rotationScale * (currentIndex - activeIndex);
      }
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
          New Window
        </button>

        {/* Minimized Windows Container */}
        <div className="flex-grow overflow-y-auto pt-4 space-y-4 px-2">
          {windows.filter(w => !w.isFullScreen).map((window, index) => (
              <div 
                key={window.id}
                className="
                    cursor-pointer 
                    transition-all 
                    duration-500 
                    transform 
                    perspective-1000 
                    hover:scale-105
                    origin-left
                    relative
                    group
                  "
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `
                    translateX(${sidebarOpen ? '0' : '20px'}) 
                    rotateY(${sidebarOpen ? `${calculateRotation(index, window.id)}deg` : '0deg'})
                    scale(${sidebarOpen ? '1' : '0.8'})
                  `,
                  opacity: sidebarOpen ? 1 : 0.7,
                  transformOrigin: 'left center',
                  perspective: '1000px',
                  marginLeft: sidebarOpen ? '0px' : '20px',
                  marginRight: sidebarOpen ? '0px' : '-40px',
                  zIndex: windows.length - index
                }}
              >
                <div 
                  onClick={() => handleWindowSelect(window)}
                  className="
                    bg-white 
                    rounded-lg 
                    shadow-lg 
                    border 
                    border-gray-200
                    flex 
                    items-center 
                    p-2
                    overflow-hidden
                    pr-10
                    transition-all
                    duration-500
                  "
                  style={{
                    transform: sidebarOpen 
                      ? 'perspective(1000px) rotateY(5deg)' 
                      : 'perspective(1000px) rotateY(0deg)',
                    transformOrigin: 'left center'
                  }}
                >
                  <img 
                    src={window.icon} 
                    alt={window.name} 
                    className="w-10 h-10 mr-3 rounded"
                  />
                  {sidebarOpen && (
                    <div className="flex-grow">
                      <div className="font-medium">{window.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {window.content}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent selecting the window
                    closeWindow(window.id);
                  }}
                  className="
                    absolute 
                    right-2 
                    top-1/2 
                    -translate-y-1/2 
                    text-red-500 
                    hover:text-red-700
                    opacity-0 
                    group-hover:opacity-100 
                    transition-opacity 
                    duration-300
                  "
                >
                  <XCircle size={20} />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Main Stage Area */}
      <div className="flex-grow relative overflow-hidden">
        {windows.map(window => (
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
                  onClick={() => {}}
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