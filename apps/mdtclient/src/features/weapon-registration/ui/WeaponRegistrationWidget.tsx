import React from 'react';

interface WeaponRegistrationWidgetProps {
  onBackToModules?: () => void;
}

export const WeaponRegistrationWidget: React.FC<WeaponRegistrationWidgetProps> = ({ onBackToModules }) => {
  return (
    <div>
      <h3>Weapon Registration Widget</h3>
      <p>Weapon Registration Widget placeholder</p>
    </div>
  );
};
