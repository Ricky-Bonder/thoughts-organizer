import { useState } from 'react';
import ArrowPicker from './ArrowPicker';
import CardTemplates from './CardTemplates';
import UploadButton from './UploadButton';
import { useBoardMode } from '../../hooks/useBoardMode';
import type { ArrowSettings, CardTemplate } from '../../types';
import './LeftMenu.css';

interface LeftMenuProps {
  arrowSettings: ArrowSettings;
  onArrowSettingsChange: (settings: ArrowSettings) => void;
  cardTemplate: CardTemplate;
  onCardTemplateChange: (template: CardTemplate) => void;
  onCreateCard: () => void;
  onUpload: (files: FileList) => void;
}

export default function LeftMenu({
  arrowSettings,
  onArrowSettingsChange,
  cardTemplate,
  onCardTemplateChange,
  onCreateCard,
  onUpload,
}: LeftMenuProps) {
  const [collapsed, setCollapsed] = useState(true);
  const { mode } = useBoardMode();

  if (mode === 'view') {
    return null;
  }

  return (
    <>
      <button
        className={`left-menu__toggle ${!collapsed ? 'left-menu__toggle--open' : ''}`}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? '\u2630' : '\u2715'}
      </button>
      <div className={`left-menu ${collapsed ? 'left-menu--collapsed' : ''}`}>
        <div style={{ padding: '16px 16px 8px', fontWeight: 700, fontSize: 16 }}>
          Tools
        </div>
        <CardTemplates
          template={cardTemplate}
          onChange={onCardTemplateChange}
          onCreateCard={onCreateCard}
        />
        <ArrowPicker
          settings={arrowSettings}
          onChange={onArrowSettingsChange}
        />
        <UploadButton onUpload={onUpload} />
      </div>
    </>
  );
}
