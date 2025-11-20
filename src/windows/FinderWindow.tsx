import { useState, useRef, useCallback } from 'react';
import { portfolioIcons } from '../data/portfolio';
import { useIsMobile } from '../hooks/useIsMobile';
import type { ReactNode } from 'react';

type FileItem = {
  name: string;
  path: string;
  isDirectory: boolean;
  icon?: string | ReactNode;
  appId?: string;
};

const FinderWindow = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [history, setHistory] = useState<string[]>(['/']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const pathInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Root folders like macOS Finder
  const rootFolders: FileItem[] = [
    {
      name: 'Desktop',
      path: '/Desktop',
      isDirectory: true,
      icon: '/icons/ToolbarDesktopFolderIcon.png',
    },
    {
      name: 'Articles',
      path: '/Articles',
      isDirectory: false,
      icon: '/icons/GenericFolderIcon.png',
      appId: 'articles',
    },
    {
      name: 'Trash',
      path: '/Trash',
      isDirectory: true,
      icon: '/icons/FullTrashIcon.png',
    },
  ];

  // Desktop folder items (Projects, Resume, Recapy, and BendingSpoon Cover Letter)
  const getDesktopItems = (): FileItem[] => {
    return portfolioIcons
      .filter((icon) => icon.id === 'projects' || icon.id === 'resume' || icon.id === 'recapy' || icon.id === 'bending-spoon-cover-letter')
      .map((icon) => ({
        name: icon.label,
        path: `/Desktop/${icon.id}`,
        isDirectory: false,
        icon: icon.icon,
        appId: icon.id,
      }));
  };

  // Applications folder shows portfolio apps (excluding finder, projects, resume, recapy, articles)
  const getApplications = (): FileItem[] => {
    const portfolioApps = portfolioIcons
      .filter((icon) => icon.id !== 'finder' && icon.id !== 'projects' && icon.id !== 'resume' && icon.id !== 'recapy' && icon.id !== 'articles' && icon.id !== 'bending-spoon-cover-letter')
      .map((icon) => ({
        name: icon.label,
        path: `/Applications/${icon.id}`,
        isDirectory: false,
        icon: icon.icon,
        appId: icon.id,
      }));

    // Add Twitter/X app
    const twitterApp: FileItem = {
      name: 'Twitter',
      path: '/Applications/twitter',
      isDirectory: false,
      icon: '/icons/twitter1.jpg',
      appId: 'twitter',
    };

    return [...portfolioApps, twitterApp];
  };

  // Get files/folders for current path
  const getFilesForPath = (path: string): FileItem[] => {
    if (path === '/') {
      // At root, show folders and applications directly (not in Applications folder)
      const applications = getApplications();
      return [...rootFolders, ...applications];
    } else if (path === '/Desktop') {
      return getDesktopItems();
    } else {
      // Empty for other folders for now
      return [];
    }
  };

  const navigateToPath = useCallback(
    (newPath: string) => {
      const trimmedPath = newPath.trim() || '/';
      const normalizedPath = trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;

      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(normalizedPath);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentPath(normalizedPath);
    },
    [history, historyIndex]
  );

  const navigateBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
    }
  }, [history, historyIndex]);

  const navigateForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
    }
  }, [history, historyIndex]);

  const navigateUp = useCallback(() => {
    if (currentPath !== '/') {
      const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
      navigateToPath(parentPath);
    }
  }, [currentPath, navigateToPath]);

  const handleFileDoubleClick = (file: FileItem) => {
    // On mobile, single click should probably work like double click, but let's stick to double click or maybe add single click handler for mobile if needed.
    // Actually, for better mobile UX, maybe we should use onClick instead of onDoubleClick for mobile?
    // But standard behavior is double click. Let's keep it consistent for now, or maybe make it single click for mobile.
    if (file.isDirectory) {
      navigateToPath(file.path);
    } else if (file.appId) {
      // Special handling for external links
      if (file.appId === 'recapy') {
        window.open('https://recapy.framer.ai', '_blank');
      } else if (file.appId === 'twitter') {
        window.open('https://x.com/Nicolo_Tognoni', '_blank');
      } else {
        // Dispatch custom event to open the application
        const event = new CustomEvent('openWindowFromFinder', {
          detail: { appId: file.appId },
        });
        window.dispatchEvent(event);
      }
    }
  };

  const handlePathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathInputRef.current) {
      navigateToPath(pathInputRef.current.value);
    }
  };

  const getDisplayPath = (path: string): string => {
    if (path === '/') return '/';
    return path;
  };

  const canNavigateBack = historyIndex > 0;
  const canNavigateForward = historyIndex < history.length - 1;
  const files = getFilesForPath(currentPath);
  const windowTitle = currentPath === '/' ? 'Macintosh HD' : currentPath.split('/').pop() || 'Finder';

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white text-[11px]">
      {/* Toolbar */}
      <div className={`flex items-center gap-1 border-b border-[#c1c8d4] bg-gradient-to-b from-[#f5f5f7] via-[#e8e8ec] to-[#d8d8dc] ${isMobile ? 'px-2 py-2' : 'px-2 py-1.5'}`}>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={navigateBack}
            disabled={!canNavigateBack}
            className={`flex items-center justify-center rounded border border-[#a0a0a0] bg-gradient-to-b from-white to-[#e8e8e8] text-[11px] font-semibold text-[#4a5260] shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition hover:bg-gradient-to-b hover:from-[#f0f0f0] hover:to-[#d7d7d7] disabled:opacity-50 disabled:cursor-not-allowed ${isMobile ? 'h-8 w-8' : 'h-6 w-6'}`}
            aria-label="Go back"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={navigateForward}
            disabled={!canNavigateForward}
            className={`flex items-center justify-center rounded border border-[#a0a0a0] bg-gradient-to-b from-white to-[#e8e8e8] text-[11px] font-semibold text-[#4a5260] shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition hover:bg-gradient-to-b hover:from-[#f0f0f0] hover:to-[#d7d7d7] disabled:opacity-50 disabled:cursor-not-allowed ${isMobile ? 'h-8 w-8' : 'h-6 w-6'}`}
            aria-label="Go forward"
          >
            ›
          </button>
          <button
            type="button"
            onClick={navigateUp}
            disabled={currentPath === '/'}
            className={`flex items-center justify-center rounded border border-[#a0a0a0] bg-gradient-to-b from-white to-[#e8e8e8] text-[11px] font-semibold text-[#4a5260] shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition hover:bg-gradient-to-b hover:from-[#f0f0f0] hover:to-[#d7d7d7] disabled:opacity-50 disabled:cursor-not-allowed ${isMobile ? 'h-8 w-8' : 'h-6 w-6'}`}
            aria-label="Go up"
          >
            ↑
          </button>
        </div>

        {/* Path bar - hide on mobile if space is tight, or make it flex-1 */}
        {!isMobile && (
          <form onSubmit={handlePathSubmit} className="ml-2 flex flex-1 items-center">
            <input
              ref={pathInputRef}
              type="text"
              value={getDisplayPath(currentPath)}
              onChange={(e) => {
                // Allow editing
              }}
              onFocus={(e) => e.target.select()}
              className="flex-1 rounded border border-[#a0a0a0] bg-white px-2 py-1 text-[11px] text-[#1f2530] shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-1 focus:ring-[#4da3ff]"
              placeholder="Enter path"
            />
          </form>
        )}
        {isMobile && (
          <div className="ml-2 flex-1 truncate text-center font-semibold text-[#4a5260]">
            {windowTitle}
          </div>
        )}
      </div>

      {/* Content Area - Icon View */}
      <div className="flex-1 overflow-auto border-b border-[#c1c8d4] bg-gradient-to-b from-[#fbfbfd] via-[#f0f2f6] to-[#e1e5ec]">
        <div className={`grid auto-rows-max gap-x-4 gap-y-6 p-4 ${isMobile ? 'grid-cols-[repeat(auto-fill,minmax(70px,1fr))]' : 'grid-cols-[repeat(auto-fill,minmax(80px,80px))]'}`}>
          {files.map((file) => (
            <div
              key={file.path}
              onClick={() => isMobile ? handleFileDoubleClick(file) : undefined}
              onDoubleClick={() => !isMobile ? handleFileDoubleClick(file) : undefined}
              className="group flex cursor-pointer flex-col items-center gap-1 rounded p-2 transition hover:bg-white/50 active:bg-blue-200/50"
            >
              <div
                className="relative flex items-center justify-center"
                style={
                  file.appId === 'resume' || (typeof file.icon === 'string' && file.icon.includes('CV_data_analyst'))
                    ? { height: isMobile ? '56px' : '64px', width: 'auto' }
                    : file.appId === 'bending-spoon-cover-letter'
                      ? { height: isMobile ? '40px' : '48px', width: 'auto' }
                      : file.appId === 'twitter'
                        ? { height: isMobile ? '56px' : '64px', width: isMobile ? '56px' : '64px', borderRadius: '25%', overflow: 'hidden' }
                        : { height: isMobile ? '56px' : '64px', width: isMobile ? '56px' : '64px', borderRadius: '22%', overflow: 'hidden' }
                }
              >
                {file.icon ? (
                  typeof file.icon === 'string' ? (
                    <img
                      src={file.icon}
                      alt={file.name}
                      className={
                        file.appId === 'resume' || file.icon.includes('CV_data_analyst') || file.appId === 'bending-spoon-cover-letter'
                          ? 'h-full w-auto object-contain [image-rendering:pixelated]'
                          : 'h-full w-full object-cover [image-rendering:pixelated]'
                      }
                      style={{
                        borderRadius: file.appId === 'resume' || file.icon.includes('CV_data_analyst') || file.appId === 'bending-spoon-cover-letter'
                          ? '0'
                          : file.appId === 'twitter'
                            ? '25%'
                            : '22%',
                      }}
                    />
                  ) : (
                    <div
                      className="h-full w-full flex items-center justify-center"
                      style={{ borderRadius: '22%', overflow: 'hidden' }}
                    >
                      {file.icon}
                    </div>
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded border border-[#c1c8d4] bg-gradient-to-br from-[#e8e8ec] to-[#d8d8dc]">
                    {file.isDirectory ? (
                      <svg
                        className="h-8 w-8 text-[#6b7280]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-8 w-8 text-[#6b7280]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              <span className="max-w-[80px] truncate text-center text-[11px] text-[#1f2530] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                {file.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between border-t border-[#c6ccd8] bg-gradient-to-b from-[#eef1f6] via-[#e4e7ee] to-[#d7dbe4] px-3 py-1.5 text-[11px] text-[#4a5260]">
        <span>
          {files.length} item{files.length !== 1 ? 's' : ''}
        </span>
        <span>213.74 GB available</span>
      </div>
    </div>
  );
};

export default FinderWindow;
