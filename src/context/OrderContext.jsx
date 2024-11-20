import React, { createContext, useContext, useState } from 'react';

// Create OrderContext
const OrderContext = createContext();

// Create a custom hook to use OrderContext
export const useOrder = () => {
  return useContext(OrderContext);
};

// OrderProvider to wrap the app
export const OrderProvider = ({ children }) => {
  const [orderItems, setOrderItems] = useState({});

  const updateOrderItem = (productId, quantity) => {
    setOrderItems((prevOrderItems) => {
      const newOrderItems = { ...prevOrderItems };
      if (quantity === 0) {
        delete newOrderItems[productId];
      } else {
        newOrderItems[productId] = quantity;
      }
      return newOrderItems;
    });
  };

  return (
    <OrderContext.Provider value={{ orderItems, updateOrderItem }}>
      {children}
    </OrderContext.Provider>
  );
};
