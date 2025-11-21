interface PDFWindowProps {
  pdfUrl?: string;
}

const PDFWindow = ({ pdfUrl = '/BendingSpoon_CoverLetter.pdf' }: PDFWindowProps = {}) => {
  const isMobile = window.innerWidth < 768; // Simple check for mobile rendering

  // Use Google Docs Viewer for mobile to ensure proper scaling
  // For local development, we can't use Google Docs Viewer with localhost URLs, so we fallback to direct embed
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const fullUrl = isLocal ? pdfUrl : `https://nicolotognoni.github.io${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`;

  const viewerUrl = isMobile && !isLocal
    ? `https://docs.google.com/gview?url=${fullUrl}&embedded=true`
    : `${pdfUrl}#zoom=page-width`;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Drag handle bar - gray bar for dragging without conflicting with PDF scroll */}
      <div
        role="presentation"
        className="flex-shrink-0 w-full bg-gradient-to-b from-[#e8e8e8] to-[#d0d0d0] border-b border-[#a0a0a0]"
        style={{
          height: '24px',
          cursor: 'grab',
        }}
      />

      {/* PDF iframe - fills remaining space */}
      <iframe
        src={viewerUrl}
        className="flex-1 w-full"
        style={{
          border: 'none',
          minHeight: 0, // Important for flex child
        }}
        title="PDF Viewer"
      />
    </div>
  );
};

export default PDFWindow;
