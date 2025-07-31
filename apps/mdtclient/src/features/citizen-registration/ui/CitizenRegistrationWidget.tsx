import React from 'react';

interface CitizenRegistrationWidgetProps {
  onBackToModules?: () => void;
}

export const CitizenRegistrationWidget: React.FC<CitizenRegistrationWidgetProps> = ({ onBackToModules }) => {
  return (
    <div>
      <h3>Citizen Registration Widget</h3>
      <p>Citizen Registration Widget placeholder</p>
    </div>
  );
};
