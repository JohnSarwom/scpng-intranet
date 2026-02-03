import React, { useEffect, useRef } from 'react';

const TradingViewTicker: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptAppendedRef = useRef(false); // Ref to track if script has been appended

  useEffect(() => {
    if (!containerRef.current || scriptAppendedRef.current) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        {
          "description": "PGK Vs GBP",
          "proName": "FX_IDC:PGKGBP"
        },
        {
          "description": "PGK Vs USD",
          "proName": "FX_IDC:PGKUSD"
        },
        {
          "description": "PGK Vs HKD",
          "proName": "FX_IDC:PGKHKD"
        }
      ],
      "showSymbolLogo": false,
      "colorTheme": "light",
      "isTransparent": false,
      "displayMode": "adaptive",
      "locale": "en"
    });

    containerRef.current.appendChild(script);
    scriptAppendedRef.current = true; // Mark script as appended

    // Basic fade-in effect
    if (containerRef.current) {
      containerRef.current.style.opacity = '0';
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = 'opacity 0.5s ease-in-out';
          containerRef.current.style.opacity = '1';
        }
      }, 100); // Small delay to ensure styles apply for transition
    }

    // Cleanup function to remove the script when the component unmounts
    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        // containerRef.current.removeChild(script); // TradingView widget might add more, so direct removal can be tricky
        // It's often safer to let TradingView manage its own DOM elements it creates inside its container.
        // Clearing the innerHTML is a more robust way if direct script removal is problematic.
        // However, for this widget, letting it stay might be fine unless it causes issues on re-renders.
        // For now, we'll rely on scriptAppendedRef to prevent re-adding.
      }
      // If strict cleanup is needed, one might need to find all elements added by TradingView.
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container relative overflow-hidden" // Added relative and overflow-hidden for mask positioning
      style={{
        opacity: 0, // Initial opacity for component fade-in
        // Fades out on the left (0%-10%), opaque (10%-80%), fades in on the right (80%-100%)
        maskImage: 'linear-gradient(to left, transparent 0%, black 10%, black 80%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to left, transparent 0%, black 10%, black 80%, transparent 100%)', // For Safari/Chrome
        // Consider adding a specific height for better alignment, e.g., height: '40px' or '50px'
        // This can help prevent layout shifts or vertical alignment issues with the title.
        // You'll need to experiment to find the best height that matches your title's line height.
        // height: '40px', 
      }}
    >
      <div className="tradingview-widget-container__widget"></div>
      {/* The copyright is optional and can be removed if desired, per TradingView terms if applicable */}
      {/* <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div> */}
    </div>
  );
};

export default TradingViewTicker;