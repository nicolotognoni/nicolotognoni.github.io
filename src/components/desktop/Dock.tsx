import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import type { PortfolioIcon } from '../../types/portfolio';
import { useIsMobile } from '../../hooks/useIsMobile';

type DockProps = {
  icons: PortfolioIcon[];
  onOpen: (id: string) => void;
  activeIconIds?: Set<string>;
};

const BASE_ICON_SIZE = 48;
const MOBILE_ICON_SIZE = 40;
const MAX_SCALE = 2.0;
const MAGNIFICATION_RANGE = 100;
const ICON_SPACING = 10;
const MOBILE_ICON_SPACING = 6;
const LIFT_DISTANCE = 16;
const REFLECTION_RATIO = 0.55;
const REFLECTION_GAP = 4;

type DockIconProps = {
  item: PortfolioIcon;
  isActive: boolean;
  onSelect: (id: string) => void;
  mouseX: MotionValue<number>;
  isMobile: boolean;
};

const DockIcon = ({ item, isActive, onSelect, mouseX, isMobile }: DockIconProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const distance = useTransform(mouseX, (value) => {
    const bounds = wrapperRef.current?.getBoundingClientRect();
    if (!bounds || !Number.isFinite(value)) {
      return Infinity;
    }
    return value - (bounds.left + bounds.width / 2);
  });

  const baseSize = isMobile ? MOBILE_ICON_SIZE : BASE_ICON_SIZE;

  const size = useTransform(
    distance,
    [-MAGNIFICATION_RANGE, 0, MAGNIFICATION_RANGE],
    [baseSize, isMobile ? baseSize : baseSize * MAX_SCALE, baseSize],
    { clamp: true },
  );

  const sizeSpring = useSpring(size, {
    mass: 0.28,
    stiffness: 320,
    damping: 28,
  });

  const lift = useTransform(
    distance,
    [-MAGNIFICATION_RANGE, 0, MAGNIFICATION_RANGE],
    [0, isMobile ? 0 : -LIFT_DISTANCE, 0],
    { clamp: true },
  );

  const liftSpring = useSpring(lift, {
    mass: 0.3,
    stiffness: 320,
    damping: 28,
  });

  const reflectionOffset = useTransform(
    distance,
    [-MAGNIFICATION_RANGE, 0, MAGNIFICATION_RANGE],
    [0, isMobile ? 0 : 8, 0],
    { clamp: true },
  );

  const reflectionSpring = useSpring(reflectionOffset, {
    mass: 0.26,
    stiffness: 320,
    damping: 28,
  });

  const reflectionHeight = useTransform(sizeSpring, (value) => value * REFLECTION_RATIO);
  const reflectionTop = useTransform(sizeSpring, (value) => value + REFLECTION_GAP);
  const reflectionOpacity = useTransform(
    distance,
    [-MAGNIFICATION_RANGE, 0, MAGNIFICATION_RANGE],
    [0.85, 1, 0.85],
    { clamp: true },
  );
  const glyphFontSize = useTransform(sizeSpring, (value) => value * 0.74);
  const glyphReflectionFontSize = useTransform(sizeSpring, (value) => value * 0.64);

  const handleClick = useCallback(() => {
    onSelect(item.id);
  }, [item.id, onSelect]);

  const isImageIcon = typeof item.icon === 'string' && item.icon.endsWith('.png');

  return (
    <motion.div
      ref={wrapperRef}
      className="group relative flex flex-col items-center"
      style={{
        width: sizeSpring,
        height: sizeSpring,
        marginLeft: isMobile ? MOBILE_ICON_SPACING / 2 : ICON_SPACING / 2,
        marginRight: isMobile ? MOBILE_ICON_SPACING / 2 : ICON_SPACING / 2,
        transformOrigin: 'bottom center',
        pointerEvents: 'auto',
        flexShrink: 0, // Prevent shrinking in flex container
      }}
    >
      <motion.button
        type="button"
        onClick={handleClick}
        aria-label={`Open ${item.label}`}
        title={item.label}
        className="relative flex h-full w-full flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        style={{
          translateY: liftSpring,
          willChange: 'transform',
        }}
      >
        {isImageIcon ? (
          <img
            src={item.icon as string}
            alt={item.label}
            draggable={false}
            className="relative z-10 h-full w-full object-contain"
            style={{
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))',
            }}
          />
        ) : (
          <motion.span
            className="relative z-10 select-none"
            style={{
              color: item.accentColor,
              fontSize: glyphFontSize,
              lineHeight: 1,
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))',
            }}
          >
            {item.icon}
          </motion.span>
        )}
      </motion.button>

      <motion.div
        className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 transform items-start justify-center overflow-hidden"
        style={{
          top: reflectionTop,
          width: sizeSpring,
          height: reflectionHeight,
          translateY: reflectionSpring,
          opacity: reflectionOpacity,
          zIndex: 3,
        }}
      >
        {isImageIcon ? (
          <motion.img
            src={item.icon as string}
            alt={`${item.label} reflection`}
            aria-hidden="true"
            draggable={false}
            className="h-full w-full object-contain"
            style={{
              transformOrigin: 'center bottom',
              scaleY: -1,
              filter: 'brightness(1.08)',
              maskImage:
                'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0.3) 76%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0.3) 76%, transparent 100%)',
            }}
          />
        ) : (
          <motion.span
            aria-hidden="true"
            className="select-none"
            style={{
              color: item.accentColor,
              fontSize: glyphReflectionFontSize,
              lineHeight: 1,
              transformOrigin: 'center bottom',
              scaleY: -1,
              filter: 'brightness(1.08)',
              maskImage:
                'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0.3) 76%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0.3) 76%, transparent 100%)',
              opacity: 0.9,
            }}
          >
            {item.icon}
          </motion.span>
        )}
      </motion.div>

      {isActive ? (
        <div
          className="pointer-events-none absolute"
          style={{
            bottom: -12,
            width: 4,
            height: 4,
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.92)',
            boxShadow: '0 0 6px rgba(255,255,255,0.75)',
          }}
        />
      ) : null}
    </motion.div>
  );
};

