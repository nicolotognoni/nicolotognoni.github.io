import { useEffect, useState } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

const formatTime = (date: Date) =>
  date.toLocaleString('en-GB', {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const MenuBar = () => {
  const [clock, setClock] = useState(() => formatTime(new Date()));
  const isMobile = useIsMobile();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClock(formatTime(new Date()));
    }, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] flex items-center justify-between px-4 font-bold text-black ${isMobile ? 'h-[24px] text-[11px]' : 'h-[22px] text-[12px]'
        }`}
      style={{
        backgroundColor: 'rgba(240, 240, 240, 0.7)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.45) inset, 0 1px 1px rgba(0,0,0,0.12)',
        textShadow: '0 1px 0 rgba(255,255,255,0.7)',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}
    >
      <div className="pointer-events-auto flex items-center gap-5">
        <span className="text-base" style={{ fontSize: '15px' }}></span>
        <nav className="flex items-center gap-4">
          <span className="font-bold tracking-tight">Portfolio</span>
          {!isMobile && (
            <>
              <span className="tracking-tight">File</span>
              <span className="tracking-tight">Edit</span>
              <span className="tracking-tight">View</span>
              <span className="tracking-tight">Go</span>
              <span className="tracking-tight">Window</span>
              <span className="tracking-tight">Help</span>
            </>
          )}
        </nav>
      </div>

      <div className="pointer-events-auto flex items-center gap-3">
        <span className="tracking-tight">{clock}</span>
      </div>
    </header>
  );
};

export default MenuBar;
