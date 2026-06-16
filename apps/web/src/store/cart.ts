'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  title: string;
  slug: string | null;
  image: string | null;
  price: number;
  quantity: number;
  stockQty?: number;
};

type CartState = {
  items: CartItem[];

  add: (item: CartItem) => boolean;

  buyNow: (item: CartItem) => boolean;

  remove: (productId: string) => void;

  setQuantity: (productId: string, quantity: number) => void;

  clear: () => void;
};

function normalizeQuantity(quantity: number, stockQty?: number) {
  const safeQuantity = Math.max(1, Math.floor(quantity || 1));

  if (!stockQty || stockQty <= 0) {
    return safeQuantity;
  }

  return Math.min(stockQty, safeQuantity);
}

function canAdd(item: CartItem) {
  return !item.stockQty || item.stockQty > 0;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (item) => {
        if (!canAdd(item)) return false;

        set((state) => {
          const existing = state.items.find((entry) => entry.productId === item.productId);
          const quantity = normalizeQuantity(item.quantity, item.stockQty);

          if (existing) {
            const stockQty = item.stockQty ?? existing.stockQty;

            return {
              items: state.items.map((entry) =>
                entry.productId === item.productId
                  ? {
                      ...entry,
                      ...item,
                      stockQty,
                      quantity: normalizeQuantity(entry.quantity + quantity, stockQty)
                    }
                  : entry
              )
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity
              }
            ]
          };
        });

        return true;
      },

      buyNow: (item) => {
        if (!canAdd(item)) return false;

        set({
          items: [
            {
              ...item,
              quantity: normalizeQuantity(item.quantity, item.stockQty)
            }
          ]
        });

        return true;
      },

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId)
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: normalizeQuantity(quantity, item.stockQty)
                }
              : item
          )
        })),

      clear: () =>
        set({
          items: []
        })
    }),
    {
      name: 'greenhome-cart',
      partialize: (state) => ({ items: state.items })
    }
  )
);
