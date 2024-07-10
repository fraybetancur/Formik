import React from 'react';
import './Header.css';

const Header = ({ onMenuToggle, onRightButtonClick, headerText }) => {
  return (
    <header className="header">
      <div className="left">
        <button className="menu-btn" onClick={onMenuToggle}>
          ☰
        </button>
      </div>
      <div className="center">
        <h1>{headerText}</h1>
      </div>
      <div className="right">
        <button className="right-btn" onClick={onRightButtonClick}>
          ⚙️
        </button>
      </div>
    </header>
  );
};

export default Header;
