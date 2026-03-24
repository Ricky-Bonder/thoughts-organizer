import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import type { CardTemplate } from '../../types';
import './LeftMenu.css';

const PRESET_COLORS = [
  '#FFF9C4', '#FFE0B2', '#FFCDD2', '#F8BBD0',
  '#BBDEFB', '#C8E6C9', '#E1BEE7', '#FFFFFF',
  'transparent',
];

const TEXT_COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#FFFFFF' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24];

interface CardTemplatesProps {
  template: CardTemplate;
  onChange: (template: CardTemplate) => void;
  onCreateCard: () => void;
  onColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
}

export default function CardTemplates({ template, onChange, onCreateCard, onColorChange, onTextColorChange }: CardTemplatesProps) {
  const [showCustomColor, setShowCustomColor] = useState(false);

  function handleColorClick(color: string) {
    onChange({ ...template, color });
    onColorChange?.(color);
  }

  function handleTextColorClick(color: string) {
    onChange({ ...template, text_color: color });
    onTextColorChange?.(color);
  }

  return (
    <div className="left-menu__section">
      <h4>Card Style</h4>

      <div style={{ marginBottom: 10 }}>
        <span className="left-menu__label">Background</span>
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

      <div style={{ marginBottom: 10 }}>
        <span className="left-menu__label">Text Color</span>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {TEXT_COLORS.map(({ label, value }) => (
            <button
              key={value}
              className={`left-menu__arrow-option ${template.text_color === value ? 'left-menu__arrow-option--selected' : ''}`}
              onClick={() => handleTextColorClick(value)}
              style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
            >
              <span style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                borderRadius: 3,
                backgroundColor: value,
                border: '1px solid rgba(128,128,128,0.4)',
                verticalAlign: 'middle',
                marginRight: 4,
              }} />
              {label}
            </button>
          ))}
        </div>
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
