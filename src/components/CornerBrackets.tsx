import './CornerBrackets.css';

interface Props {
  size?: number;
  thickness?: number;
  color?: string;
}

/** Technical-instrument corner registration marks — the signature framing
 *  device for every panel. Parent must be position: relative/absolute/fixed. */
export default function CornerBrackets({ size = 14, thickness = 2, color }: Props) {
  const style = {
    ...(color ? { '--bracket-color': color } : {}),
    '--bracket-thickness': `${thickness}px`,
  } as React.CSSProperties;
  return (
    <span className="corner-brackets" style={style} aria-hidden="true">
      <span className="corner-bracket corner-tl" style={{ width: size, height: size }} />
      <span className="corner-bracket corner-tr" style={{ width: size, height: size }} />
      <span className="corner-bracket corner-bl" style={{ width: size, height: size }} />
      <span className="corner-bracket corner-br" style={{ width: size, height: size }} />
    </span>
  );
}
