import React from 'react';

interface EmergencyCallWidgetProps {
  onBackToModules?: () => void;
}

export const EmergencyCallWidget: React.FC<EmergencyCallWidgetProps> = ({ onBackToModules }) => {
  return (
    <div>
      <h3>Emergency Call Widget</h3>
      <p>Emergency Call Widget placeholder</p>
    </div>
  );
}; 