import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as cardsApi from '../api/cards';
import type { CardData, Position } from '../types';

export function useCreateCard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (card: Partial<CardData>) => cardsApi.createCard(boardId, card),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useUpdateCard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      updates,
    }: {
      cardId: string;
      updates: Partial<CardData>;
    }) => cardsApi.updateCard(cardId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useDeleteCard(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => cardsApi.deleteCard(cardId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useBatchUpdatePositions(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: string; position: Position }[]) =>
      cardsApi.batchUpdatePositions(boardId, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useAddAttachment(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      attachment,
    }: {
      cardId: string;
      attachment: {
        id: string;
        filename: string;
        url: string;
        mime_type: string;
        created_at: string;
      };
    }) => cardsApi.addAttachment(cardId, attachment),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}

export function useRemoveAttachment(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      attachmentId,
    }: {
      cardId: string;
      attachmentId: string;
    }) => cardsApi.removeAttachment(cardId, attachmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['board', boardId] }),
  });
}
