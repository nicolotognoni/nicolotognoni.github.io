import FinderWindow from '../windows/FinderWindow';
import ContactWindow from '../windows/ContactWindow';
import EducationWindow from '../windows/EducationWindow';
import ExperienceWindow from '../windows/ExperienceWindow';
import ProjectsWindow from '../windows/ProjectsWindow';
import ArticlesWindow from '../windows/ArticlesWindow';
import RecapyWindow from '../windows/RecapyWindow';
import ResumeWindow from '../windows/ResumeWindow';
import SkillsWindow from '../windows/SkillsWindow';
import PhotoBoothWindow from '../windows/PhotoBoothWindow';
import PDFWindow from '../windows/PDFWindow';
import type { PortfolioIcon } from '../types/portfolio';

// Apple original icon paths
const FinderIcon = '/icons/FinderIcon.png';
const GenericFolderIcon = '/icons/GenericFolderIcon.png';
const LibraryFolderIcon = '/icons/ToolbarLibraryFolderIcon.png';
const iMacIcon = '/icons/com.apple.imac-g5-17.png';
const UtilitiesFolderIcon = '/icons/ToolbarUtilitiesFolderIcon.png';
const MailIcon = '/icons/Mail.png';
const DocumentIcon = '/icons/GenericDocumentIcon.png';
const RecapyIcon = '/icons/appIcon.png';
const ResumeIcon = '/icons/CV_data_analyst.png';
const PhotoBoothIcon = '/icons/PhotoBooth.png';
const BendingSpoonCoverLetterIcon = '/images/BendingSpoon_CoverLetter_image.png';

export const portfolioIcons: PortfolioIcon[] = [
  {
    id: 'finder',
    label: 'Finder',
    description: 'My details and information.',
    icon: FinderIcon,
    accentColor: '#4da3ff',
    window: {
      title: 'Macintosh HD',
      subtitle: 'Finder',
      Component: FinderWindow,
      size: { width: 600, height: 500 },
      initialPosition: { x: 120, y: 140 },
    },
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Academic background and certifications.',
    icon: LibraryFolderIcon,
    accentColor: '#34d399',
    window: {
      title: 'Education',
      subtitle: 'Academic path in analytics and business',
      Component: EducationWindow,
      size: { width: 480, height: 400 },
      initialPosition: { x: 200, y: 180 },
    },
  },
  {
    id: 'experience',
    label: 'Experience',
    description: 'Work history in analytics and engineering.',
    icon: iMacIcon,
    accentColor: '#38bdf8',
    window: {
      title: 'Work Experience',
      subtitle: 'Professional roles and career milestones',
      Component: ExperienceWindow,
      size: { width: 480, height: 400 },
      initialPosition: { x: 300, y: 260 },
    },
  },
  {
    id: 'skills',
    label: 'Skills',
    description: 'Core programming and data tools.',
    icon: UtilitiesFolderIcon,
    accentColor: '#f472b6',
    window: {
      title: 'Skills & Tooling',
      subtitle: 'Technical toolkit for analytics work',
      Component: SkillsWindow,
      size: { width: 360, height: 280 },
      initialPosition: { x: 540, y: 200 },
    },
  },
  {
    id: 'contact',
    label: 'Get in touch',
    description: "Let's collaborate.",
    icon: MailIcon,
    accentColor: '#a78bfa',
    window: {
      title: 'Get in touch',
      subtitle: 'Reach out about analytics or engineering projects',
      Component: ContactWindow,
      size: { width: 400, height: 300 },
      initialPosition: { x: 780, y: 160 },
    },
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'Projects, articles, and experiments.',
    icon: GenericFolderIcon,
    accentColor: '#f79d3c',
    window: {
      title: 'Selected Projects',
      subtitle: 'Analytics initiatives and published research',
      Component: ProjectsWindow,
      size: { width: 520, height: 450 },
      initialPosition: { x: 360, y: 110 },
    },
  },
  {
    id: 'articles',
    label: 'Articles',
    description: 'Published articles and technical writing.',
    icon: DocumentIcon,
    accentColor: '#8b5cf6',
    window: {
      title: 'Articles',
      subtitle: 'Technical articles and publications',
      Component: ArticlesWindow,
      size: { width: 520, height: 450 },
      initialPosition: { x: 400, y: 150 },
    },
  },
  {
    id: 'resume',
    label: 'Resume',
    description: 'Downloadable CV & press kit.',
    icon: ResumeIcon,
    accentColor: '#34d399',
    window: {
      title: 'Resume & Press',
      subtitle: 'Download the latest curriculum',
      Component: ResumeWindow,
      size: { width: 800, height: 600 },
      initialPosition: { x: 640, y: 360 },
    },
  },
  {
    id: 'recapy',
    label: 'Recapy',
    description: 'Video Knowledge, Instantly Captured.',
    icon: RecapyIcon,
    accentColor: '#6366f1',
    window: {
      title: 'Recapy',
      subtitle: 'AI-powered video summaries',
      Component: RecapyWindow,
      size: { width: 300, height: 200 },
      initialPosition: { x: 500, y: 300 },
    },
  },
  {
    id: 'photo-booth',
    label: 'Photo Booth',
    description: 'Take photos with your camera and apply fun effects.',
    icon: PhotoBoothIcon,
    accentColor: '#f59e0b',
    window: {
      title: 'Photo Booth',
      subtitle: 'Take photos with effects',
      Component: PhotoBoothWindow,
      size: { width: 640, height: 480 },
      initialPosition: { x: 200, y: 100 },
    },
  },
  {
    id: 'bending-spoon-cover-letter',
    label: 'Cover Letter',
    description: 'Cover letter for BendingSpoon position.',
    icon: BendingSpoonCoverLetterIcon,
    accentColor: '#dc2626',
    window: {
      title: 'Cover Letter',
      subtitle: 'PDF Document',
      Component: PDFWindow,
      size: { width: 800, height: 600 },
      initialPosition: { x: 300, y: 200 },
    },
  },
];

