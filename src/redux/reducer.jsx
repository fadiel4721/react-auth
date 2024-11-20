import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orderItems: {}, // { productId: { name, price, quantity, image, totalPrice } }
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    updateOrderItem: (state, action) => {
      const { productId, name, price, quantity, image } = action.payload;

      // Update the item or remove it if quantity <= 0
      if (quantity <= 0) {
        delete state.orderItems[productId]; // Remove product
      } else {
        state.orderItems[productId] = {
          ...state.orderItems[productId], // Preserve existing data
          name,
          price,
          quantity,
          image,
          totalPrice: price * quantity, // Calculate total price for the item
        };
      }
    },
    removeOrderItem: (state, action) => {
      const { productId } = action.payload;
      delete state.orderItems[productId];
    },
    resetOrder: (state) => {
      state.orderItems = {}; // Reset all order items
    },
  },
});

// Selectors
export const selectOrderItems = (state) => state.order.orderItems;

export const selectTotalPrice = (state) => {
  const orderItems = state.order.orderItems;
  return Object.values(orderItems).reduce((total, item) => total + item.totalPrice, 0);
};

export const { updateOrderItem, removeOrderItem, resetOrder } = orderSlice.actions;

export default orderSlice.reducer;
