import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

//  ADD THESE LINES
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'; // (if you have custom styles)

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);