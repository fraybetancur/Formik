import React from 'react';

const Rating = ({ value, onChange, max = 5 }) => {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div>
      {stars.map(star => (
        <span key={star} onClick={() => onChange(star)}>
          {star <= value ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

export default Rating;
