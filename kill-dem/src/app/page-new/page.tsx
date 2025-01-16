"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Calendar, Code, Database, Image, Music, Video, FileText, User, MapPin,
    ArrowUp, Maximize2, Minimize2, X, XCircle, FilePlus, ChevronDown, ChevronRight
} from 'lucide-react';

const icons = [
    Calendar, Code, Database, Image, Music, Video, FileText, User, MapPin,
    ArrowUp, Maximize2, Minimize2, X, XCircle
];

const getRandomIcon = () => icons[Math.floor(Math.random() * icons.length)];

const generateId = () => Math.random().toString(36).substr(2, 9);

interface Window {
    id: string;
    name: string;
    icon: typeof Calendar;
    content: string;
    isActive: boolean;
    isFullScreen: boolean;
    isMinimized: boolean;
    position: { x: number, y: number };
    zIndex: number;
}

interface RepoContentItem {
    name: string;
    path: string;
    type: 'file' | 'dir';
    url: string;
    download_url: string | null;
    sha: string;
}

interface RepoFileTree {
    [path: string]: RepoContentItem | RepoFileTree;
}

const isRepoFileTree = (item: RepoContentItem | RepoFileTree): item is RepoFileTree => {
    return !('type' in item);
};

const StageManagerInterface: React.FC = () => {
    const [windows, setWindows] = useState<Window[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(280);
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);
    const [hoveredWindowId, setHoveredWindowId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);

    const [githubRepoOwner, setGithubRepoOwner] = useState('disCodeOri');
    const [githubRepoName, setGithubRepoName] = useState('WebDeskFileStorage');
    const [githubPAT, setGithubPAT] = useState<string | null>(process.env.NEXT_PUBLIC_GITHUB_PAT || null);
    const [repoFiles, setRepoFiles] = useState<RepoFileTree | null>(null);
    const [isFetchingFiles, setIsFetchingFiles] = useState(true); // Start fetching immediately
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const [filesSectionHeight, setFilesSectionHeight] = useState(300);
    const [windowsSectionHeight, setWindowsSectionHeight] = useState(200);

    const fetchRepoContents = useCallback(async (path: string = '') => {
        if (!githubRepoOwner || !githubRepoName) {
            setFetchError('Please provide the GitHub repository owner and name.');
            return;
        }

        setIsFetchingFiles(true);
        setFetchError(null);

        try {
            const response = await fetch(
                `https://api.github.com/repos/${githubRepoOwner}/${githubRepoName}/contents/${path}`,
                {
                    headers: {
                        Authorization: githubPAT ? `token ${githubPAT}` : '',
                        Accept: 'application/vnd.github.v3+json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch repository contents: ${response.status} - ${response.statusText}`);
            }

            const data: RepoContentItem[] = await response.json();
            return data;
        } catch (error: unknown) {
            console.error('Error fetching repository contents:', error);
            setFetchError(error instanceof Error ? error.message : 'An error occurred while fetching repository contents.');
            return null;
        } finally {
            setIsFetchingFiles(false);
        }
    }, [githubRepoOwner, githubRepoName, githubPAT]);

    const buildFileTree = useCallback(async () => {
        const rootContents = await fetchRepoContents();
        if (!rootContents) return;

        const tree: RepoFileTree = {};

        async function processItems(items: RepoContentItem[], currentTree: RepoFileTree) {
            for (const item of items) {
                if (item.type === 'file') {
                    currentTree[item.path] = item;
                } else if (item.type === 'dir') {
                    currentTree[item.path] = {};
                    const subContents = await fetchRepoContents(item.path);
                    if (subContents) {
                        await processItems(subContents, currentTree[item.path] as RepoFileTree);
                    }
                }
            }
        }

        await processItems(rootContents, tree);
        setRepoFiles(tree);
    }, [fetchRepoContents]);

    useEffect(() => {
        if (githubRepoOwner && githubRepoName) {
            buildFileTree();
        }
    }, [githubRepoOwner, githubRepoName, buildFileTree]);

    const toggleFolder = useCallback((path: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    }, []);

    const renderFileTree = useCallback((tree: RepoFileTree, indent: number = 0) => {
        return Object.entries(tree).map(([path, item]) => {
            const isExpanded = expandedFolders.has(path);
            const marginLeft = 10 + indent * 16;

            if ((item as RepoContentItem).type === 'file') {
                const fileItem = item as RepoContentItem;
                return (
                    <div
                        key={fileItem.path}
                        className="
                            relative
                            cursor-pointer
                            hover:bg-gray-100
                            rounded-md
                            p-1 pl-2
                            flex
                            items-center
                          "
                        style={{ marginLeft }}
                    >
                        <FileText size={14} className="mr-2" />
                        <span className="text-sm truncate">{fileItem.name}</span>
                    </div>
                );
            } else {
                return (
                    <div key={path}>
                        <div
                            className="
                                relative
                                cursor-pointer
                                hover:bg-gray-100
                                rounded-md
                                p-1 pl-2
                                flex
                                items-center
                                justify-between
                              "
                            style={{ marginLeft }}
                            onClick={() => toggleFolder(path)}
                        >
                            <div className="flex items-center">
                                {isExpanded ? (
                                    <ChevronDown size={16} className="mr-2" />
                                ) : (
                                    <ChevronRight size={16} className="mr-2" />
                                )}
                                <Database size={14} className="mr-2" />
                                <span className="text-sm truncate">{path.split('/').pop()}</span>
                            </div>
                        </div>
                        {isExpanded && isRepoFileTree(item) && renderFileTree(item, indent + 1)}
                    </div>
                );
            }
        });
    }, [expandedFolders, toggleFolder]);

    const handleMouseDown = useCallback((event: React.MouseEvent) => {
        setIsResizingSidebar(true);
        const startX = event.clientX;
        const initialWidth = sidebarWidth;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = initialWidth + moveEvent.clientX - startX;
            setSidebarWidth(Math.max(100, newWidth));
        };

        const handleMouseUp = () => {
            setIsResizingSidebar(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [sidebarWidth]);

    const createNewWindow = useCallback(() => {
        const newWindow: Window = {
            id: generateId(),
            name: `Window ${windows.length + 1}`,
            icon: getRandomIcon(),
            content: `Content for Window ${windows.length + 1}`,
            isActive: true,
            isFullScreen: false,
            isMinimized: false,
            position: {
                x: Math.random() * (window.innerWidth - 500),
                y: Math.random() * (window.innerHeight - 300)
            },
            zIndex: windows.length + 1,
        };
        const updatedWindows = windows.map(w => ({ ...w, isActive: false }));
        setWindows([...updatedWindows, newWindow]);
    }, [windows]);

    const handleWindowSelect = useCallback((selectedWindow: Window) => {
        setWindows(windows.map(window => ({
            ...window,
            isActive: window.id === selectedWindow.id,
            zIndex: window.id === selectedWindow.id
                ? Math.max(...windows.map(w => w.zIndex)) + 1
                : window.zIndex
        })));
    }, [windows]);

    const startDrag = useCallback((windowId: string, e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const window = windows.find(w => w.id === windowId);
        if (!window || window.isFullScreen) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const offsetX = e.clientX - window.position.x;
        const offsetY = e.clientY - window.position.y;

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (!containerRef.current) return;
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

    const toggleFullScreen = useCallback((windowId: string) => {
        setWindows(windows.map(window => {
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
        }));
    }, [windows]);

    const closeWindow = useCallback((windowId: string) => {
        const updatedWindows = windows.filter(window => window.id !== windowId);
        if (updatedWindows.length > 0) {
            updatedWindows[updatedWindows.length - 1].isActive = true;
        }
        setWindows(updatedWindows);
    }, [windows]);

    const minimizeWindow = useCallback((windowId: string) => {
        setWindows(prevWindows => {
            const updatedWindows = prevWindows.map(window =>
                window.id === windowId ? { ...window, isMinimized: true, isActive: false } : window
            );
            return updatedWindows;
        });
    }, []);

    const restoreWindow = useCallback((windowId: string) => {
        setWindows(prevWindows => {
            const updatedWindows = prevWindows.map(window =>
                window.id === windowId
                    ? { ...window, isMinimized: false, isActive: true, zIndex: Math.max(...prevWindows.map(win => win.zIndex)) + 1 }
                    : { ...window, isActive: false }
            );
            return updatedWindows;
        });
    }, []);

  const handleResizeSection = useCallback((
    e: React.MouseEvent,
    section: 'minimized' | 'files' | 'windows',
    prevSectionHeightState: number,
    setPrevSectionHeightState: React.Dispatch<React.SetStateAction<number>>,
    nextSectionHeightState: number,
    setNextSectionHeightState: React.Dispatch<React.SetStateAction<number>>
) => {
    e.preventDefault();
    const startY = e.clientY;
    const initialPrevHeight = prevSectionHeightState;
    const initialNextHeight = nextSectionHeightState;

    const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaY = moveEvent.clientY - startY;
        const newPrevHeight = Math.max(50, initialPrevHeight + deltaY);
        const newNextHeight = Math.max(50, initialNextHeight - deltaY);
        setPrevSectionHeightState(newPrevHeight);
        setNextSectionHeightState(newNextHeight);
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}, []);

    const scrollbarStyles: React.CSSProperties = {
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(128, 128, 128, 0.3) transparent',
    };

    const hasVisibleWindows = windows.some(w => !w.isFullScreen && !w.isMinimized);
    const hasRepoFiles = repoFiles && Object.keys(repoFiles).length > 0;

    return (
        <div
            ref={containerRef}
            className="flex h-screen bg-gray-100 overflow-hidden"
        >
            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`
                    bg-white/90 backdrop-blur-lg
                    border-r border-gray-200
                    flex flex-col
                    overflow-hidden
                    shadow-xl
                    z-50
                    relative
                    ${!sidebarOpen ? 'w-16 overflow-x-hidden' : `w-[${sidebarWidth}px]`}
                    ${isResizingSidebar ? 'select-none' : ''}
                `}
                style={{ width: sidebarOpen ? sidebarWidth : '4rem' }}
            >
                {/* Resizer */}
                {sidebarOpen && (
                    <div
                        className="absolute top-0 right-0 h-full w-2 cursor-col-resize select-none"
                        onMouseDown={handleMouseDown}
                    />
                )}
                {/* Sidebar Toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 m-2 hover:bg-gray-100 rounded-full self-start z-50"
                >
                    {sidebarOpen ? <X size={20} /> : <Maximize2 size={20} />}
                </button>

                {sidebarOpen && (
                    <div className="p-4">
                        <label htmlFor="repoOwner" className="block text-sm font-medium text-gray-700">
                            Repository Owner
                        </label>
                        <input
                            type="text"
                            id="repoOwner"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={githubRepoOwner}
                            onChange={(e) => setGithubRepoOwner(e.target.value)}
                        />
                        <label htmlFor="repoName" className="block mt-2 text-sm font-medium text-gray-700">
                            Repository Name
                        </label>
                        <input
                            type="text"
                            id="repoName"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={githubRepoName}
                            onChange={(e) => setGithubRepoName(e.target.value)}
                        />
                        <label htmlFor="githubPAT" className="block mt-2 text-sm font-medium text-gray-700">
                            GitHub PAT (Optional)
                        </label>
                        <input
                            type="password"
                            id="githubPAT"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={githubPAT || ''}
                            onChange={(e) => setGithubPAT(e.target.value)}
                        />
                        <button
                            onClick={buildFileTree}
                            className="mt-4 w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
                            disabled={isFetchingFiles}
                        >
                            {isFetchingFiles ? 'Fetching...' : 'Load Repository'}
                        </button>
                        {fetchError && <p className="text-red-500 text-sm mt-2">{fetchError}</p>}
                    </div>
                )}

                {/* New Window Button */}
                <button
                    onClick={createNewWindow}
                    className="m-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {sidebarOpen ? 'New Window' : <FilePlus size={20} />}
                </button>

                {/* Minimized Windows Container */}
                {windows.some(w => w.isMinimized) && (
                    <div style={{ height: 100, overflowY: 'auto' }}>
                        <div className="px-2 mt-2">
                            <div className="text-sm font-bold text-gray-600">Minimized</div>
                        </div>
                        <div className="space-y-2 px-1" style={scrollbarStyles}>
                            {windows.filter(w => w.isMinimized).map((window) => (
                                <div
                                    key={window.id}
                                    className="
                                        relative
                                        cursor-pointer
                                        group
                                      "
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
                                          ${sidebarOpen ? 'rounded-lg p-2 pr-10' : 'rounded w-full'}
                                          ${!sidebarOpen && hoveredWindowId === window.id ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-gray-100'}
                                        `}
                                        style={{ height: sidebarOpen ? 'auto' : '40px' }}
                                    >
                                        {(!sidebarOpen && hoveredWindowId === window.id) ? (
                                            <XCircle size={32} className="text-red-500" />
                                        ) : (
                                            <window.icon
                                                size={24}
                                                className={`${sidebarOpen ? 'mr-1' : ''}`}
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
                                                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-red-100 rounded-full p-1"
                                            >
                                                <XCircle size={18} className="text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {sidebarOpen && windows.some(w => w.isMinimized) && (
                    <div
                        className="h-1 bg-gray-200 cursor-row-resize"
                        onMouseDown={(e) => handleResizeSection(e, 'minimized', 100, () => { }, filesSectionHeight, setFilesSectionHeight)}
                    />
                )}

                {/* Repository Files Container */}
                {sidebarOpen && hasRepoFiles && (
                    <div style={{ height: `${filesSectionHeight}px`, overflowY: 'auto' }}>
                        <div className="px-2 mt-2">
                            <div className="text-sm font-bold text-gray-600">Files</div>
                        </div>
                        <div className={`px-2`} style={scrollbarStyles}>
                            {fetchError && (
                                <div className="text-red-500 text-sm">{fetchError}</div>
                            )}
                            {isFetchingFiles && (
                                <div>Loading files...</div>
                            )}
                            {renderFileTree(repoFiles)}
                        </div>
                    </div>
                )}
                {sidebarOpen && hasRepoFiles && hasVisibleWindows && (
                <div
                    className="h-1 bg-gray-200 cursor-row-resize"
                    onMouseDown={(e) => handleResizeSection(e, 'files', filesSectionHeight, setFilesSectionHeight, windowsSectionHeight, setWindowsSectionHeight)}
                />
                )}

                {/* Regular Windows Container */}
                {sidebarOpen && hasVisibleWindows && (
                    <div style={{ height: `${windowsSectionHeight}px`, overflowY: 'auto' }}>
                        <div className="px-2 mt-2">
                            <div className="text-sm font-bold text-gray-600">Windows</div>
                        </div>
                        <div className={`space-y-2 px-1`} style={scrollbarStyles}>
                            {windows.filter(w => !w.isFullScreen && !w.isMinimized).map((window) => (
                                <div
                                    key={window.id}
                                    className="
                                    relative
                                    cursor-pointer
                                    group
                                  "
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
                                    ${sidebarOpen ? 'rounded-lg p-2 pr-10' : 'rounded w-full'}
                                    ${!sidebarOpen && hoveredWindowId === window.id ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-gray-100'}
                                  `}
                                        style={{ height: sidebarOpen ? 'auto' : '40px' }}
                                    >
                                        {(!sidebarOpen && hoveredWindowId === window.id) ? (
                                            <XCircle size={32} className="text-red-500" />
                                        ) : (
                                            <window.icon
                                                size={24}
                                                className={`${sidebarOpen ? 'mr-1' : ''}`}
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
                                                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-red-100 rounded-full p-1"
                                            >
                                                <XCircle size={18} className="text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                  {sidebarOpen && hasVisibleWindows && (
                    <div
                      className="h-1 bg-gray-200 cursor-row-resize"
                      onMouseDown={(e) =>
                        handleResizeSection(
                          e,
                          'windows',
                          windowsSectionHeight,
                          setWindowsSectionHeight,
                          0,
                          () => { }
                        )
                      }
                    />
                  )}
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
                                e.preventDefault();
                                startDrag(window.id, e);
                            }}
                        >
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => closeWindow(window.id)}
                                    className="bg-red-500 rounded-full w-3 h-3 hover:bg-red-600"
                                ></button>
                                <button
                                    onClick={() => minimizeWindow(window.id)}
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