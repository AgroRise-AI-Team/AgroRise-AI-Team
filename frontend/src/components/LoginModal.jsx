import React from 'react';
import LoginForm from './LoginForm';

export default function LoginModal({ onClose, onOpenRegister }) {
  return (
    <div className="lm-overlay" onClick={onClose}>
      <div className="lm-card" onClick={(e) => e.stopPropagation()}>
        <button className="lm-close" onClick={onClose} aria-label="Close">&times;</button>
        <LoginForm
          onOpenRegister={() => { onClose(); onOpenRegister && onOpenRegister(); }}
        />
      </div>
    </div>
  );
}
