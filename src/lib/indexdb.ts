// lib/indexedDb.ts
import { openDB } from "idb";

const DB_NAME = "ChatMediaDB";
const STORE_NAME = "mediaFiles";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME);
  },
});

export const saveMediaToIndexedDB = async (id: string, file:any) => {
  const db = await dbPromise;
  await db.put(STORE_NAME, file, id);
};

export const getMediaFromIndexedDB = async (
  id: string
): Promise<ArrayBuffer | undefined> => {
  const db = await dbPromise;
  return db.get(STORE_NAME, id);
};

export const deleteMediaFromIndexedDB = async (id: string) => {
  const db = await dbPromise;
  return db.delete(STORE_NAME, id);
};
