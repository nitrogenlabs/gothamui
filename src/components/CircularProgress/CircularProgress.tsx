import {useId} from 'react';

import type {CSSProperties, ReactElement} from 'react';

export interface CircularProgressProps {
  readonly className?: string;
  readonly label?: string;
  readonly size?: number;
  readonly value: number;
}

/** Eclipse: a determinate, gradient ring with a soft glow and no continuous motion. */
export const CircularProgress = ({className, label = 'Uploading', size = 112, value}: CircularProgressProps): ReactElement => {
  const id = useId().replace(/:/g, '');
  const percent = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  const circumference = 2 * Math.PI * 42;
  const style: CSSProperties = {height: size, position: 'relative', width: size};
  return <div aria-label={label} aria-valuemax={100} aria-valuemin={0} aria-valuenow={Math.round(percent)}
    className={className} role="progressbar" style={style}>
    <svg aria-hidden="true" height="100%" viewBox="0 0 100 100" width="100%">
      <defs>
        <linearGradient id={`${id}-gradient`} x1="0%" x2="100%" y1="100%" y2="0%">
          <stop offset="0%" stopColor="#8653ed" /><stop offset="52%" stopColor="#b492ff" />
          <stop offset="100%" stopColor="#e1d9ff" />
        </linearGradient>
        <filter height="160%" id={`${id}-glow`} width="160%" x="-30%" y="-30%"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <circle cx="50" cy="50" fill="none" r="35" stroke="#b492ff" strokeOpacity="0.08" strokeWidth="1" />
      <circle cx="50" cy="50" fill="none" r="42" stroke="#b492ff" strokeOpacity="0.18" strokeWidth="6" />
      {[true, false].map((glow) => <circle className="transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
        cx="50" cy="50" fill="none" filter={glow ? `url(#${id}-glow)` : undefined} key={String(glow)}
        opacity={(percent === 0 ? 0 : 1) * (glow ? 0.5 : 1)} r="42" stroke={`url(#${id}-gradient)`}
        strokeDasharray={circumference} strokeDashoffset={circumference * (1 - (percent / 100))} strokeLinecap="round"
        strokeWidth="6" transform="rotate(-90 50 50)" />)}
    </svg>
    <span style={{color: '#f4efff', display: 'grid', fontSize: 14, fontVariantNumeric: 'tabular-nums', fontWeight: 600,
      inset: 0, placeItems: 'center', position: 'absolute'}}>{Math.round(percent)}%</span>
  </div>;
};
