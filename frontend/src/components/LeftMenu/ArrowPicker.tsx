import { HexColorPicker } from 'react-colorful';
import { useState } from 'react';
import type { ArrowSettings, ConnectionDirection, ConnectionStyle } from '../../types';
import './LeftMenu.css';

const ARROW_COLORS = ['#555555', '#F44336', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'];
const LINE_TYPES: ConnectionStyle['line_type'][] = ['solid', 'dashed', 'dotted'];
const STROKE_WIDTHS = [
  { label: 'Thin', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'Thick', value: 4 },
];

interface ArrowPickerProps {
  settings: ArrowSettings;
  onChange: (settings: ArrowSettings) => void;
}

export default function ArrowPicker({ settings, onChange }: ArrowPickerProps) {
  const [showCustomColor, setShowCustomColor] = useState(false);

  function setDirection(direction: ConnectionDirection) {
    onChange({ ...settings, direction });
  }

  function setStyleProp<K extends keyof ConnectionStyle>(key: K, value: ConnectionStyle[K]) {
    onChange({ ...settings, style: { ...settings.style, [key]: value } });
  }

  return (
    <div className="left-menu__section">
      <h4>Arrow Style</h4>

      <div style={{ marginBottom: 10 }}>
        <span className="left-menu__label">Direction</span>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {([
            { dir: 'forward' as const, label: '\u2192' },
            { dir: 'reverse' as const, label: '\u2190' },
            { dir: 'both' as const, label: '\u2194' },
          ]).map(({ dir, label }) => (
            <button
              key={dir}
              className={`left-menu__arrow-option ${settings.direction === dir ? 'left-menu__arrow-option--selected' : ''}`}
              onClick={() => setDirection(dir)}
              style={{ flex: 1, justifyContent: 'center', fontSize: 18 }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <span className="left-menu__label">Color</span>
        <div className="left-menu__color-grid" style={{ marginTop: 4 }}>
          {ARROW_COLORS.map((c) => (
            <button
              key={c}
              className={`left-menu__color-swatch ${settings.style.color === c ? 'left-menu__color-swatch--selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setStyleProp('color', c)}
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
            <HexColorPicker color={settings.style.color} onChange={(c) => setStyleProp('color', c)} />
          </div>
        )}
      </div>

      <div style={{ marginBottom: 10 }}>
        <span className="left-menu__label">Line</span>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {LINE_TYPES.map((lt) => (
            <button
              key={lt}
              className={`left-menu__arrow-option ${settings.style.line_type === lt ? 'left-menu__arrow-option--selected' : ''}`}
              onClick={() => setStyleProp('line_type', lt)}
              style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
            >
              {lt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="left-menu__label">Width</span>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {STROKE_WIDTHS.map(({ label, value }) => (
            <button
              key={value}
              className={`left-menu__arrow-option ${settings.style.stroke_width === value ? 'left-menu__arrow-option--selected' : ''}`}
              onClick={() => setStyleProp('stroke_width', value)}
              style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
