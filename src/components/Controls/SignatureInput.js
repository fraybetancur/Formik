import React, { useRef } from 'react';
import SignaturePad from 'react-signature-canvas';

const SignatureInput = ({ value, onChange }) => {
  const sigPad = useRef(null);

  const clear = () => {
    sigPad.current.clear();
    onChange('');
  };

  const save = () => {
    if (sigPad.current.isEmpty()) {
      alert('Please provide a signature first.');
    } else {
      const data = sigPad.current.toDataURL();
      onChange(data);
    }
  };

  return (
    <div>
      <SignaturePad ref={sigPad} canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }} />
      <button onClick={clear}>Clear</button>
      <button onClick={save}>Save</button>
    </div>
  );
};

export default SignatureInput;
