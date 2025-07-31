import React from 'react';

interface EmsCallManagementWidgetProps {
  onBackToModules?: () => void;
}

export const EmsCallManagementWidget: React.FC<EmsCallManagementWidgetProps> = ({ onBackToModules }) => {
  return (
    <div>
      <h3>EMS Call Management Widget</h3>
      <p>EMS Call Management Widget placeholder</p>
    </div>
  );
}; 