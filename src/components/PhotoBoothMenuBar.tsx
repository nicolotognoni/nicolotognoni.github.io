import { useState } from 'react';
import { cn } from '../lib/utils';

interface Effect {
  name: string;
  filter: string;
}

interface PhotoBoothMenuBarProps {
  onClose: () => void;
  onShowHelp: () => void;
  onShowAbout: () => void;
  onClearPhotos: () => void;
  onExportPhotos: () => void;
  effects: Effect[];
  selectedEffect: Effect;
  onEffectSelect: (effect: Effect) => void;
  availableCameras: MediaDeviceInfo[];
  selectedCameraId: string | null;
  onCameraSelect: (deviceId: string) => void;
}

export function PhotoBoothMenuBar({
  onClose,
  onShowHelp,
  onShowAbout,
  onClearPhotos,
  onExportPhotos,
  effects,
  selectedEffect,
  onEffectSelect,
  availableCameras,
  selectedCameraId,
  onCameraSelect,
}: PhotoBoothMenuBarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const MenuItem = ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button
      className={cn(
        "w-full text-left px-3 py-1.5 text-sm text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      onClick={() => {
        onClick?.();
        setOpenMenu(null);
      }}
      disabled={disabled}
    >
      {children}
    </button>
  );

  const Menu = ({
    label,
    menuId,
    children,
  }: {
    label: string;
    menuId: string;
    children: React.ReactNode;
  }) => (
    <div className="relative">
      <button
        className={cn(
          "px-3 py-1 text-sm text-white hover:bg-white/10 rounded-sm transition-colors",
          openMenu === menuId && "bg-white/10"
        )}
        onClick={() => setOpenMenu(openMenu === menuId ? null : menuId)}
      >
        {label}
      </button>
      {openMenu === menuId && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpenMenu(null)}
          />
          <div className="absolute top-full left-0 mt-1 bg-neutral-800 border border-neutral-600 rounded shadow-lg z-20 min-w-[180px] py-1">
            {children}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex items-center bg-neutral-700 border-b border-neutral-600 px-2 py-1 text-white text-sm select-none">
      <Menu label="File" menuId="file">
        <MenuItem onClick={onExportPhotos}>Export Photos</MenuItem>
        <div className="h-px bg-neutral-600 my-1" />
        <MenuItem onClick={onClearPhotos}>Clear All Photos</MenuItem>
        <div className="h-px bg-neutral-600 my-1" />
        <MenuItem onClick={onClose}>Close</MenuItem>
      </Menu>

      <Menu label="Camera" menuId="camera">
        {availableCameras.map((camera) => (
          <MenuItem
            key={camera.deviceId}
            onClick={() => onCameraSelect(camera.deviceId)}
          >
            <span className={cn(selectedCameraId !== camera.deviceId && "pl-4")}>
              {selectedCameraId === camera.deviceId ? "✓ " : ""}
              {camera.label || `Camera ${camera.deviceId.slice(0, 4)}`}
            </span>
          </MenuItem>
        ))}
        {availableCameras.length === 0 && (
          <div className="px-3 py-1.5 text-sm text-white/50 italic">No cameras found</div>
        )}
      </Menu>

      <Menu label="Effects" menuId="effects">
        {effects.map((effect) => (
          <MenuItem
            key={effect.name}
            onClick={() => onEffectSelect(effect)}
          >
            <span className={cn(selectedEffect.name !== effect.name && "pl-4")}>
              {selectedEffect.name === effect.name ? "✓ " : ""}
              {effect.name}
            </span>
          </MenuItem>
        ))}
      </Menu>

      <Menu label="Help" menuId="help">
        <MenuItem onClick={onShowHelp}>Photo Booth Help</MenuItem>
        <MenuItem
          onClick={() => {
            // Placeholder for share functionality
            console.log("Share app clicked");
          }}
        >
          Share App...
        </MenuItem>
        <div className="h-px bg-neutral-600 my-1" />
        <MenuItem onClick={onShowAbout}>About Photo Booth</MenuItem>
      </Menu>
    </div>
  );
}

