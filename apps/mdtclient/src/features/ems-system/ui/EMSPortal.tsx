import React from 'react';

interface EMSPortalProps {
  onBackToModules?: () => void;
}

export const EMSPortal: React.FC<EMSPortalProps> = ({ onBackToModules }) => {
  return (
    <div>
      <h2>EMS Portal</h2>
      <p>EMS Portal placeholder</p>
    </div>
  );
}; 