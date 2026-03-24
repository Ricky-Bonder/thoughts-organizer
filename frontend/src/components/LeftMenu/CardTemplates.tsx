import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import type { CardTemplate } from '../../types';
import './LeftMenu.css';

const PRESET_COLORS = [
  '#FFF9C4', '#FFE0B2', '#FFCDD2', '#F8BBD0',
  '#BBDEFB', '#C8E6C9', '#E1BEE7', '#FFFFFF',
  'transparent',
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24];

interface CardTemplatesProps {
  template: CardTemplate;
  onChange: (template: CardTemplate) => void;
  onCreateCard: () => void;
  onColorChange?: (color: string) => void;
}

export default function CardTemplates({ template, onChange, onCreateCard, onColorChange }: CardTemplatesProps) {
  const [showCustomColor, setShowCustomColor] = useState(false);

  function handleColorClick(color: string) {
    onChange({ ...template, color });
    onColorChange?.(color);
  }

  return (
    <div className="left-menu__section">
      <h4>Card Style</h4>

      <div style={{ marginBottom: 10 }}>
        <span className="left-menu__label">Color</span>
        <div className="left-menu__color-grid" style={{ marginTop: 4 }}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              className={`left-menu__color-swatch ${template.color === c ? 'left-menu__color-swatch--selected' : ''} ${c === 'transparent' ? 'left-menu__color-swatch--transparent' : ''}`}
              style={{ backgroundColor: c === 'transparent' ? undefined : c }}
              onClick={() => handleColorClick(c)}
              title={c === 'transparent' ? 'Transparent' : c}
            />
          ))}
          <button
            onClick={() => setShowCustomColor(!showCustomColor)}
            className="left-menu__plus-btn"
          >
            +
          </button>
        </div>
        {showCustomColor && (
          <div style={{ marginTop: 8 }}>
            <HexColorPicker
              color={template.color === 'transparent' ? '#ffffff' : template.color}
              onChange={(c) => handleColorClick(c)}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <span className="left-menu__label" style={{ display: 'inline' }}>Font Size</span>
        <select
          value={template.font_size}
          onChange={(e) => onChange({ ...template, font_size: Number(e.target.value) })}
          className="left-menu__select"
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
