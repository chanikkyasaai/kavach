import { useEffect, useState } from 'react';
import './AnimatedNumber.css';

interface Props {
  value: string | number;
  className?: string;
}

/** On value change: old value slides up 8px and fades out while the new
 *  value slides in from below and fades in. 200ms. */
export default function AnimatedNumber({ value, className }: Props) {
  const [display, setDisplay] = useState(value);
  const [exiting, setExiting] = useState<string | number | null>(null);

  // Adjusting state during render in response to a prop change — the
  // React-sanctioned alternative to syncing via useEffect. `display` itself
  // is the "previous value" baseline, so no ref is needed.
  if (value !== display) {
    setExiting(display);
    setDisplay(value);
  }

  useEffect(() => {
    if (exiting === null) return;
    const id = window.setTimeout(() => setExiting(null), 200);
    return () => window.clearTimeout(id);
  }, [exiting]);

  return (
    <span className={`animated-number ${className ?? ''}`}>
      {exiting !== null && <span className="animated-number-exit">{exiting}</span>}
      <span className="animated-number-enter" key={String(display)}>{display}</span>
    </span>
  );
}
