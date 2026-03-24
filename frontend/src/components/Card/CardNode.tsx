import { memo } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react';
import ReactMarkdown from 'react-markdown';
import { useBoardMode } from '../../hooks/useBoardMode';
import type { CardData } from '../../types';
import './CardNode.css';

interface CardNodeData extends Record<string, unknown> {
  card: CardData;
  onDelete: (id: string) => void;
  onEdit: (card: CardData) => void;
  onResize: (id: string, width: number, height: number) => void;
}

function CardNodeComponent({ data, selected }: NodeProps) {
  const { card, onDelete, onEdit, onResize } = data as unknown as CardNodeData;
  const { mode } = useBoardMode();
  const isEdit = mode === 'edit';
  const isEmpty = !card.content && card.attachments.length === 0;
  const isTransparent = card.color === 'transparent';
  const textColor = card.text_color || '#000000';

  return (
    <>
      {isEdit && (
        <NodeResizer
          isVisible={selected}
          minWidth={160}
          minHeight={100}
          lineStyle={{ borderColor: 'rgba(33, 150, 243, 0.4)' }}
          handleStyle={{ backgroundColor: '#2196F3', width: 8, height: 8, borderRadius: 4 }}
          onResizeEnd={(_event, params) => {
            onResize(card.id, params.width, params.height);
          }}
        />
      )}
      <Handle type="target" position={Position.Top} style={{ background: '#888', width: 8, height: 8 }} />
      <div
        className={`card-node ${isTransparent ? 'card-node--transparent' : ''}`}
        style={{
          backgroundColor: isTransparent ? 'transparent' : card.color,
          width: '100%',
          height: '100%',
          fontSize: card.font_size,
          color: textColor,
        }}
        onDoubleClick={() => isEdit && onEdit(card)}
      >
        {!isTransparent && (
          <div className="card-node__header">
            <span className="card-node__title">
              {card.title || 'Untitled'}
            </span>
            {isEdit && (
              <button
                className="card-node__delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(card.id);
                }}
                title="Delete card"
              >
                x
              </button>
            )}
          </div>
        )}
        <div className="card-node__body" style={{ color: textColor }}>
          {isEmpty ? (
            <span className="card-node__empty">
              {isEdit ? 'Double-click to edit...' : 'Empty card'}
            </span>
          ) : (
            <ReactMarkdown>{card.content.slice(0, 200)}</ReactMarkdown>
          )}
        </div>
        {card.attachments.length > 0 && (
          <div className="card-node__attachment-preview">
            {card.attachments
              .filter((a) => a.mime_type.startsWith('image/'))
              .slice(0, 1)
              .map((a) => (
                <img key={a.id} src={a.url} alt={a.filename} />
              ))}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#888', width: 8, height: 8 }} />
    </>
  );
}

export default memo(CardNodeComponent);
