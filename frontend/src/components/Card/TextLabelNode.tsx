import { memo, useState, useRef, useEffect } from 'react';
import { NodeResizer, type NodeProps } from '@xyflow/react';
import { useBoardMode } from '../../hooks/useBoardMode';
import type { CardData } from '../../types';

interface TextLabelData extends Record<string, unknown> {
  card: CardData;
  onDelete: (id: string) => void;
  onEdit: (card: CardData) => void;
  onResize: (id: string, width: number, height: number) => void;
}

function TextLabelNodeComponent({ data, selected }: NodeProps) {
  const { card, onDelete, onEdit, onResize } = data as unknown as TextLabelData;
  const { mode } = useBoardMode();
  const isEdit = mode === 'edit';
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(card.content);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(card.content);
  }, [card.content]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function handleBlur() {
    setEditing(false);
    if (text !== card.content) {
      onEdit({ ...card, content: text });
    }
  }

  return (
    <>
      {isEdit && (
        <NodeResizer
          isVisible={selected}
          minWidth={100}
          minHeight={40}
          lineStyle={{ borderColor: 'rgba(33, 150, 243, 0.4)' }}
          handleStyle={{ backgroundColor: '#2196F3', width: 8, height: 8, borderRadius: 4 }}
          onResizeEnd={(_event, params) => {
            onResize(card.id, params.width, params.height);
          }}
        />
      )}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
        onDoubleClick={() => isEdit && setEditing(true)}
      >
        {editing ? (
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleBlur();
              }
              if (e.key === 'Escape') {
                setText(card.content);
                setEditing(false);
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: '1px dashed rgba(33, 150, 243, 0.5)',
              borderRadius: 4,
              fontSize: card.font_size,
              fontWeight: 700,
              color: card.color === '#FFF9C4' || card.color === '#FFFFFF' ? 'var(--text-primary)' : card.color,
              textAlign: 'center',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              padding: 8,
            }}
          />
        ) : (
          <span
            style={{
              fontSize: card.font_size,
              fontWeight: 700,
              color: card.color === '#FFF9C4' || card.color === '#FFFFFF' ? 'var(--text-primary)' : card.color,
              userSelect: 'none',
              textAlign: 'center',
              lineHeight: 1.2,
              padding: 8,
              wordBreak: 'break-word',
            }}
          >
            {card.content || (isEdit ? 'Double-click to type...' : '')}
          </span>
        )}
        {isEdit && !editing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this label?')) onDelete(card.id);
            }}
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 20,
              height: 20,
              cursor: 'pointer',
              fontSize: 11,
              lineHeight: '20px',
              textAlign: 'center',
              opacity: 0,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
            title="Delete label"
          >
            x
          </button>
        )}
      </div>
    </>
  );
}

export default memo(TextLabelNodeComponent);
