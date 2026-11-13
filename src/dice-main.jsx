import PennyContactRouter from './components/PennyContactRouter.jsx';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MessengerLauncher from './components/MessengerLauncher.jsx';
import DiceLab from './DiceLab.jsx';
import AskPenny from './components/AskPenny.jsx';
import './dice-lab.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DiceLab />
    <AskPenny />
    <MessengerLauncher />
    <PennyContactRouter videoSource="/static/PennyContactAssistVideo.webm" />
  </StrictMode>,
);
