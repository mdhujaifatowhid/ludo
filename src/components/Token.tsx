'use client';

interface Props {
  cx: number;
  cy: number;
  color: string;
  size?: number;
  highlighted?: boolean;
  onClick?: () => void;
}

export default function Token({ cx, cy, color, size = 0.34, highlighted, onClick }: Props) {
  return (
    <g
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
      style={{ transition: 'transform 250ms ease' }}
    >
      {highlighted && (
        <circle cx={cx} cy={cy} r={size + 0.14} fill="none" stroke="#F1EAD9" strokeWidth={0.06} opacity={0.9}>
          <animate attributeName="r" values={`${size + 0.1};${size + 0.22};${size + 0.1}`} dur="1s" repeatCount="indefinite" />
        </circle>
      )}
      <circle cx={cx} cy={cy} r={size} fill={color} stroke="#0B241A" strokeWidth={0.05} />
      <circle cx={cx - size * 0.25} cy={cy - size * 0.25} r={size * 0.35} fill="rgba(255,255,255,0.35)" />
    </g>
  );
}
