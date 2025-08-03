// selectors/messages.ts
import { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';

export const selectMessagesByRoomId = (roomId: string) =>
  createSelector(
    (state: RootState) => state.message,
    (message) => message[roomId] || []
  );
