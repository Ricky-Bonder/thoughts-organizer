import client from './client';
import type { ConnectionData, ConnectionDirection, ConnectionStyle } from '../types';

export async function createConnection(
  boardId: string,
  sourceCardId: string,
  targetCardId: string,
  direction: ConnectionDirection = 'forward',
  style?: ConnectionStyle
): Promise<ConnectionData> {
  const { data } = await client.post(`/boards/${boardId}/connections`, {
    source_card_id: sourceCardId,
    target_card_id: targetCardId,
    direction,
    style,
  });
  return data;
}

export async function updateConnection(
  connectionId: string,
  updates: { direction?: ConnectionDirection; style?: ConnectionStyle }
): Promise<ConnectionData> {
  const { data } = await client.patch(`/connections/${connectionId}`, updates);
  return data;
}

export async function deleteConnection(connectionId: string): Promise<void> {
  await client.delete(`/connections/${connectionId}`);
}
