interface LayoutToggleProps {
  isAutoLayout: boolean;
  onToggle: () => void;
}

export default function LayoutToggle({ isAutoLayout, onToggle }: LayoutToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`panel-btn ${isAutoLayout ? 'panel-btn--active-green' : ''}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isAutoLayout ? (
          <>
            <circle cx="12" cy="5" r="3" />
            <circle cx="6" cy="19" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="12" y1="8" x2="6" y2="16" />
            <line x1="12" y1="8" x2="18" y2="16" />
          </>
        ) : (
          <>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </>
        )}
      </svg>
      {isAutoLayout ? 'Auto' : 'Free'}
    </button>
  );
}
