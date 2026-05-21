import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './Loader.css';

const Loader = ({ showBar = true, isVisible = true }) => {
  return (
    <div className={`global-loader-overlay ${isVisible ? '' : 'hidden'}`}>
      <div className="loader-content">
        <div className="lottie-container">
          <DotLottieReact src="https://lottie.host/23c83fda-09ea-4928-b899-8121bece22cd/WtC6KRywYf.lottie" loop autoplay />
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
