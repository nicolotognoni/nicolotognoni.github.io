import { motion, AnimatePresence } from 'framer-motion';

interface HelpItem {
  icon: string;
  title: string;
  description: string;
}

interface HelpDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  helpItems: HelpItem[];
  appName: string;
}

function HelpCard({ icon, title, description }: HelpItem) {
  return (
    <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg border border-white/20">
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-white mb-1 text-center">{title}</h3>
      <p className="text-xs text-white/80 text-center">{description}</p>
    </div>
  );
}

export function HelpDialog({
  isOpen,
  onOpenChange,
  helpItems,
  appName,
}: HelpDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-neutral-800 border-2 border-neutral-600 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-neutral-700 px-4 py-2 border-b border-neutral-600 flex justify-between items-center">
              <h2 className="text-white font-semibold text-sm">Help</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="text-white/70 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-60px)]">
              <p className="text-xl text-white mb-4 font-semibold">
                Welcome to {appName}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {helpItems.map((item) => (
                  <HelpCard key={item.title} {...item} />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

