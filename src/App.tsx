import { useCallback, useEffect } from 'react';

import Desktop from './components/desktop/Desktop';
import { portfolioIcons } from './data/portfolio';
import { useWindowManager } from './hooks/useWindowManager';

const App = () => {
  const {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    moveWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    resizeWindow,
  } = useWindowManager(portfolioIcons);

  const handleOpenWindow = useCallback(
    (id: string) => {
      openWindow(id);
    },
    [openWindow]
  );

  const handleCloseWindow = useCallback(
    (id: string) => {
      closeWindow(id);
    },
    [closeWindow]
  );

  useEffect(() => {
    handleOpenWindow('finder');
  }, [handleOpenWindow]);

  // Listen for window open events from Finder
  useEffect(() => {
    const handleOpenWindowFromFinder = (event: Event) => {
      const customEvent = event as CustomEvent<{ appId: string }>;
      if (customEvent.detail?.appId) {
        handleOpenWindow(customEvent.detail.appId);
      }
    };

    window.addEventListener('openWindowFromFinder', handleOpenWindowFromFinder);
    return () => {
      window.removeEventListener('openWindowFromFinder', handleOpenWindowFromFinder);
    };
  }, [handleOpenWindow]);

  return (
    <div className="h-full w-full overflow-hidden relative">
      {/* Fixed background for mobile compatibility */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: '#1a1a1a',
          backgroundImage: 'url(https://nicolotognoni.github.io/images/wallpaper/c2n0dqrs9fld1.jpeg)',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <Desktop
        icons={portfolioIcons}
        windows={windows}
        onOpenWindow={handleOpenWindow}
        onCloseWindow={handleCloseWindow}
        onFocusWindow={focusWindow}
        onMoveWindow={moveWindow}
        onMinimizeWindow={minimizeWindow}
        onToggleMaximizeWindow={toggleMaximizeWindow}
        onResizeWindow={resizeWindow}
      />
    </div>
  );
};

export default App;

