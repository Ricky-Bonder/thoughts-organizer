import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import type { CardTemplate } from '../../types';
import './LeftMenu.css';

const PRESET_TEMPLATES: CardTemplate[] = [
  { color: '#FFEB3B', font_size: 14 },
  { color: '#FF9800', font_size: 14 },
  { color: '#F44336', font_size: 14 },
  { color: '#2196F3', font_size: 14 },
  { color: '#4CAF50', font_size: 14 },
  { color: '#9C27B0', font_size: 14 },
  { color: '#E91E63', font_size: 16 },
  { color: '#FFFFFF', font_size: 14 },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24];

interface CardTemplatesProps {
  template: CardTemplate;
  onChange: (template: CardTemplate) => void;
  onCreateCard: () => void;
}

export default function CardTemplates({ template, onChange, onCreateCard }: CardTemplatesProps) {
  const [showCustomColor, setShowCustomColor] = useState(false);

  return (
    <div className="left-menu__section">
      <h4>Card Style</h4>

      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: '#666' }}>Color</span>
        <div className="left-menu__color-grid" style={{ marginTop: 4 }}>
          {PRESET_TEMPLATES.map((t, i) => (
            <button
              key={i}
              className={`left-menu__color-swatch ${template.color === t.color ? 'left-menu__color-swatch--selected' : ''}`}
              style={{ backgroundColor: t.color }}
              onClick={() => onChange({ ...template, color: t.color })}
            />
          ))}
          <button
            onClick={() => setShowCustomColor(!showCustomColor)}
            style={{ fontSize: 11, padding: '4px 6px', borderRadius: 4, border: '1px solid #ccc', cursor: 'pointer', background: '#fff' }}
          >
            +
          </button>
        </div>
        {showCustomColor && (
          <div style={{ marginTop: 8 }}>
            <HexColorPicker color={template.color} onChange={(c) => onChange({ ...template, color: c })} />
          </div>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: '#666' }}>Font Size</span>
        <select
          value={template.font_size}
          onChange={(e) => onChange({ ...template, font_size: Number(e.target.value) })}
          style={{ marginLeft: 8, padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>
      </div>

      <button className="left-menu__btn left-menu__btn--primary" onClick={onCreateCard}>
        + New Card
      </button>
    </div>
  );
}
