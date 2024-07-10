/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

const footerStyle = css`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 1rem;
  background-color: #f5f5f5;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const linkStyle = css`
  margin: 0 1rem;
  text-decoration: none;
  color: #007bff;

  &:hover {
    text-decoration: underline;
  }
`;

const Footer = () => {
  return (
    <footer css={footerStyle}>
      <a css={linkStyle} href="#section1">Section 1</a>
      <a css={linkStyle} href="#section2">Section 2</a>
      <a css={linkStyle} href="#section3">Section 3</a>
    </footer>
  );
};

export default Footer;
