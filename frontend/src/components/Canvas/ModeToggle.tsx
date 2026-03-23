import { useBoardMode } from '../../hooks/useBoardMode';

export default function ModeToggle() {
  const { mode, setMode } = useBoardMode();

  return (
    <button
      onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')}
      style={{
        padding: '6px 14px',
        borderRadius: 6,
        border: '1px solid #ddd',
        background: mode === 'edit' ? '#fff' : '#e3f2fd',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: 13,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      }}
    >
      {mode === 'edit' ? 'Edit Mode' : 'View Mode'}
    </button>
  );
}
