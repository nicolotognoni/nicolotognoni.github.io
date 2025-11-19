const PDFWindow = () => {
  const pdfPath = '/BendingSpoon_CoverLetter.pdf';

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <iframe
        src={pdfPath}
        className="h-full w-full"
        title="Cover Letter PDF"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default PDFWindow;
