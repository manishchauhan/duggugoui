import React, { useState, useEffect } from 'react';
import './MessageBadge.css'; // Import the CSS file for styling

const MessageBadge = ({ name, message ,status}) => {
  const [isVisible, setIsVisible] = useState(status);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`messageBadge  ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="badge-content">
        <div className="name">{name}</div>
        <div className="message">{message}</div>
      </div>
    </div>
  );
};

export default MessageBadge;
