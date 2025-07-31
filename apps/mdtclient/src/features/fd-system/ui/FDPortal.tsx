import React from 'react';

interface FDPortalProps {
  onBackToModules?: () => void;
}

export const FDPortal: React.FC<FDPortalProps> = ({ onBackToModules }) => {
  return (
    <div>
      <h2>FD Portal</h2>
      <p>Fire Department Portal placeholder</p>
    </div>
  );
}; 