import { resumeLink } from '../data/content';

const ResumeWindow = () => {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <iframe
        src={resumeLink}
        className="h-full w-full"
        title="Resume PDF"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default ResumeWindow;

