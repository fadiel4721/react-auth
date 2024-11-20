import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import './index.css'; // Custom CSS

import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

// Import Redux Provider and store
import { Provider } from 'react-redux';
import store from './redux/store'; // Adjust the path if necessary

// Import OrderProvider
import { OrderProvider } from './context/OrderContext'; // Adjust the import path as necessary

// Font Awesome Imports
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
library.add(fas, far); // Add all icons to the library

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Wrap the entire application with both Redux Provider and OrderProvider */}
      <Provider store={store}>
        <OrderProvider>
          <AppRoutes />
        </OrderProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
