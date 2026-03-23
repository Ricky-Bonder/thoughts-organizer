import client from './client';
import type { BoardData, BoardFullData } from '../types';

export async function getBoards(): Promise<BoardData[]> {
  const { data } = await client.get('/boards');
  return data;
}

export async function createBoard(name: string): Promise<BoardData> {
  const { data } = await client.post('/boards', { name });
  return data;
}

export async function getBoard(boardId: string): Promise<BoardFullData> {
  const { data } = await client.get(`/boards/${boardId}`);
  return data;
}

export async function deleteBoard(boardId: string): Promise<void> {
  await client.delete(`/boards/${boardId}`);
}
