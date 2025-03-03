import React, { forwardRef, useImperativeHandle, useState } from "react";
import "./index.css";

const Popup = forwardRef(({ children, position, wrapClass = "" }, ref) => {
  const [showWrap, setShowWrap] = useState(false);
  const [showList, setShowList] = useState(false);

  const animate = (visable) => {
    if (visable) {
      setShowWrap(true);
      setTimeout(() => {
        setShowList(true);
      }, 100);
    } else {
      setShowList(false);
      setTimeout(() => {
        setShowWrap(false);
      }, 300);
    }
  };

  useImperativeHandle(ref, () => ({
    animate: (show) => animate(show),
  }));

  return (
    showWrap && (
      <div className={`role-wrap ${showList ? "show" : ""}`}>
        <div className="opacity-wrap" onClick={() => animate(false)}></div>
        {position == "left" ? (
          <div className={`left-wrap ${showList ? "show" : ""} ${wrapClass}`}>
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    )
  );
});

export default Popup;
