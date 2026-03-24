import { useCallback, useRef, useState } from 'react';
import type { CardData, Position } from '../types';

interface MoveAction {
  type: 'move';
  cardId: string;
  oldPosition: Position;
  newPosition: Position;
}

interface CreateAction {
  type: 'create';
  card: CardData;
}

interface DeleteAction {
  type: 'delete';
  card: CardData;
}

interface ColorAction {
  type: 'color';
  cardId: string;
  oldColor: string;
  newColor: string;
}

export type UndoAction = MoveAction | CreateAction | DeleteAction | ColorAction;

interface UndoRedoCallbacks {
  updateCard: (cardId: string, updates: Partial<CardData>) => void;
  createCard: (data: Partial<CardData>) => Promise<CardData>;
  deleteCard: (cardId: string) => void;
}

export function useUndoRedo() {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);
  const callbacksRef = useRef<UndoRedoCallbacks | null>(null);

  const setCallbacks = useCallback((cbs: UndoRedoCallbacks) => {
    callbacksRef.current = cbs;
  }, []);

  const pushAction = useCallback((action: UndoAction) => {
    setUndoStack((prev) => [...prev, action]);
    setRedoStack([]);
  }, []);

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const action = prev[prev.length - 1];
      const cbs = callbacksRef.current;
      if (!cbs) return prev;

      switch (action.type) {
        case 'move':
          cbs.updateCard(action.cardId, { position: action.oldPosition });
          break;
        case 'create':
          cbs.deleteCard(action.card.id);
          break;
        case 'delete':
          cbs.createCard({
            title: action.card.title,
            content: action.card.content,
            color: action.card.color,
            font_size: action.card.font_size,
            position: action.card.position,
            size: action.card.size,
            card_type: action.card.card_type,
          });
          break;
        case 'color':
          cbs.updateCard(action.cardId, { color: action.oldColor });
          break;
      }

      setRedoStack((r) => [...r, action]);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const action = prev[prev.length - 1];
      const cbs = callbacksRef.current;
      if (!cbs) return prev;

      switch (action.type) {
        case 'move':
          cbs.updateCard(action.cardId, { position: action.newPosition });
          break;
        case 'create':
          cbs.createCard({
            title: action.card.title,
            content: action.card.content,
            color: action.card.color,
            font_size: action.card.font_size,
            position: action.card.position,
            size: action.card.size,
            card_type: action.card.card_type,
          });
          break;
        case 'delete':
          cbs.deleteCard(action.card.id);
          break;
        case 'color':
          cbs.updateCard(action.cardId, { color: action.newColor });
          break;
      }

      setUndoStack((u) => [...u, action]);
      return prev.slice(0, -1);
    });
  }, []);

  return {
    pushAction,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    setCallbacks,
  };
}
