import React from 'react';

interface AdminPanelProps {
  onBackToModules?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToModules }) => {
  return (
    <div>
      <h2>Admin Panel</h2>
      <p>Admin Panel placeholder</p>
    </div>
  );
}; 