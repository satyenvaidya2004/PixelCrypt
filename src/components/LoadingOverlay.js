// src/components/LoadingOverlay.js
import React from "react";
import "../styles/LoadingOverlay.css";

export default function LoadingOverlay({ show, message = "Processing..." }) {
  if (!show) return null;

  return (
    <div className="global-loading-overlay">
      <div className="loader-container">

        {/* 8-dot rotating loader */}
        <div className="circular-dot-loader">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>

        <p className="loader-text">{message}</p>
      </div>
    </div>
  );
}
