import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as connectionsApi from '../api/connections';
import type { ConnectionDirection, ConnectionStyle } from '../types';

export function useCreateConnection(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sourceCardId,
      targetCardId,
      direction,
      style,
    }: {
      sourceCardId: string;
      targetCardId: string;
      direction?: ConnectionDirection;
      style?: ConnectionStyle;
    }) =>
      connectionsApi.createConnection(
        boardId,
        sourceCardId,
        targetCardId,
        direction,
        style
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useUpdateConnection(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      connectionId,
      updates,
    }: {
      connectionId: string;
      updates: { direction?: ConnectionDirection; style?: ConnectionStyle };
    }) => connectionsApi.updateConnection(connectionId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useDeleteConnection(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) =>
      connectionsApi.deleteConnection(connectionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}
