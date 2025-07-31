import React from 'react';

interface PatientManagementWidgetProps {
  onBackToModules?: () => void;
}

export const PatientManagementWidget: React.FC<PatientManagementWidgetProps> = ({ onBackToModules }) => {
  return (
    <div>
      <h3>Patient Management Widget</h3>
      <p>Patient Management Widget placeholder</p>
    </div>
  );
}; 