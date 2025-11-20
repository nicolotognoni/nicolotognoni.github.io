import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

import type { WindowWithDescriptor } from '../../types/portfolio';

type PortfolioWindowProps = {
  entry: WindowWithDescriptor;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onMove: (id: string, position: WindowWithDescriptor['instance']['position']) => void;
  onMinimize: (id: string) => void;
  onToggleMaximize: (id: string) => void;
  onResize: (id: string, size: WindowWithDescriptor['instance']['sizeOverride']) => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const TrafficLights = ({
  onClose,
  onMinimize,
  onToggleMaximize,
}: {
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
}) => (
  <div className="flex items-center gap-[7px]">
    <button
      type="button"
      aria-label="Close window"
      data-window-control="true"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onClose();
      }}
      className="h-[14px] w-[14px] transition hover:brightness-110"
      style={{
        backgroundImage: 'url(/images/traffic-red.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    />
    <button
      type="button"
      aria-label="Minimize window"
      data-window-control="true"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onMinimize();
      }}
      className="h-[14px] w-[14px] transition hover:brightness-110"
      style={{
        // The source assets have the orange light stored under "traffic-green.png"
        backgroundImage: 'url(/images/traffic-green.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    />
    <button
      type="button"
      aria-label="Toggle full size"
      data-window-control="true"
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onToggleMaximize();
      }}
      className="h-[14px] w-[14px] transition hover:brightness-110"
      style={{
        // The source assets have the green light stored under "traffic-yellow.png"
        backgroundImage: 'url(/images/traffic-yellow.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    />
  </div>
);

const RESIZE_HANDLE_SIZE = 16;

type ResizeDirection =
  | 'n' | 's' | 'e' | 'w'
  | 'ne' | 'nw' | 'se' | 'sw'
  | null;

const PortfolioWindow = ({
  entry,
  onClose,
  onFocus,
  onMove,
  onMinimize,
  onToggleMaximize,
  onResize,
}: PortfolioWindowProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    start: { x: number; y: number };
    initialPosition: { x: number; y: number };
    latestPosition: { x: number; y: number };
    element: HTMLDivElement;
    width: number;
    height: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null>(null);
  const resizeStateRef = useRef<{
    pointerId: number;
    start: { x: number; y: number };
    initialSize: { width: number; height: number };
    initialPosition: { x: number; y: number };
    direction: ResizeDirection;
    element: HTMLDivElement;
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  } | null>(null);

  const resolvedWidth = entry.instance.sizeOverride?.width ?? entry.window.size.width;
  const resolvedHeight = entry.instance.sizeOverride?.height ?? entry.window.size.height;

  const getResizeDirection = (
    clientX: number,
    clientY: number,
    rect: DOMRect
  ): ResizeDirection => {
    const left = rect.left;
    const right = rect.right;
    const top = rect.top;
    const bottom = rect.bottom;

    // Use larger touch target on mobile (44px recommended by Apple)
    const handleSize = isMobile ? 44 : RESIZE_HANDLE_SIZE;

    const nearLeft = clientX - left < handleSize;
    const nearRight = right - clientX < handleSize;
    const nearTop = clientY - top < handleSize;
    const nearBottom = bottom - clientY < handleSize;

    // Top edge is reserved for dragging only, no resize
    // Check corners first (they have priority) - exclude top corners
    if (nearBottom && nearLeft) return 'sw';
    if (nearBottom && nearRight) return 'se';
    // Then check edges - exclude top edge
    if (nearBottom) return 's';
    if (nearLeft) return 'w';
    if (nearRight) return 'e';

    return null;
  };

  const getCursorForDirection = (direction: ResizeDirection): string => {
    switch (direction) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
      default:
        return 'default';
    }
  };

  const updateHoverDirection = (
    clientX: number,
    clientY: number,
    targetElement: HTMLElement | null
  ) => {
    if (resizeStateRef.current || dragStateRef.current) {
      return;
    }

    const target = ref.current;
    if (!target) {
      setResizeDirection(null);
      return;
    }

    // Check resize zones FIRST (before checking header bar)
    // This ensures cursor changes even when near header bar edges
    const rect = target.getBoundingClientRect();
    const direction = getResizeDirection(clientX, clientY, rect);

    // If we're in a resize zone based on coordinates, always set it
    // This takes priority over header bar check
    if (direction) {
      setResizeDirection(direction);
      return;
    }

    // Only disable resize direction when hovering over header bar content
    // AND we're not in a resize zone
    if (targetElement?.closest('[role="presentation"]')) {
      setResizeDirection(null);
      return;
    }

    // No resize zone detected and not on header bar
    setResizeDirection(null);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.buttons !== 0) {
      return;
    }
    updateHoverDirection(event.clientX, event.clientY, event.target as HTMLElement | null);
  };

  const handlePointerMoveHover = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 0) {
      return;
    }
    updateHoverDirection(event.clientX, event.clientY, event.target as HTMLElement | null);
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    updateHoverDirection(event.clientX, event.clientY, event.target as HTMLElement | null);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const target = ref.current;
    if (!target) return;

    const targetElement = event.target as HTMLElement | null;

    // Don't handle if clicking on window controls
    if (targetElement?.closest('[data-window-control="true"]')) {
      return;
    }

    // Check if we're in a resize zone FIRST (before checking header bar)
    // This ensures resize zones work even if they're near the header
    const rect = target.getBoundingClientRect();
    const direction = getResizeDirection(event.clientX, event.clientY, rect);

    if (direction) {
      // If we're in a resize zone, start resize (even if we're near header)
      startResize(event, direction);
      return;
    }

    // Don't handle if clicking on the header bar (let header handle it)
    if (targetElement?.closest('[role="presentation"]')) {
      return;
    }

    // Start drag for the window body
    startDrag(event);
  };

  const handleMouseLeave = () => {
    if (!resizeStateRef.current && !dragStateRef.current) {
      setResizeDirection(null);
    }
  };

  // Add global mouse move listener to detect resize zones even when hovering over child elements
  // This ensures cursor changes when moving mouse over any part of the window
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      const target = ref.current;
      if (!target) return;

      // Only update if not dragging/resizing
      if (resizeStateRef.current || dragStateRef.current) return;

      const rect = target.getBoundingClientRect();
      const isInsideWindow =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (isInsideWindow) {
        // Check if we're over header bar - if so, don't show resize cursor
        const headerBar = target.querySelector('[role="presentation"]');
        if (headerBar) {
          const headerRect = headerBar.getBoundingClientRect();
          const isOverHeader =
            event.clientX >= headerRect.left &&
            event.clientX <= headerRect.right &&
            event.clientY >= headerRect.top &&
            event.clientY <= headerRect.bottom;

          if (isOverHeader) {
            setResizeDirection(null);
            return;
          }
        }

        // Check resize zones based on coordinates
        const direction = getResizeDirection(event.clientX, event.clientY, rect);
        setResizeDirection(direction);
      } else {
        // Reset when mouse leaves window
        setResizeDirection(null);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [entry.instance.isMaximized]);

  const startResize = (event: React.PointerEvent<HTMLDivElement>, direction: ResizeDirection) => {
    if (event.button !== 0 || !direction) return;
    event.preventDefault();
    event.stopPropagation();

    const target = ref.current;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY };
    const initialSize = {
      width: resolvedWidth,
      height: resolvedHeight ?? rect.height,
    };
    const initialPosition = { ...entry.instance.position };

    onFocus(entry.id);
    target.setPointerCapture(event.pointerId);
    target.style.willChange = 'width, height, transform';

    const minWidth = 220;
    const minHeight = 160;
    const MOBILE_DOCK_HEIGHT = 80;
    const chromeInsets = {
      x: isMobile ? 0 : 16,
      y: isMobile ? 24 : 22,
      bottom: isMobile ? MOBILE_DOCK_HEIGHT : 0,
    } as const;
    const maxWidth = Math.max(window.innerWidth - chromeInsets.x * 2, minWidth);
    const maxHeight = Math.max(
      window.innerHeight - chromeInsets.y - chromeInsets.bottom,
      minHeight
    );

    resizeStateRef.current = {
      pointerId: event.pointerId,
      start,
      initialSize,
      initialPosition,
      direction: direction,
      element: target,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,
    };

    setResizeDirection(direction);

    const stopResizing = () => {
      const state = resizeStateRef.current;
      if (!state) return;

      state.element.style.willChange = '';
      if (state.pointerId !== undefined) {
        target.releasePointerCapture(state.pointerId);
      }

      resizeStateRef.current = null;
      setResizeDirection(null);

      globalThis.removeEventListener('pointermove', handleResizeMove);
      globalThis.removeEventListener('pointerup', handleResizeUp);
      globalThis.removeEventListener('pointercancel', handleResizeCancel);
      globalThis.removeEventListener('touchmove', handleResizeTouchMove);
      globalThis.removeEventListener('touchend', handleResizeTouchEnd);
    };

    const handleResizeMove = (moveEvent: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state || moveEvent.pointerId !== state.pointerId) {
        return;
      }

      const deltaX = moveEvent.clientX - state.start.x;
      const deltaY = moveEvent.clientY - state.start.y;

      let newWidth = state.initialSize.width;
      let newHeight = state.initialSize.height;
      let newX = state.initialPosition.x;
      let newY = state.initialPosition.y;

      const dir = state.direction;

      // Handle horizontal resizing (east/west) - no top edge resizing
      if (dir === 'e' || dir === 'se') {
        // Resize from right edge
        newWidth = clamp(state.initialSize.width + deltaX, state.minWidth, state.maxWidth);
      } else if (dir === 'w' || dir === 'sw') {
        // Resize from left edge
        const widthDelta = deltaX;
        newWidth = clamp(state.initialSize.width - widthDelta, state.minWidth, state.maxWidth);
        newX = clamp(state.initialPosition.x + (state.initialSize.width - newWidth), 8, window.innerWidth - newWidth - 8);
      }

      // Handle vertical resizing (south only - top edge is drag-only)
      if (dir === 's' || dir === 'se' || dir === 'sw') {
        // Resize from bottom edge
        newHeight = clamp(state.initialSize.height + deltaY, state.minHeight, state.maxHeight);
      }

      // Apply resize directly without RAF throttling (like ryOS)
      state.element.style.width = `${newWidth}px`;
      state.element.style.height = `${newHeight}px`;
      state.element.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    };

    const handleResizeTouchMove = (moveEvent: TouchEvent) => {
      const state = resizeStateRef.current;
      if (!state || !moveEvent.touches[0]) {
        return;
      }

      moveEvent.preventDefault();

      const deltaX = moveEvent.touches[0].clientX - state.start.x;
      const deltaY = moveEvent.touches[0].clientY - state.start.y;

      let newWidth = state.initialSize.width;
      let newHeight = state.initialSize.height;
      let newX = state.initialPosition.x;
      let newY = state.initialPosition.y;

      const dir = state.direction;

      // Handle vertical resizing (south only on mobile)
      if (dir === 's' || dir === 'se' || dir === 'sw') {
        newHeight = clamp(state.initialSize.height + deltaY, state.minHeight, state.maxHeight);
      }

      // Keep full width on mobile
      if (isMobile) {
        newWidth = window.innerWidth;
        newX = 0;
      }

      // Apply resize directly
      state.element.style.width = `${newWidth}px`;
      state.element.style.height = `${newHeight}px`;
      state.element.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
    };

    const handleResizeUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== event.pointerId) {
        return;
      }
      const state = resizeStateRef.current;
      if (!state) return;

      const parsedWidth = parseInt(state.element.style.width, 10);
      const parsedHeight = parseInt(state.element.style.height, 10);
      const finalWidth = Number.isNaN(parsedWidth) ? state.initialSize.width : parsedWidth;
      const finalHeight = Number.isNaN(parsedHeight) ? state.initialSize.height : parsedHeight;
      const finalX = parseInt(state.element.style.transform.match(/translate3d\(([^,]+)/)?.[1] || '0', 10);
      const finalY = parseInt(state.element.style.transform.match(/,\s*([^,]+)/)?.[1] || '0', 10);

      onResize(entry.id, {
        width: finalWidth,
        height: finalHeight,
      });

      if (finalX !== state.initialPosition.x || finalY !== state.initialPosition.y) {
        onMove(entry.id, { x: finalX, y: finalY });
      }

      stopResizing();
    };

    const handleResizeTouchEnd = () => {
      const state = resizeStateRef.current;
      if (!state) return;

      const parsedWidth = parseInt(state.element.style.width, 10);
      const parsedHeight = parseInt(state.element.style.height, 10);
      const finalWidth = Number.isNaN(parsedWidth) ? state.initialSize.width : parsedWidth;
      const finalHeight = Number.isNaN(parsedHeight) ? state.initialSize.height : parsedHeight;
      const finalX = parseInt(state.element.style.transform.match(/translate3d\(([^,]+)/)?.[1] || '0', 10);
      const finalY = parseInt(state.element.style.transform.match(/,\s*([^,]+)/)?.[1] || '0', 10);

      onResize(entry.id, {
        width: finalWidth,
        height: finalHeight,
      });

      if (finalX !== state.initialPosition.x || finalY !== state.initialPosition.y) {
        onMove(entry.id, { x: finalX, y: finalY });
      }

      stopResizing();
    };

    const handleResizeCancel = (cancelEvent: PointerEvent) => {
      if (cancelEvent.pointerId !== event.pointerId) {
        return;
      }
      stopResizing();
    };

    globalThis.addEventListener('pointermove', handleResizeMove);
    globalThis.addEventListener('pointerup', handleResizeUp);
    globalThis.addEventListener('pointercancel', handleResizeCancel);
    globalThis.addEventListener('touchmove', handleResizeTouchMove, { passive: false });
    globalThis.addEventListener('touchend', handleResizeTouchEnd);
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    // Don't start drag if we're currently resizing
    if (resizeStateRef.current) return;

    event.preventDefault();
    // Only stop propagation if not already stopped (header bar already stops it)
    if (!event.isPropagationStopped()) {
      event.stopPropagation();
    }

    const target = ref.current;
    if (!target) return;

    // Double-check window controls (should already be checked by caller, but safety check)
    const targetElement = event.target as HTMLElement | null;
    if (targetElement?.closest('[data-window-control="true"]')) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY };
    const initialPosition = { ...entry.instance.position };

    onFocus(entry.id);
    target.setPointerCapture(event.pointerId);
    target.style.willChange = 'transform';

    dragStateRef.current = {
      pointerId: event.pointerId,
      start,
      initialPosition,
      latestPosition: initialPosition,
      element: target,
      width: rect.width,
      height: rect.height,
      minX: isMobile ? 0 : 8,
      maxX: isMobile ? window.innerWidth - rect.width : Math.max(window.innerWidth - rect.width, 16),
      minY: isMobile ? 24 : 22,
      maxY: Infinity,
    };
    setResizeDirection(null);

    const stopDragging = () => {
      const state = dragStateRef.current;
      if (!state) return;

      // Cancel any pending animation frame
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      // Apply final position if there's a pending update
      if (pendingPosition) {
        state.latestPosition = pendingPosition;
        state.element.style.transform = `translate3d(${pendingPosition.x}px, ${pendingPosition.y}px, 0)`;
        pendingPosition = null;
      } else {
        state.element.style.transform = `translate3d(${state.latestPosition.x}px, ${state.latestPosition.y}px, 0)`;
      }

      state.element.style.willChange = '';
      target.releasePointerCapture(state.pointerId);

      const moved =
        state.latestPosition.x !== state.initialPosition.x ||
        state.latestPosition.y !== state.initialPosition.y;

      dragStateRef.current = null;

      globalThis.removeEventListener('pointermove', handlePointerMove);
      globalThis.removeEventListener('pointerup', handlePointerUp);
      globalThis.removeEventListener('pointercancel', handlePointerCancel);

      if (moved) {
        onMove(entry.id, state.latestPosition);
      }
    };

    let rafId: number | null = null;
    let pendingPosition: { x: number; y: number } | null = null;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || moveEvent.pointerId !== state.pointerId) {
        return;
      }

      const deltaX = moveEvent.clientX - state.start.x;
      const deltaY = moveEvent.clientY - state.start.y;

      const nextPosition = {
        x: clamp(state.initialPosition.x + deltaX, state.minX, state.maxX),
        y: clamp(state.initialPosition.y + deltaY, state.minY, state.maxY),
      };

      // Skip if position hasn't changed significantly (prevents micro-updates)
      if (
        Math.abs(nextPosition.x - state.latestPosition.x) < 0.5 &&
        Math.abs(nextPosition.y - state.latestPosition.y) < 0.5
      ) {
        return;
      }

      // Store pending position
      pendingPosition = nextPosition;

      // Throttle updates using requestAnimationFrame
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          if (pendingPosition && dragStateRef.current) {
            const currentState = dragStateRef.current;
            currentState.latestPosition = pendingPosition;
            currentState.element.style.transform = `translate3d(${pendingPosition.x}px, ${pendingPosition.y}px, 0)`;
            pendingPosition = null;
          }
          rafId = null;
        });
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== event.pointerId) {
        return;
      }
      stopDragging();
    };

    const handlePointerCancel = (cancelEvent: PointerEvent) => {
      if (cancelEvent.pointerId !== event.pointerId) {
        return;
      }
      stopDragging();
    };

    globalThis.addEventListener('pointermove', handlePointerMove);
    globalThis.addEventListener('pointerup', handlePointerUp);
    globalThis.addEventListener('pointercancel', handlePointerCancel);
  };

  const isMobile = useIsMobile();

  const baseHeight: number | 'auto' = resolvedHeight ?? 'auto';

  const style: React.CSSProperties = {
    transform: `translate3d(${entry.instance.position.x}px, ${entry.instance.position.y}px, 0)`,
    zIndex: entry.instance.zIndex,
    width: resolvedWidth,
    height: baseHeight,
    maxWidth: isMobile ? '100vw' : 'calc(100vw - 32px)',
    maxHeight: isMobile ? '100vh' : 'calc(100vh - 22px)',
    willChange: entry.instance.isMaximized ? 'auto' : 'transform',
  };

  const { Component } = entry.window;

  // Determine cursor - prioritize resize cursor if active or hovering
  const getCurrentCursor = () => {
    if (resizeStateRef.current) {
      return getCursorForDirection(resizeStateRef.current.direction);
    }
    if (resizeDirection) {
      return getCursorForDirection(resizeDirection);
    }
    if (dragStateRef.current) {
      return 'grabbing';
    }
    return 'default';
  };

  return (
    <div
      ref={ref}
      style={{
        ...style,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.15) inset',
        cursor: getCurrentCursor(),
      }}
      className="pointer-events-auto absolute overflow-hidden rounded-lg bg-lion-windowBg flex flex-col"
      onMouseDown={() => onFocus(entry.id)}
      onMouseMove={!isMobile ? handleMouseMove : undefined}
      onMouseEnter={!isMobile ? handleMouseEnter : undefined}
      onMouseLeave={!isMobile ? handleMouseLeave : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMoveHover}
    >
      <div
        role="presentation"
        className={`flex select-none items-center justify-between px-3 py-[6px] text-[10px] text-slate-700 ${entry.instance.isMaximized ? 'cursor-default' : 'cursor-grab'
          }`}
        style={{
          backgroundImage: 'linear-gradient(180deg, #ebebeb 0%, #d7d7d7 50%, #cacaca 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
          borderBottom: '1px solid #a0a0a0'
        }}
        onPointerDown={(e) => {
          const targetElement = e.target as HTMLElement | null;
          if (targetElement?.closest('[data-window-control="true"]')) {
            e.stopPropagation();
            return;
          }
          // Reset resize direction to ensure drag can start
          setResizeDirection(null);
          // Prevent the main container's handlePointerDown from interfering
          e.stopPropagation();
          startDrag(e);
        }}
      >
        <TrafficLights
          onClose={() => onClose(entry.id)}
          onMinimize={() => onMinimize(entry.id)}
          onToggleMaximize={() => onToggleMaximize(entry.id)}
        />
        <div className="flex flex-1 items-center justify-center">
          <span
            className="text-[9px] font-semibold text-[#464646]"
            style={{
              textShadow: '0 1px 0 rgba(255,255,255,0.9)'
            }}
          >
            {entry.window.title}
          </span>
        </div>
        <div className="w-[60px]" />
      </div>

      <div
        data-window-content
        className="min-h-[180px] flex-1 bg-[#ededed] text-[10px] leading-[1.55] text-slate-800 overflow-auto break-words min-w-0 px-1.5"
        style={{
          backgroundImage: 'linear-gradient(180deg, #ededed 0%, #e0e0e0 100%)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#a0a0a0 #ededed',
        }}
      >
        <div className="h-full w-full min-w-0 max-w-full">
          <Component />
        </div>
      </div>

      {/* Physical resize handle for mobile touch support */}
      <div
        className="absolute bottom-0 left-0 right-0 cursor-s-resize pointer-events-auto"
        style={{
          height: isMobile ? '24px' : '8px',
          touchAction: 'none',
          zIndex: 1000,
        }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startResize(e, 's');
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const pointerEvent = {
            ...e,
            pointerId: 1,
            pressure: 0.5,
            tangentialPressure: 0,
            tiltX: 0,
            tiltY: 0,
            twist: 0,
            pointerType: 'mouse' as const,
            isPrimary: true,
            width: 1,
            height: 1,
          } as React.PointerEvent<HTMLDivElement>;
          startResize(pointerEvent, 's');
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const pointerEvent = {
            ...e,
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY,
            button: 0,
            pointerId: e.touches[0].identifier,
            currentTarget: e.currentTarget,
            target: e.target,
            preventDefault: () => e.preventDefault(),
            stopPropagation: () => e.stopPropagation(),
          } as unknown as React.PointerEvent<HTMLDivElement>;
          startResize(pointerEvent, 's');
        }}
      />
    </div>
  );
};

export default PortfolioWindow;

