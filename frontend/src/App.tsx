import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBoards, createBoard, getBoard } from './api/boards';
import { BoardModeContext } from './hooks/useBoardMode';
import Canvas from './components/Canvas/Canvas';
import type { BoardMode } from './types';

export default function App() {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [boardMode, setBoardMode] = useState<BoardMode>('edit');
  const queryClient = useQueryClient();

  const { data: boards } = useQuery({
    queryKey: ['boards'],
    queryFn: getBoards,
  });

  useEffect(() => {
    if (boards && boards.length > 0 && !boardId) {
      setBoardId(boards[0].id);
    } else if (boards && boards.length === 0 && !boardId) {
      createBoard('My First Board').then((board) => {
        setBoardId(board.id);
        queryClient.invalidateQueries({ queryKey: ['boards'] });
      });
    }
  }, [boards, boardId, queryClient]);

  const { data: boardData } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => getBoard(boardId!),
    enabled: !!boardId,
  });

  if (!boardId || !boardData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#888' }}>
        Loading...
      </div>
    );
  }

  return (
    <BoardModeContext.Provider value={{ mode: boardMode, setMode: setBoardMode }}>
      <Canvas
        boardId={boardId}
        cards={boardData.cards}
        connections={boardData.connections}
      />
    </BoardModeContext.Provider>
  );
}
