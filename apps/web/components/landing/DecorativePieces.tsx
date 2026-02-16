interface PieceProps {
  size: number;
  className?: string;
}

export function FootmanIcon({ size, className }: PieceProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-22 -22 44 44"
      className={className}
    >
      <path
        d="M -12 -14 L 12 -14 L 12 4 L 0 18 L -12 4 Z"
        fill="currentColor"
        opacity={0.15}
      />
      <path
        d="M -12 -14 L 12 -14 L 12 4 L 0 18 L -12 4 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.3}
      />
      <line
        x1={0}
        y1={-8}
        x2={0}
        y2={8}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.2}
      />
      <line
        x1={-7}
        y1={-2}
        x2={7}
        y2={-2}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.2}
      />
    </svg>
  );
}

export function ArcherIcon({ size, className }: PieceProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-22 -22 44 44"
      className={className}
    >
      <circle cx={0} cy={0} r={18} fill="currentColor" opacity={0.15} />
      <circle
        cx={0}
        cy={0}
        r={18}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.3}
      />
      <path
        d="M -6 -14 Q 12 0 -6 14"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.25}
      />
      <line
        x1={-12}
        y1={0}
        x2={8}
        y2={0}
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.25}
      />
      <polygon points="8,-3 14,0 8,3" fill="currentColor" opacity={0.25} />
    </svg>
  );
}

export function KnightIcon({ size, className }: PieceProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-22 -22 44 44"
      className={className}
    >
      <circle cx={0} cy={0} r={18} fill="currentColor" opacity={0.15} />
      <circle
        cx={0}
        cy={0}
        r={18}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        opacity={0.3}
      />
      <path
        d="M -8 12 L -8 -4 L -4 -12 L 4 -14 L 8 -8 L 6 -2 L 10 2 L 6 4 L 4 12 Z"
        fill="currentColor"
        opacity={0.25}
      />
    </svg>
  );
}

// Solid versions for unit showcase cards
export function FootmanSolid({ size, className }: PieceProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-22 -22 44 44"
      className={className}
    >
      <path
        d="M -12 -14 L 12 -14 L 12 4 L 0 18 L -12 4 Z"
        fill="#FAF0DC"
        stroke="#3D2B1F"
        strokeWidth={2}
      />
      <line
        x1={0}
        y1={-8}
        x2={0}
        y2={8}
        stroke="#3D2B1F"
        strokeWidth={1.5}
      />
      <line
        x1={-7}
        y1={-2}
        x2={7}
        y2={-2}
        stroke="#3D2B1F"
        strokeWidth={1.5}
      />
    </svg>
  );
}

export function ArcherSolid({ size, className }: PieceProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-22 -22 44 44"
      className={className}
    >
      <circle cx={0} cy={0} r={18} fill="#FAF0DC" stroke="#3D2B1F" strokeWidth={2} />
      <path
        d="M -6 -14 Q 12 0 -6 14"
        fill="none"
        stroke="#3D2B1F"
        strokeWidth={2}
      />
      <line x1={-12} y1={0} x2={8} y2={0} stroke="#3D2B1F" strokeWidth={1.5} />
      <polygon points="8,-3 14,0 8,3" fill="#3D2B1F" />
    </svg>
  );
}

export function KnightSolid({ size, className }: PieceProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-22 -22 44 44"
      className={className}
    >
      <circle cx={0} cy={0} r={18} fill="#FAF0DC" stroke="#3D2B1F" strokeWidth={2} />
      <path
        d="M -8 12 L -8 -4 L -4 -12 L 4 -14 L 8 -8 L 6 -2 L 10 2 L 6 4 L 4 12 Z"
        fill="#3D2B1F"
        stroke="#3D2B1F"
        strokeWidth={1}
      />
      <circle cx={2} cy={-6} r={2} fill="#FAF0DC" />
    </svg>
  );
}
