'use client'

import React from 'react';

const TossleBall = () => {
  return (
    <div className="loading-overlay">
      <div className="tossle-balls-spinner">
        <div className="ball"></div>
        <div className="ball"></div>
        <div className="ball"></div>
      </div>
      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }
        .tossle-balls-spinner {
          display: flex;
          gap: 10px;
        }
        .ball {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          animation: tossle 1.2s infinite ease-in-out;
        }
        .ball:nth-child(1) {
            background-color: #0ef6cc;
            animation-delay: -0.8s;
        }
        .ball:nth-child(2) {
            background-color: #ff2d78;
            animation-delay: -0.4s;
        }
        .ball:nth-child(3) {
            background-color: #0ef6cc;
        }
        @keyframes tossle {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-40px) scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

export default TossleBall;