import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { CardData } from '../../types';
import '../LeftMenu/LeftMenu.css';
import './CardEditor.css';

const PRESET_COLORS = [
  '#FFF9C4', '#FFE0B2', '#FFCDD2', '#F8BBD0',
  '#E1BEE7', '#C5CAE9', '#BBDEFB', '#C8E6C9',
  '#FFFFFF', 'transparent',
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24];

interface CardEditorProps {
  card: CardData;
  onSave: (updates: Partial<CardData>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function CardEditor({ card, onSave, onDelete, onClose }: CardEditorProps) {
  const [title, setTitle] = useState(card.title);
  const [content, setContent] = useState(card.content);
  const [color, setColor] = useState(card.color);
  const [fontSize, setFontSize] = useState(card.font_size);
  const [showColorPicker, setShowColorPicker] = useState(false);

  function handleSave() {
    onSave({ title, content, color, font_size: fontSize });
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
  }

  return (
    <div className="overlay-enter editor-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="modal-enter editor-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Edit Card</h3>
          <button onClick={onClose} className="editor-close-btn" title="Close (Esc)">x</button>
        </div>

        <label className="editor-label">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="editor-input"
          placeholder="Card title..."
          autoFocus
        />

        <label className="editor-label">Content (Markdown)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="editor-input editor-textarea"
          placeholder="Write your thoughts..."
        />

        <label className="editor-label">Color</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`left-menu__color-swatch ${color === c ? 'left-menu__color-swatch--selected' : ''} ${c === 'transparent' ? 'left-menu__color-swatch--transparent' : ''}`}
              style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                backgroundColor: c === 'transparent' ? undefined : c,
              }}
              title={c === 'transparent' ? 'Transparent' : c}
            />
          ))}
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="left-menu__plus-btn"
            style={{ padding: '4px 10px', fontSize: 12, fontWeight: 500, borderRadius: 6 }}
          >
            Custom
          </button>
        </div>
        {showColorPicker && (
          <div style={{ marginBottom: 12 }}>
            <HexColorPicker color={color} onChange={setColor} />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
          <div>
            <label className="editor-label">Font Size</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="editor-input"
              style={{ width: 'auto', padding: '6px 10px' }}
            >
              {FONT_SIZES.map((s) => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, marginTop: 24 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                backgroundColor: color,
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Preview</span>
          </div>
        </div>

        <div className="editor-actions">
          <button onClick={handleSave} className="editor-save-btn" title="Ctrl+Enter to save">
            Save
          </button>
          <button
            onClick={() => { if (confirm('Delete this card permanently?')) onDelete(); }}
            className="editor-delete-btn"
          >
            Delete
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} className="editor-cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
}
