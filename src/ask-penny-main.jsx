import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AskPenny from './components/AskPenny.jsx'
import { allowedConciergeOrigin } from './components/concierge-origin.js'

const framed = window.parent !== window
const parentOrigin = new URLSearchParams(location.search).get('parent') || ''
const permitted = framed && allowedConciergeOrigin(parentOrigin)

function close() {
  if (permitted) window.parent.postMessage({ type: 'wildcard:ask-penny:close' }, parentOrigin)
  else if (!framed) window.location.replace('/')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {framed && !permitted ? <p>Ask Penny is available on WildCard DEV sites.</p> :
      <AskPenny embedded onClose={close} />}
  </StrictMode>
)
