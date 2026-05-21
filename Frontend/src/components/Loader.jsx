import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './Loader.css';

const Loader = ({ showBar = true, isVisible = true }) => {
  return (
    <div className={`global-loader-overlay ${isVisible ? '' : 'hidden'}`}>
      <div className="loader-content">
        <div className="lottie-container">
          <DotLottieReact src="/Loading.lottie" loop autoplay />
        </div>
        {showBar && (
          <div className="loading-bar-container">
            <span className="loading-text">Loading...</span>
            <div className="loading-bar">
              <div className="loading-progress"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loader;
