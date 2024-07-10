/** @jsxImportSource @emotion/react */
import { Global, css } from '@emotion/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

const globalStyles = css`
  * {
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size: 14px;
    line-height: 1.5;
    color: #24292e;
    background-color: #fff;
    margin: 0;
    padding: 0;
  }

  .app {
    margin: 1rem;
  }

  a {
    color: #08c;
  }

  code {
    background: #eee;
    padding: .1rem;
    font-family: 'Menlo';
    font-size: 13px;
    color: #ff00aa;
  }

  .text-input {
    padding: .5rem;
    font-size: 16px;
    width: 100%;
    display: block;
    border-radius: 4px;
    border: 1px solid #ccc;

    &:focus {
      border-color: #007eff;
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 0 3px rgba(0, 126, 255, 0.1);
      outline: none;
    }
  }

  .error .text-input {
    border-color: red;
  }

  .label {
    font-weight: bold;
    display: block;
    margin-bottom: .5rem;
  }

  .error .label {
    color: red;
  }

  .input-feedback {
    color: #999;
    margin-top: .25rem;

    &.error {
      color: red;
    }
  }

  .animated {
    animation-duration: .3s;
    animation-fill-mode: both;
  }

  .input-group {
    margin-bottom: 1rem;
  }

  button {
    max-width: 150px;
    margin: 20px 0;
    padding: 12px 20px;
    border-style: none;
    border-radius: 5px;
    background-color: #08c;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.15);
    font-size: 17px;
    font-weight: 500;
    color: #fff;
    cursor: pointer;
    outline: none;
    -webkit-appearance: none;

    &:disabled {
      opacity: .5;
      cursor: not-allowed !important;
    }

    & + button {
      margin-left: .5rem;
    }

    &.outline {
      background-color: #eee;
      border: 1px solid #aaa;
      color: #555;
    }
  }

  .animated {
    animation-duration: 1s;
    animation-fill-mode: both;
  }

  @keyframes shake {
    from, to {
      transform: translate3d(0, 0, 0);
    }

    10%, 30%, 50%, 70%, 90% {
      transform: translate3d(-10px, 0, 0);
    }

    20%, 40%, 60%, 80% {
      transform: translate3d(10px, 0, 0);
    }
  }

  .shake {
    animation-name: shake;
  }

  .side-menu {
    position: fixed;
    top: 0;
    left: -250px;
    width: 250px;
    height: 100%;
    background: #111;
    color: white;
    transition: left 0.3s ease;
    padding: 1rem;
    box-shadow: 2px 0 5px rgba(0,0,0,0.5);
    z-index: 2000; /* Asegúrate de que el z-index sea alto */
  }

  .side-menu.open {
    left: 0;
  }

  .side-menu .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    margin-bottom: 1rem;
  }

  .side-menu nav button {
    display: block;
    width: 100%;
    padding: 1rem;
    background: none;
    border: none;
    color: white;
    text-align: left;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 0.5rem;

    &:hover {
      background: #575757;
    }
  }
`;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Global styles={globalStyles} />
    <App />
  </React.StrictMode>
);

reportWebVitals();
