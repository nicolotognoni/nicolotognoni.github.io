import type { PortfolioIcon } from '../../types/portfolio';
import DesktopIcon from './DesktopIcon';

type IconGridProps = {
  icons: PortfolioIcon[];
  onOpen: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

const IconGrid = ({ icons, onOpen, selectedId, onSelect }: IconGridProps) => {
  return (
    <div className="grid max-w-[320px] grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3">
      {icons.map((icon) => (
        <DesktopIcon
          key={icon.id}
          label={icon.label}
          icon={icon.icon}
          accentColor={icon.accentColor}
          selected={selectedId === icon.id}
          onSelect={() => onSelect(icon.id)}
          onOpen={() => onOpen(icon.id)}
        />
      ))}
    </div>
  );
};

export default IconGrid;

