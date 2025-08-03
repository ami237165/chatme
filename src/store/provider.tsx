'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/index';
import { useEffect } from 'react';
import { setToken } from './slices/slice';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      store.dispatch(setToken(token));
    }
  }, []);
  return <Provider store={store}>{children}</Provider>;
}
