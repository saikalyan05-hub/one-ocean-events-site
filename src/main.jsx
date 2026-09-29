// Shared layers first, in cascade order. Vite emits CSS in module-graph order,
// so a shared sheet that is only reached through a component would otherwise
// land *after* that component and win every equal-specificity tie — which is
// how `.icon-btn-wrap` came to beat the header's own media queries.
import './styles/global.css';
import './components/common/common.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
