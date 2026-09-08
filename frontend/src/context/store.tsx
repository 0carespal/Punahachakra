import { createContext, useContext, useState, useCallback, useRef } from 'react';

export interface Toast { id: number; message: string; type: 'success' | 'info' | 'error'; exiting?: boolean; }

interface Store {
  offerSent: boolean;
  paymentComplete: boolean;
  materialDropped: boolean;
  notifications: number;
  toasts: Toast[];
  setOfferSent: (v: boolean) => void;
  setPaymentComplete: (v: boolean) => void;
  setMaterialDropped: (v: boolean) => void;
  setNotifications: React.Dispatch<React.SetStateAction<number>>;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: number) => void;
}

const StoreCtx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [offerSent, setOfferSent] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [materialDropped, setMaterialDropped] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, exiting: true } : x));
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 350);
    }, 3500);
  }, []);

  const removeToast = (id: number) => setToasts(t => t.filter(x => x.id !== id));

  return (
    <StoreCtx.Provider value={{
      offerSent, paymentComplete, materialDropped, notifications, toasts,
      setOfferSent, setPaymentComplete, setMaterialDropped, setNotifications,
      addToast, removeToast,
    }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
