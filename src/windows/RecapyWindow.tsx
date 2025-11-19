import { useEffect } from 'react';

const RecapyWindow = () => {
  useEffect(() => {
    // Open the external link in a new tab
    window.open('https://recapy.framer.ai', '_blank');
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center p-4 text-[11px] leading-5 text-slate-900">
      <p className="text-center text-sm text-slate-700">
        Opening Recapy in a new tab...
      </p>
    </div>
  );
};

export default RecapyWindow;

