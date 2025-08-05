import type { Units } from '@roleplay-identity/db-types';
import React, { useState } from 'react';

interface DispatchStatusManagerProps {
  currentStatus: Units['status'];
  onStatusChange: (status: Units['status']) => void;
}

export const DispatchStatusManager: React.FC<DispatchStatusManagerProps> = ({
  currentStatus,
  onStatusChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions: { value: Units['status']; label: string; color: string }[] = [
    { value: 'available', label: 'Available', color: 'bg-green-500' },
    { value: 'busy', label: 'Busy', color: 'bg-yellow-500' },
    { value: 'en_route', label: 'En Route', color: 'bg-blue-500' },
    { value: 'on_scene', label: 'On Scene', color: 'bg-purple-500' },
    { value: 'unavailable', label: 'Unavailable', color: 'bg-red-500' },
    { value: 'panic', label: 'Panic', color: 'bg-red-600' },
  ];

  const currentStatusOption = statusOptions.find((option) => option.value === currentStatus);

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">Status Manager</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      <div className="mt-3 flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${currentStatusOption?.color}`} />
        <span className="text-white font-medium">{currentStatusOption?.label}</span>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onStatusChange(option.value)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-left transition-colors ${
                currentStatus === option.value
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${option.color}`} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-slate-400">
        <p>Current status: {currentStatusOption?.label}</p>
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}; 