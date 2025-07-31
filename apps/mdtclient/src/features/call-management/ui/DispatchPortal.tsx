import React from 'react';

interface DispatchPortalProps {
  onBackToModules: () => void;
}

export const DispatchPortal: React.FC<DispatchPortalProps> = ({ onBackToModules }) => {
  return (
    <div>
      <h2>Dispatch Portal</h2>
      <p>Dispatch Portal placeholder</p>
    </div>
  );
}; 