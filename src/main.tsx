import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import QRCodesPage from './QRCodesPage';
import './index.css';

const isQrCodesRoute = window.location.pathname.replace(/\/+$/, '') === '/qr-codes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isQrCodesRoute ? <QRCodesPage /> : <App />}
  </React.StrictMode>
);
