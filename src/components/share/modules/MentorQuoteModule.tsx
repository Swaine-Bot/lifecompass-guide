interface Props {
  accentHex: string;
  trackHex?: string;
  animate?: boolean;
}

export function MentorQuoteModule({ accentHex, animate = true }: Props) {
  return (
    <div className={cn('flex items-center gap-3', animate && 'share-hero-fade')}>
      {/* Vertical accent bar */}
      <div style={{
        width: 2, height: 32, borderRadius: 2,
        background: `linear-gradient(180deg, ${accentHex} 0%, transparent 100%)`,
        opacity: 0.5,
      }} />
      {/* Open-quote mark */}
      <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
        <path
          d="M0 20V12.5C0 5.6 3.8 1.2 9.5 0L10.8 2.4C7 4.2 5.2 7 5 10H9.5V20H0ZM13.5 20V12.5C13.5 5.6 17.3 1.2 23 0L24.3 2.4C20.5 4.2 18.7 7 18.5 10H23V20H13.5Z"
          fill={accentHex}
          opacity="0.2"
        />
      </svg>
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
