import React from 'react';

interface UnitManagementWidgetProps {
  showActiveOnly?: boolean;
}

export const UnitManagementWidget: React.FC<UnitManagementWidgetProps> = ({ showActiveOnly = false }) => {
  return (
    <div>
      <h3>Unit Management Widget</h3>
      <p>Unit Management Widget placeholder</p>
    </div>
  );
}; 