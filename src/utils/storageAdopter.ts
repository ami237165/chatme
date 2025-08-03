// idbStorage.ts
import localforage from 'localforage';

const idbStorage = {
  setItem: (key: string, value: string): Promise<any> => {
    return localforage.setItem(key, value);
  },
  getItem: (key: string): Promise<string | null> => {
    return localforage.getItem(key);
  },
  removeItem: (key: string): Promise<void> => {
    return localforage.removeItem(key);
  },
};

export default idbStorage;
