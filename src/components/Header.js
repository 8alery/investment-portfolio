import React from 'react';
import { Link } from 'react-router-dom';

export default function() {
  return (
    <div className="Header">
      <Link to="/">Home</Link>
      <Link to="/bonds">Bonds</Link>
    </div>
  );
}
