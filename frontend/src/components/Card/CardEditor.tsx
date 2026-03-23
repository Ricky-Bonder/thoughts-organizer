import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import type { CardData } from '../../types';

const PRESET_COLORS = [
  '#FFEB3B', '#FF9800', '#F44336', '#E91E63',
  '#9C27B0', '#3F51B5', '#2196F3', '#4CAF50',
  '#8BC34A', '#FFFFFF',
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

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Edit Card</h3>
          <button onClick={onClose} style={closeBtnStyle}>x</button>
        </div>

        <label style={labelStyle}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
          placeholder="Card title..."
        />

        <label style={labelStyle}>Content (Markdown)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ ...inputStyle, minHeight: 120, resize: 'vertical', fontFamily: 'inherit' }}
          placeholder="Write your thoughts..."
        />

        <label style={labelStyle}>Color</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                border: color === c ? '2px solid #333' : '1px solid #ccc',
                backgroundColor: c,
                cursor: 'pointer',
              }}
            />
          ))}
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={{ padding: '4px 8px', cursor: 'pointer', borderRadius: 4, border: '1px solid #ccc', background: '#fff', fontSize: 12 }}
          >
            Custom
          </button>
        </div>
        {showColorPicker && (
          <div style={{ marginBottom: 12 }}>
            <HexColorPicker color={color} onChange={setColor} />
          </div>
        )}

        <label style={labelStyle}>Font Size</label>
        <select
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          style={{ ...inputStyle, width: 'auto' }}
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={handleSave} style={saveBtnStyle}>Save</button>
          <button onClick={onDelete} style={deleteBtnStyle}>Delete Card</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 8,
  padding: 24,
  width: 420,
  maxHeight: '80vh',
  overflow: 'auto',
  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
  marginTop: 12,
  color: '#555',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #ddd',
  borderRadius: 4,
  fontSize: 14,
  outline: 'none',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: 18,
  cursor: 'pointer',
  padding: '0 4px',
};

const saveBtnStyle: React.CSSProperties = {
  padding: '8px 20px',
  background: '#2196F3',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 600,
};

const deleteBtnStyle: React.CSSProperties = {
  padding: '8px 20px',
  background: '#F44336',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 600,
};
