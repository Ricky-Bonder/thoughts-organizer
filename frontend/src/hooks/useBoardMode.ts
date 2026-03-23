import { createContext, useContext } from 'react';
import type { BoardMode } from '../types';

interface BoardModeContextType {
  mode: BoardMode;
  setMode: (mode: BoardMode) => void;
}

export const BoardModeContext = createContext<BoardModeContextType>({
  mode: 'edit',
  setMode: () => {},
});

export function useBoardMode() {
  return useContext(BoardModeContext);
}
