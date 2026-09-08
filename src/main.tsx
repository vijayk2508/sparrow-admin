import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminPanel } from './pages/AdminPanel.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminPanel />
  </StrictMode>,
);
