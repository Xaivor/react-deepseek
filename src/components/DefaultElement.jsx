import React, { useEffect } from 'react';

// 页面标题
const DefaultElement = ({ element: Component, meta }) => {
  useEffect(() => {
    document.title = meta.title || '载入中...';
  }, [meta]);

  return (
    <Component />
  );
}

export default DefaultElement;