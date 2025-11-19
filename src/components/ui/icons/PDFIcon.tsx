const PDFIcon = () => {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Main document body */}
      <rect x="8" y="8" width="48" height="56" fill="#FFFFFF" stroke="#C1C8D4" strokeWidth="1" />
      
      {/* Folded corner */}
      <path
        d="M 48 8 L 56 8 L 56 16 L 48 8 Z"
        fill="#E8E8EC"
        stroke="#C1C8D4"
        strokeWidth="1"
      />
      <path
        d="M 48 8 L 56 16 L 48 16 Z"
        fill="#D8D8DC"
        stroke="#C1C8D4"
        strokeWidth="1"
      />
      
      {/* PDF text/logo */}
      <text
        x="32"
        y="38"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fontWeight="bold"
        fill="#DC2626"
        textAnchor="middle"
      >
        PDF
      </text>
      
      {/* Lines to simulate text */}
      <line x1="16" y1="48" x2="40" y2="48" stroke="#E8E8EC" strokeWidth="1" />
      <line x1="16" y1="52" x2="36" y2="52" stroke="#E8E8EC" strokeWidth="1" />
      <line x1="16" y1="56" x2="44" y2="56" stroke="#E8E8EC" strokeWidth="1" />
    </svg>
  );
};

export default PDFIcon;

