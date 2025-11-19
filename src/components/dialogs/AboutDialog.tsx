import { motion, AnimatePresence } from 'framer-motion';

interface AppMetadata {
  name: string;
  version: string;
  creator: {
    name: string;
    url: string;
  };
  github: string;
  icon: string;
}

interface AboutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  metadata: AppMetadata;
}

export function AboutDialog({
  isOpen,
  onOpenChange,
  metadata,
}: AboutDialogProps) {
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-neutral-800 border-2 border-neutral-600 rounded-lg shadow-2xl max-w-xs w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-neutral-700 px-4 py-2 border-b border-neutral-600 flex justify-between items-center">
              <h2 className="text-white font-semibold text-sm">About</h2>
              <button
                onClick={() => onOpenChange(false)}
                className="text-white/70 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 py-8 px-4">
              <div>
                <img
                  src={metadata.icon}
                  alt="App Icon"
                  className="w-12 h-12 mx-auto"
                />
              </div>
              <div className="space-y-0 text-center text-white">
                <div className="text-2xl font-medium mb-2">{metadata.name}</div>
                <p className="text-gray-400 mb-2 text-sm">Version {metadata.version}</p>
                <p className="text-sm mb-1">
                  Made by{' '}
                  <a
                    href={metadata.creator.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {metadata.creator.name}
                  </a>
                </p>
                <p className="text-sm">
                  <a
                    href={metadata.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Open in GitHub
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

