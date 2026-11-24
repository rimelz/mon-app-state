
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalCount: 0,
  totalPrice: 0
};

const recalculateTotals = (state) => {
  state.totalCount = state.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  state.totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const existing = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existing) {
        // Grâce à Immer, la mutation directe produit un snapshot immuable
        existing.quantity += 1;
      } else {
        state.items.push({
          ...action.payload,
          quantity: 1
        });
      }

      recalculateTotals(state);
    },

    removeItem: (state, action) => {
      const existing = state.items.find(
        (item) => item.id === action.payload
      );

      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1;
        } else {
          state.items = state.items.filter(
            (item) => item.id !== action.payload
          );
        }
      }

      recalculateTotals(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.totalCount = 0;
      state.totalPrice = 0;
    }
  }
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
