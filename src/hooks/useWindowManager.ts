import { useCallback, useMemo, useState } from 'react';
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

        return [
          ...current,
          {
            itemId,
            zIndex: nextZ,
            position: safePosition,
            isMinimized: false,
            isMaximized: false,
          },
        ];
      });
    },
    [icons]
  );

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
        if (item.itemId !== itemId || item.isMaximized) {
          return item;
        }

        return {
          ...item,
          position,
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

          const chromeInset = {
            x: isMobile ? 0 : 16,
            y: isMobile ? 24 : 22,
            bottom: 0,
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
              height: Math.max(availableHeight, preferredHeight),
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
          if (item.itemId !== itemId || item.isMaximized) {
            return item;
          }

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

