import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import QRCodeGeneratorApp from "./components/QRCodeGeneratorApp";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QRCodeGeneratorApp />
  </React.StrictMode>
);
