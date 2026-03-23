import client from './client';
import type { CardData, Position } from '../types';

export async function createCard(
  boardId: string,
  card: Partial<CardData>
): Promise<CardData> {
  const { data } = await client.post(`/boards/${boardId}/cards`, card);
  return data;
}

export async function updateCard(
  cardId: string,
  updates: Partial<CardData>
): Promise<CardData> {
  const { data } = await client.patch(`/cards/${cardId}`, updates);
  return data;
}

export async function deleteCard(cardId: string): Promise<void> {
  await client.delete(`/cards/${cardId}`);
}

export async function batchUpdatePositions(
  boardId: string,
  updates: { id: string; position: Position }[]
): Promise<void> {
  await client.patch(`/boards/${boardId}/cards/batch-position`, { updates });
}

export async function addAttachment(
  cardId: string,
  attachment: {
    id: string;
    filename: string;
    url: string;
    mime_type: string;
    created_at: string;
  }
): Promise<CardData> {
  const { data } = await client.post(
    `/cards/${cardId}/attachments`,
    attachment
  );
  return data;
}

export async function removeAttachment(
  cardId: string,
  attachmentId: string
): Promise<CardData> {
  const { data } = await client.delete(
    `/cards/${cardId}/attachments/${attachmentId}`
  );
  return data;
}
