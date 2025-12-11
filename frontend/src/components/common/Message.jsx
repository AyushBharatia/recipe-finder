import React, { useEffect } from 'react';
import './Message.css';

const Message = ({ type, message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className={`message message-${type}`}>
      <span className="message-text">{message}</span>
      {onClose && (
        <button className="message-close" onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  );
};

export default Message;
