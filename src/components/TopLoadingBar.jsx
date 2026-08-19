import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./style/topLoadingBar.scss";

const TopLoadingBar = ({ isIndeterminate = false }) => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  useEffect(() => {
    if (isIndeterminate) {
      setIsVisible(true);
      return;
    }

    clearAllTimeouts();
    setIsVisible(true);
    setProgress(25);

    const t1 = setTimeout(() => {
      setProgress(65);
    }, 100);

    const t2 = setTimeout(() => {
      setProgress(90);
    }, 240);

    const t3 = setTimeout(() => {
      setProgress(100);
    }, 380);

    const t4 = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 600);

    timeoutsRef.current = [t1, t2, t3, t4];

    return () => {
      clearAllTimeouts();
    };
  }, [location.pathname, location.search, isIndeterminate]);

  if (!isVisible && progress === 0 && !isIndeterminate) {
    return null;
  }

  return (
    <div className={`top-loading-bar-container ${isIndeterminate ? "indeterminate" : ""}`}>
      <div
        className="top-loading-bar-fill"
        style={{
          width: isIndeterminate ? "100%" : `${progress}%`,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  );
};

export default TopLoadingBar;
