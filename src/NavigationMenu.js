import React from 'react';
import './SideMenu.css';

const SideMenu = ({ isOpen, onClose, onNavigate }) => {
  return (
    <div className={`side-menu ${isOpen ? 'open' : ''}`}>
      <button className="close-btn" onClick={onClose}>×</button>
      <nav>
        <button onClick={() => onNavigate('page1')}>Página 1</button>
        <button onClick={() => onNavigate('page2')}>Página 2</button>
      </nav>
    </div>
  );
};

export default SideMenu;
