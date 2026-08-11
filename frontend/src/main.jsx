import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { addCollection } from '@iconify/react';
import iconamoon from '@iconify-json/iconamoon/icons.json';
import bx from '@iconify-json/bx/icons.json';
import bxs from '@iconify-json/bxs/icons.json';
import bxl from '@iconify-json/bxl/icons.json';
import App from './App';
import { basePath } from './context/constants';

addCollection(iconamoon);
addCollection(bx);
addCollection(bxs);
addCollection(bxl);
createRoot(document.getElementById('root')).render(<StrictMode>
    <BrowserRouter basename={basePath}>
      <App />
    </BrowserRouter>
  </StrictMode>);