import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import DiceLab from './DiceLab.jsx';
import './dice-lab.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DiceLab />
  </StrictMode>,
);
