import React from 'react';
import ReactDOM from 'react-dom/client';

import router from './router';
import { RouterProvider } from 'react-router-dom';

import './index.css';
import './assets/iconfont.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);
