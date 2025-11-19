import { type ReactNode } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

type DesktopIconProps = {
  label: string;
  icon: ReactNode | string;
  accentColor: string;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  iconId?: string;
};

const DesktopIcon = ({
  label,
  icon,
  accentColor,
  selected,
  onSelect,
  onOpen,
  iconId,
}: DesktopIconProps) => {
  const isMobile = useIsMobile();
  const isResumeIcon = iconId === 'resume' || (typeof icon === 'string' && icon.includes('CV_data_analyst'));
  const isPDFIcon = iconId === 'bending-spoon-cover-letter' || (typeof icon === 'string' && icon.includes('BendingSpoon_CoverLetter'));
  const isWideIcon = isResumeIcon || isPDFIcon;
  const iconHeight = isPDFIcon ? '28px' : '48px';
  const handleDoubleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onOpen();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      onOpen();
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isMobile) {
      onOpen();
    } else {
      onSelect();
    }
  };

  const isRecapyIcon = iconId === 'recapy';

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      className="group flex flex-col items-center gap-1 text-xs text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
    >
      <div
        className="relative flex items-center justify-center"
        style={isWideIcon ? { height: iconHeight, width: 'auto' } : { height: '48px', width: '48px', borderRadius: '22%', overflow: 'hidden' }}
      >
        {typeof icon === 'string' && (icon.endsWith('.png') || icon.endsWith('.jpg')) ? (
          <>
            <img
              src={icon}
              alt={label}
              className={isWideIcon ? 'h-full w-auto object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]' : 'h-full w-full object-cover drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]'}
              style={{
                filter: selected ? 'brightness(1.1)' : 'none',
                borderRadius: isWideIcon ? '0' : '22%',
              }}
            />
            {isRecapyIcon && (
              <div
                className="pointer-events-none absolute left-0 top-0"
                style={{
                  width: '100%',
                  height: '50%',
                  borderRadius: '22% 22% 0 0',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.1) 60%, transparent 100%)',
                  zIndex: 1,
                }}
              />
            )}
          </>
        ) : typeof icon === 'object' && icon !== null ? (
          <div style={{ filter: selected ? 'brightness(1.1)' : 'none' }}>
            {icon}
          </div>
        ) : (
          <span
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] text-4xl"
            style={{ color: accentColor }}
          >
            {icon}
          </span>
        )}
      </div>
      <span
        className={`rounded-[4px] px-1.5 py-0.5 text-center text-[10px] font-medium leading-tight ${selected
          ? 'bg-[#3875d7] text-white shadow-sm'
          : 'text-white'
          }`}
        style={!selected ? {
          textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)',
          background: 'transparent'
        } : undefined}
      >
        {label}
      </span>
    </button>
  );
};

export default DesktopIcon;

