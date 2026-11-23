import React from 'react';

export default function Header({ title, subtitle }) {
  return (
    <header className="header">
      <div className="badge">React + JavaScript</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}
