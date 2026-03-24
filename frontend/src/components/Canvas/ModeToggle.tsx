import { useBoardMode } from '../../hooks/useBoardMode';

export default function ModeToggle() {
  const { mode, setMode } = useBoardMode();
  const isEdit = mode === 'edit';

  return (
    <button
      onClick={() => setMode(isEdit ? 'view' : 'edit')}
      className={`panel-btn ${isEdit ? '' : 'panel-btn--active'}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isEdit ? (
          <>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </>
        ) : (
          <>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
      {isEdit ? 'Edit' : 'View'}
    </button>
  );
}
