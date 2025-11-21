import { useMemo, useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

import type {
  PortfolioIcon,
  WindowWithDescriptor,
} from '../../types/portfolio';
import Dock from './Dock';
import DesktopIcon from './DesktopIcon';
import MenuBar from './MenuBar';
import PortfolioWindow from './PortfolioWindow';

type DesktopProps = {
  icons: PortfolioIcon[];
  windows: WindowWithDescriptor[];
  onOpenWindow: (id: string) => void;
  onCloseWindow: (id: string) => void;
  onFocusWindow: (id: string) => void;
  onMoveWindow: (
    id: string,
    position: WindowWithDescriptor['instance']['position']
  ) => void;
  onMinimizeWindow: (id: string) => void;
  onToggleMaximizeWindow: (id: string) => void;
  onResizeWindow: (
    id: string,
    size: WindowWithDescriptor['instance']['sizeOverride']
  ) => void;
};

const Desktop = ({
  icons,
  windows,
  onOpenWindow,
  onCloseWindow,
  onFocusWindow,
  onMoveWindow,
  onMinimizeWindow,
  onToggleMaximizeWindow,
  onResizeWindow,
}: DesktopProps) => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const activeWindowIds = useMemo(
    () => new Set(windows.map((entry) => entry.id)),
    [windows]
  );

  return (
    <div className="relative flex h-full w-full select-none flex-col text-white">
      <MenuBar />

      <div className="noise-overlay" aria-hidden />

      <main
        className="relative flex h-full flex-1"
        onClick={() => setSelectedIcon(null)}
        role="presentation"
      >
        <div className="pointer-events-none relative flex-1">
          <div className={`pointer-events-auto absolute inset-0 flex flex-col justify-between ${isMobile ? 'px-4 pb-24 pt-14' : 'px-8 pb-36 pt-8 sm:px-10'}`}>
            {/* Desktop icons in top right */}
            <div className={`absolute ${isMobile ? 'right-4 top-14' : 'right-8 top-8 sm:right-10 sm:top-10'}`}>
              <div className="flex flex-col gap-3">
                {icons
                  .filter((icon) => icon.id === 'projects' || icon.id === 'resume' || icon.id === 'recapy' || icon.id === 'bending-spoon-cover-letter')
                  .map((icon) => (
                    <DesktopIcon
                      key={icon.id}
                      label={icon.label}
                      icon={icon.icon}
                      accentColor={icon.accentColor}
                      selected={selectedIcon === icon.id}
                      onSelect={() => setSelectedIcon(icon.id)}
                      onOpen={() => {
                        if (icon.id === 'recapy') {
                          // Open Recapy link directly without opening a window
                          window.open('https://recapy.framer.ai', '_blank');
                        } else {
                          onOpenWindow(icon.id);
                        }
                      }}
                      iconId={icon.id}
                    />
                  ))}
              </div>
            </div>

            {/* Explanation rectangle removed */}
          </div>

          {windows
            .filter((entry) => !entry.instance.isMinimized)
            .map((entry) => (
              <PortfolioWindow
                key={entry.id}
                entry={entry}
                onClose={onCloseWindow}
                onFocus={onFocusWindow}
                onMove={onMoveWindow}
                onMinimize={onMinimizeWindow}
                onToggleMaximize={onToggleMaximizeWindow}
                onResize={onResizeWindow}
              />
            ))}
        </div>
      </main>

      <Dock
        icons={icons.filter((icon) => !icon.hiddenFromDock && icon.id !== 'projects' && icon.id !== 'resume' && icon.id !== 'recapy' && icon.id !== 'articles' && icon.id !== 'bending-spoon-cover-letter')}
        onOpen={onOpenWindow}
        activeIconIds={activeWindowIds}
      />
    </div>
  );
};

export default Desktop;

