import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// Polyfill to fix troika-three-text customDepthMaterial setter issue
import "./three-text-polyfill";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
