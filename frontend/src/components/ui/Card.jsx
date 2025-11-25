import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false,
  glassmorphism = false,
  ...props 
}) => {
  const baseClasses = `
    rounded-xl p-6 transition-all duration-300
    ${glassmorphism 
      ? 'bg-white/10 backdrop-blur-lg border border-white/20' 
      : 'bg-white shadow-md'
    }
    ${gradient ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : ''}
    ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''}
  `;

  return (
    <div
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
