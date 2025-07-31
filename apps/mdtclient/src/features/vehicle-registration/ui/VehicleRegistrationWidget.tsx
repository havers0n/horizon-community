import React from 'react';

interface VehicleRegistrationWidgetProps {
  onBackToModules?: () => void;
}

export const VehicleRegistrationWidget: React.FC<VehicleRegistrationWidgetProps> = ({ onBackToModules }) => {
  return (
    <div>
      <h3>Vehicle Registration Widget</h3>
      <p>Vehicle Registration Widget placeholder</p>
    </div>
  );
};
