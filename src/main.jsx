import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from "./redux"
import { Provider } from "react-redux";
import { initPerformanceMonitoring } from "./lib/performance";

// FE 07: Initialize Core Web Vitals performance observer
initPerformanceMonitoring();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
