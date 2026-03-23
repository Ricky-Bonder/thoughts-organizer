interface LayoutToggleProps {
  isAutoLayout: boolean;
  onToggle: () => void;
}

export default function LayoutToggle({ isAutoLayout, onToggle }: LayoutToggleProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '6px 14px',
        borderRadius: 6,
        border: '1px solid #ddd',
        background: isAutoLayout ? '#e8f5e9' : '#fff',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: 13,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      }}
    >
      {isAutoLayout ? 'Auto Layout' : 'Free Placement'}
    </button>
  );
}
