import PennyContactRouter from './components/PennyContactRouter.jsx';
import pennyContactAssistVideo from '../assets/PennyContactAssistVideo.webm';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MessengerLauncher from './components/MessengerLauncher.jsx';
import DiceLab from './DiceLab.jsx';
import './dice-lab.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DiceLab />
    <MessengerLauncher />
    <PennyContactRouter videoSource={pennyContactAssistVideo} />
  </StrictMode>,
);
