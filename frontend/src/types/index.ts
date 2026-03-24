export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mime_type: string;
  created_at: string;
}

export type CardType = 'card' | 'text_label';

export interface CardData {
  id: string;
  board_id: string;
  title: string;
  content: string;
  color: string;
  text_color: string;
  font_size: number;
  position: Position;
  size: Size;
  card_type: CardType;
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
}

export interface ConnectionStyle {
  color: string;
  stroke_width: number;
  line_type: 'solid' | 'dashed' | 'dotted';
}

export type ConnectionDirection = 'forward' | 'reverse' | 'both';

export interface ConnectionData {
  id: string;
  board_id: string;
  source_card_id: string;
  target_card_id: string;
  direction: ConnectionDirection;
  style: ConnectionStyle;
  created_at: string;
}

export interface BoardData {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface BoardFullData {
  board: BoardData;
  cards: CardData[];
  connections: ConnectionData[];
}

export type BoardMode = 'edit' | 'view';

export interface ArrowSettings {
  direction: ConnectionDirection;
  style: ConnectionStyle;
}

export interface CardTemplate {
  color: string;
  text_color: string;
  font_size: number;
}
