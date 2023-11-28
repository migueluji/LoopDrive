// index.js
import { createRoot } from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import {  BrowserRouter } from 'react-router-dom';
import React from 'react';
import App from './App';
import { AppContextProvider } from './AppContext';

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </BrowserRouter>
);

reportWebVitals();

