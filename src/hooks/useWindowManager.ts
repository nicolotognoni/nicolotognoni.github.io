import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIsMobile } from './useIsMobile';

import type {
  PortfolioIcon,
  WindowInstance,
  WindowWithDescriptor,
} from '../types/portfolio';

const getMaxZIndex = (instances: WindowInstance[]) =>
  instances.reduce((max, instance) => Math.max(max, instance.zIndex), 0);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const useWindowManager = (icons: PortfolioIcon[]) => {
  const [instances, setInstances] = useState<WindowInstance[]>([]);
  const isMobile = useIsMobile();

  const openWindow = useCallback(
    (itemId: string) => {
      setInstances((current) => {
        const descriptor = icons.find((icon) => icon.id === itemId);
        if (!descriptor) return current;

        const maxZ = getMaxZIndex(current);
        const existing = current.find((item) => item.itemId === itemId);

        if (existing) {
          return current.map((item) =>
            item.itemId === itemId
              ? {
                ...item,
                zIndex: maxZ + 1,
                isMinimized: false,
              }
              : item
          );
        }

        const nextZ = maxZ + 1;
        const safePosition = (() => {
          if (typeof window === 'undefined') {
            return descriptor.window.initialPosition ?? { x: 0, y: 0 };
          }

          // On mobile, skip desktop positioning logic (will be set later)
          if (isMobile) {
            return { x: 0, y: 24 };
          }

          const width = descriptor.window.size.width;
          const height = descriptor.window.size.height ?? 420;

          // Center the window
          const centerX = (window.innerWidth - width) / 2;
          const centerY = (window.innerHeight - height) / 2;

          // Add slight offset for cascading if multiple windows are open
          const offset = (current.length % 10) * 20;

          const targetX = centerX + offset;
          const targetY = centerY + offset;

          const maxX = Math.max(window.innerWidth - width, 16);

          return {
            x: clamp(targetX, 8, maxX),
            y: clamp(targetY, 22, Infinity),
          };
        })();

        const newWindow: WindowInstance = {
          itemId,
          zIndex: nextZ,
          position: safePosition,
          isMinimized: false,
          isMaximized: false,
        };

        // If mobile, set size to full width, 50% height
        if (isMobile && typeof window !== 'undefined') {
          const topBarHeight = 24;
          const dockHeight = 80;
          const maxAvailableHeight = window.innerHeight - topBarHeight - dockHeight;

          const mobileWidth = window.innerWidth;
          // Use 65% height but cap at max available height, min 400px
          const mobileHeight = Math.min(Math.max(window.innerHeight * 0.65, 400), maxAvailableHeight);

          // Position at left edge, centered vertically but respecting top bar
          const centerY = (window.innerHeight - mobileHeight) / 2;
          const safeY = Math.max(centerY, topBarHeight);

          newWindow.position = {
            x: 0,
            y: safeY,
          };
          newWindow.sizeOverride = {
            width: mobileWidth,
            height: mobileHeight,
          };
        }

        return [
          ...current,
          newWindow,
        ];
      });
    },
    [icons, isMobile]
  );

  // Update windows when switching to mobile view to ensure correct positioning
  useEffect(() => {
    if (isMobile) {
      setInstances((current) =>
        current.map((item) => {
          const topBarHeight = 24;
          const dockHeight = 80;
          const maxAvailableHeight = window.innerHeight - topBarHeight - dockHeight;
          const mobileWidth = window.innerWidth;
          const mobileHeight = Math.min(Math.max(window.innerHeight * 0.65, 400), maxAvailableHeight);
          const centerY = (window.innerHeight - mobileHeight) / 2;
          const safeY = Math.max(centerY, topBarHeight);

          return {
            ...item,
            position: {
              x: 0,
              y: safeY,
            },
            sizeOverride: {
              width: mobileWidth,
              height: mobileHeight,
            },
            // Reset maximized state on mobile transition to ensure consistent behavior
            isMaximized: false,
          };
        })
      );
    }
  }, [isMobile]);

  const closeWindow = useCallback((itemId: string) => {
    setInstances((current) => current.filter((item) => item.itemId !== itemId));
  }, []);

  const focusWindow = useCallback((itemId: string) => {
    setInstances((current) => {
      const maxZ = getMaxZIndex(current);
      return current.map((item) =>
        item.itemId === itemId
          ? { ...item, zIndex: maxZ + 1, isMinimized: false }
          : item
      );
    });
  }, []);

  const moveWindow = useCallback((itemId: string, position: WindowInstance['position']) => {
    setInstances((current) =>
      current.map((item) => {
        if (item.itemId !== itemId) {
          return item;
        }

        // Auto-unmaximize when user moves window
        return {
          ...item,
          position,
          isMaximized: false,
          restoreState: undefined,
        };
      })
    );
  }, []);

  const minimizeWindow = useCallback((itemId: string) => {
    setInstances((current) =>
      current.map((item) =>
        item.itemId === itemId ? { ...item, isMinimized: true } : item
      )
    );
  }, []);

  const toggleMaximizeWindow = useCallback(
    (itemId: string) => {
      setInstances((current) => {
        const descriptor = icons.find((icon) => icon.id === itemId);
        if (!descriptor) return current;

        const maxZ = getMaxZIndex(current);

        return current.map((item) => {
          if (item.itemId !== itemId) {
            return item;
          }

          if (item.isMaximized) {
            const restoreState = item.restoreState ?? {
              position: item.position,
              sizeOverride: item.sizeOverride,
            };

            return {
              ...item,
              zIndex: maxZ + 1,
              position: restoreState.position,
              sizeOverride: restoreState.sizeOverride,
              isMaximized: false,
              restoreState: undefined,
            };
          }

          if (typeof window === 'undefined') {
            return item;
          }

          const MOBILE_DOCK_HEIGHT = 80; // Height of Dock on mobile
          const chromeInset = {
            x: isMobile ? 0 : 16,
            y: isMobile ? 24 : 22,
            bottom: isMobile ? MOBILE_DOCK_HEIGHT : 0, // Reserve space for Dock on mobile
          } as const;

          const availableWidth = Math.max(window.innerWidth - chromeInset.x * 2, isMobile ? 300 : 480);
          const availableHeight = Math.max(
            window.innerHeight - (chromeInset.y + chromeInset.bottom),
            320
          );

          const preferredHeight = descriptor.window.size.height ?? availableHeight;

          return {
            ...item,
            zIndex: maxZ + 1,
            position: {
              x: chromeInset.x,
              y: chromeInset.y,
            },
            sizeOverride: {
              width: availableWidth,
              height: isMobile ? availableHeight : Math.max(availableHeight, preferredHeight),
            },
            isMaximized: true,
            isMinimized: false,
            restoreState: {
              position: item.position,
              sizeOverride: item.sizeOverride,
            },
          };
        });
      });
    },
    [icons, isMobile]
  );

  const resizeWindow = useCallback(
    (itemId: string, size: WindowInstance['sizeOverride']) => {
      setInstances((current) =>
        current.map((item) => {
          if (item.itemId !== itemId) {
            return item;
          }

          // Allow resize even when maximized
          return {
            ...item,
            sizeOverride: size,
          };
        })
      );
    },
    []
  );

  const windows: WindowWithDescriptor[] = useMemo(
    () =>
      instances
        .map((instance) => {
          const descriptor = icons.find((icon) => icon.id === instance.itemId);
          if (!descriptor) return undefined;
          return {
            ...descriptor,
            instance,
          } satisfies WindowWithDescriptor;
        })
        .filter((value): value is WindowWithDescriptor => Boolean(value))
        .sort((a, b) => a.instance.zIndex - b.instance.zIndex),
    [icons, instances]
  );

  return {
    windows,
    openWindow,
    closeWindow,
    focusWindow,
    moveWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    resizeWindow,
  };
};

