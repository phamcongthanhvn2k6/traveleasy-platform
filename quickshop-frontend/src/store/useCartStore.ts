import { create } from 'zustand';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => {
  const saved = localStorage.getItem('quickshop_cart');
  const initialItems = saved ? JSON.parse(saved) : [];

  const persist = (items: CartItem[]) => {
    localStorage.setItem('quickshop_cart', JSON.stringify(items));
    set({ items });
  };

  return {
    items: initialItems,
    addItem: (item) => {
      const items = [...get().items];
      const existing = items.find((i) => i.productId === item.productId);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, item.stock);
      } else {
        items.push({ ...item, quantity: 1 });
      }
      persist(items);
    },
    removeItem: (productId) => {
      persist(get().items.filter((i) => i.productId !== productId));
    },
    updateQuantity: (productId, quantity) => {
      if (quantity <= 0) {
        get().removeItem(productId);
      } else {
        persist(
          get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          )
        );
      }
    },
    clearCart: () => persist([]),
    getTotalAmount: () =>
      get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    getTotalCount: () =>
      get().items.reduce((sum, i) => sum + i.quantity, 0),
  };
});