const Dock = ({ icons, onOpen, activeIconIds }: DockProps) => {
  const mouseX = useMotionValue<number>(Infinity);
  const [magnifyEnabled, setMagnifyEnabled] = useState(true);
  const iconsContainerRef = useRef<HTMLDivElement>(null);
  const [dockWidth, setDockWidth] = useState(400);
  const isMobile = useIsMobile();

  // Calculate dock width based on actual icon container width
  // Measure the actual width of the icons container and add padding
  const updateDockWidth = useCallback(() => {
    if (iconsContainerRef.current) {
      const containerWidth = iconsContainerRef.current.offsetWidth;
      // Add padding on both sides (120px each) so the dock extends beyond the icons
      const calculatedWidth = containerWidth + (isMobile ? 200 : 240);
      setDockWidth(Math.max(200, calculatedWidth));
    }
  }, [isMobile]);

  // Use layout effect to measure after render
  useLayoutEffect(() => {
    updateDockWidth();
    // Also check after a small delay to ensure icons are fully rendered
    const timeoutId = setTimeout(updateDockWidth, 100);
    return () => clearTimeout(timeoutId);
  }, [icons.length, updateDockWidth]);

  // Use ResizeObserver to watch for container size changes
  useEffect(() => {
    if (!iconsContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateDockWidth();
    });

    resizeObserver.observe(iconsContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateDockWidth]);

  useEffect(() => {
    const compute = () => {
      if (isMobile) {
        setMagnifyEnabled(false);
        return;
      }

      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        setMagnifyEnabled(true);
        return;
      }

      const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const noHover = window.matchMedia('(hover: none)').matches;
      setMagnifyEnabled(!(coarsePointer || noHover));
    };

    compute();

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const pointerQuery = window.matchMedia('(pointer: coarse)');
    const hoverQuery = window.matchMedia('(hover: none)');

    const removeListeners: Array<() => void> = [];
    const attach = (mql: MediaQueryList) => {
      if (typeof mql.addEventListener === 'function') {
        const handler = () => compute();
        mql.addEventListener('change', handler);
        removeListeners.push(() => mql.removeEventListener('change', handler));
      } else if (typeof mql.addListener === 'function') {
        const handler = () => compute();
        mql.addListener(handler);
        removeListeners.push(() => mql.removeListener(handler));
      }
    };

    attach(pointerQuery);
    attach(hoverQuery);

    return () => {
      removeListeners.forEach((fn) => fn());
    };
  }, [isMobile]);

  useEffect(() => {
    if (!magnifyEnabled) {
      mouseX.set(Infinity);
    }
  }, [magnifyEnabled, mouseX]);

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      mouseX.set(event.clientX);
    },
    [mouseX],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(Infinity);
  }, [mouseX]);

  return (
    <footer
      className={`fixed inset-x-0 bottom-0 z-[100] ${isMobile
        ? 'flex overflow-hidden justify-center items-end h-[140px]'
        : 'flex justify-center pointer-events-none'
        }`}
      style={{
        // Ensure safe area on mobile
        paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : 0,
      }}
    >
      <div
        className={`relative flex justify-center pb-1 ${isMobile ? 'pointer-events-auto flex-shrink-0 mx-auto' : 'pointer-events-none'
          }`}
        style={{ width: `${dockWidth}px` }}
      >
        {/* Container principale del dock con prospettiva - più alto e più largo */}
        <div
          className="pointer-events-none absolute left-0 right-0 bottom-0 h-[96px] origin-bottom"
          style={{
            transform: 'perspective(550px) rotateX(60deg)',
            transformStyle: 'preserve-3d',
            width: '100%',
          }}
        >
          {/* Riflesso del wallpaper - NITIDO SENZA BLUR per vedere i dettagli */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: 'polygon(16% 5%, 84% 5%, 82% 100%, 18% 100%)',
              zIndex: 1,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'url(/images/wallpaper/c2n0dqrs9fld1.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center 60%',
                transform: 'scaleY(-1)',
                opacity: 0.85,
                filter: 'brightness(0.75)',
              }}
            />
          </div>

          {/* Superficie di vetro del dock - con forma a S CHIARA a metà */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(16% 5%, 84% 5%, 82% 100%, 18% 100%)',
              zIndex: 2,
            }}
          >
            {/* Parte superiore CHIARA del dock (sopra la linea S) */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(252,255,255,0.62) 0%, rgba(236,242,248,0.52) 32%, rgba(216,226,238,0.45) 54%, transparent 58%)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
              }}
            />

            {/* Linea divisoria a S - MOLTO CHIARA - a metà del dock */}
            <div
              className="absolute left-0 right-0 top-[46%] h-[9%]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(240,245,250,0.52) 38%, rgba(205,215,225,0.36) 78%, rgba(165,175,185,0.22) 100%)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              }}
            />

            {/* Parte inferiore PIÙ OPACA del dock (sotto la linea S) */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, transparent 61%, rgba(226,234,246,0.22) 72%, rgba(210,220,236,0.26) 84%, rgba(194,206,226,0.28) 93%, rgba(180,192,214,0.3) 100%)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
              }}
            />

            {/* Highlight sulla parte superiore del dock */}
            <div
              className="absolute inset-x-[9%] top-[7%] h-[17%]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 100%)',
              }}
            />

            {/* Bordo luminoso superiore */}
            <div
              className="absolute inset-x-[11%] top-[7%] h-[1.5px]"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.75) 10%, rgba(255,255,255,0.75) 90%, transparent 100%)',
              }}
            />
          </div>

          {/* Bordo del dock - bordi laterali MOLTO MENO inclinati */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(16% 5%, 84% 5%, 82% 100%, 18% 100%)',
              border: '1px solid rgba(255,255,255,0.38)',
              borderBottom: '1px solid rgba(120,130,140,0.43)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.25), 0 12px 35px rgba(0,0,0,0.35)',
            }}
          />
        </div>

        {/* Ombra sotto il dock - forma a S a metà altezza del dock */}
        <div
          className="pointer-events-none absolute left-0 right-0 bottom-[-6px] h-[24px]"
          style={{
            background:
              'radial-gradient(ellipse 65% 100% at 50% 30%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.08) 60%, transparent 85%)',
            filter: 'blur(16px)',
          }}
        />

        {/* Icone posizionate a metà altezza del dock - sovrapposte al dock */}
        <div
          ref={iconsContainerRef}
          className="pointer-events-auto absolute z-[15] flex items-end left-1/2 -translate-x-1/2 justify-center"
          style={{ bottom: '14px' }}
          onMouseMove={magnifyEnabled ? handleMouseMove : undefined}
          onMouseEnter={magnifyEnabled ? handleMouseMove : undefined}
          onMouseLeave={magnifyEnabled ? handleMouseLeave : undefined}
        >
          {icons.map((icon) => (
            <DockIcon
              key={icon.id}
              item={icon}
              isActive={!!activeIconIds?.has(icon.id)}
              onSelect={onOpen}
              mouseX={mouseX}
              isMobile={false} // Always use desktop icon styling (size etc)
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Dock;

