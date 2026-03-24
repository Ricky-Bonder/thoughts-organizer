import { useState } from 'react';
import ArrowPicker from './ArrowPicker';
import CardTemplates from './CardTemplates';
import UploadButton from './UploadButton';
import { useBoardMode } from '../../hooks/useBoardMode';
import { useTheme } from '../../hooks/useTheme';
import type { ArrowSettings, CardTemplate } from '../../types';
import './LeftMenu.css';

interface LeftMenuProps {
  arrowSettings: ArrowSettings;
  onArrowSettingsChange: (settings: ArrowSettings) => void;
  cardTemplate: CardTemplate;
  onCardTemplateChange: (template: CardTemplate) => void;
  onCreateCard: () => void;
  onUpload: (files: FileList) => void;
  onColorChange?: (color: string) => void;
}

export default function LeftMenu({
  arrowSettings,
  onArrowSettingsChange,
  cardTemplate,
  onCardTemplateChange,
  onCreateCard,
  onUpload,
  onColorChange,
}: LeftMenuProps) {
  const [collapsed, setCollapsed] = useState(true);
  const { mode } = useBoardMode();
  const { theme, setTheme } = useTheme();

  if (mode === 'view') {
    return null;
  }

  return (
    <>
      <button
        className={`left-menu__toggle ${!collapsed ? 'left-menu__toggle--open' : ''}`}
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Open tools' : 'Close tools'}
      >
        {collapsed ? '\u2630' : '\u2715'}
      </button>
      <div className={`left-menu ${collapsed ? 'left-menu--collapsed' : ''}`}>
        <div className="left-menu__header">
          Tools
        </div>
        <CardTemplates
          template={cardTemplate}
          onChange={onCardTemplateChange}
          onCreateCard={onCreateCard}
          onColorChange={onColorChange}
        />
        <ArrowPicker
          settings={arrowSettings}
          onChange={onArrowSettingsChange}
        />
        <UploadButton onUpload={onUpload} />
        <div className="left-menu__section">
          <h4>Appearance</h4>
          <button
            className="left-menu__btn"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            {theme === 'light' ? '\u{1F319} Dark Mode' : '\u{2600}\u{FE0F} Light Mode'}
          </button>
        </div>
      </div>
    </>
  );
}
