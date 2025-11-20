interface PDFWindowProps {
  pdfUrl?: string;
}

const PDFWindow = ({ pdfUrl = '/BendingSpoon_CoverLetter.pdf' }: PDFWindowProps = {}) => {
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
        src={pdfUrl}
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
