import PDFWindow from './PDFWindow';
import { resumeLink } from '../data/content';

const ResumeWindow = () => {
  return <PDFWindow pdfUrl={resumeLink} />;
};

export default ResumeWindow;

