export function MentorQuoteModule({ accentHex }: { accentHex: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1 h-8 rounded-full" style={{ backgroundColor: accentHex, opacity: 0.4 }} />
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
        <path d="M0 16V10C0 4.5 3.5 1 8 0L9 2C5.5 3.5 4 5.5 4 8H8V16H0ZM12 16V10C12 4.5 15.5 1 20 0L21 2C17.5 3.5 16 5.5 16 8H20V16H12Z"
          fill={accentHex} opacity="0.3" />
      </svg>
    </div>
  );
}
