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
  cardId: string;
  cardData: Partial<CardData>;
}

interface DeleteAction {
  type: 'delete';
  cardId: string;
  cardData: Partial<CardData>;
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
  const undoStackRef = useRef<UndoAction[]>([]);
  const redoStackRef = useRef<UndoAction[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const callbacksRef = useRef<UndoRedoCallbacks | null>(null);
  // Maps old card IDs to new card IDs after re-creation
  const idMapRef = useRef<Record<string, string>>({});

  const setCallbacks = useCallback((cbs: UndoRedoCallbacks) => {
    callbacksRef.current = cbs;
  }, []);

  function resolveId(id: string): string {
    return idMapRef.current[id] || id;
  }

  function syncFlags() {
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
  }

  const pushAction = useCallback((action: UndoAction) => {
    undoStackRef.current = [...undoStackRef.current, action];
    redoStackRef.current = [];
    syncFlags();
  }, []);

  const undo = useCallback(() => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    const cbs = callbacksRef.current;
    if (!cbs) return;

    const action = stack[stack.length - 1];
    undoStackRef.current = stack.slice(0, -1);
    redoStackRef.current = [...redoStackRef.current, action];
    syncFlags();

    switch (action.type) {
      case 'move':
        cbs.updateCard(resolveId(action.cardId), { position: action.oldPosition });
        break;
      case 'create':
        cbs.deleteCard(resolveId(action.cardId));
        break;
      case 'delete':
        cbs.createCard(action.cardData).then((newCard) => {
          idMapRef.current[action.cardId] = newCard.id;
        });
        break;
      case 'color':
        cbs.updateCard(resolveId(action.cardId), { color: action.oldColor });
        break;
    }
  }, []);

  const redo = useCallback(() => {
    const stack = redoStackRef.current;
    if (stack.length === 0) return;
    const cbs = callbacksRef.current;
    if (!cbs) return;

    const action = stack[stack.length - 1];
    redoStackRef.current = stack.slice(0, -1);
    undoStackRef.current = [...undoStackRef.current, action];
    syncFlags();

    switch (action.type) {
      case 'move':
        cbs.updateCard(resolveId(action.cardId), { position: action.newPosition });
        break;
      case 'create':
        cbs.createCard(action.cardData).then((newCard) => {
          idMapRef.current[action.cardId] = newCard.id;
        });
        break;
      case 'delete':
        cbs.deleteCard(resolveId(action.cardId));
        break;
      case 'color':
        cbs.updateCard(resolveId(action.cardId), { color: action.newColor });
        break;
    }
  }, []);

  return {
    pushAction,
    undo,
    redo,
    canUndo,
    canRedo,
    setCallbacks,
  };
}
