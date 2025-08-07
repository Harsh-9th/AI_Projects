import React from 'react';
import ReactDOM from 'react-dom/client';
import Bot from './front_bot';
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Bot />
  </React.StrictMode>
);