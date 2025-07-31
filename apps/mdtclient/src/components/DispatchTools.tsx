import React from 'react';
import { Phone, MapPin, Radio, AlertTriangle, Settings, Users } from 'lucide-react';

interface DispatchToolsProps {
  onEmergencyCall: () => void;
  onRadioChannel: (channel: string) => void;
  onMapView: () => void;
  onSettings: () => void;
  onUnitManagement: () => void;
}

export const DispatchTools: React.FC<DispatchToolsProps> = ({
  onEmergencyCall,
  onRadioChannel,
  onMapView,
  onSettings,
  onUnitManagement
}) => {
  const radioChannels = ['Channel 1', 'Channel 2', 'Channel 3', 'Emergency'];

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-white font-semibold mb-4">Dispatch Tools</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onEmergencyCall}
          className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Emergency</span>
        </button>
        
        <button
          onClick={onMapView}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          <span>Map View</span>
        </button>
        
        <button
          onClick={onUnitManagement}
          className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          <Users className="w-4 h-4" />
          <span>Units</span>
        </button>
        
        <button
          onClick={onSettings}
          className="flex items-center space-x-2 px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
      
      <div className="mt-4">
        <h4 className="text-white font-medium mb-2">Radio Channels</h4>
        <div className="flex space-x-2">
          {radioChannels.map((channel) => (
            <button
              key={channel}
              onClick={() => onRadioChannel(channel)}
              className="flex items-center space-x-1 px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm hover:bg-slate-600 transition-colors"
            >
              <Radio className="w-3 h-3" />
              <span>{channel}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-slate-400">
        <p>Quick access to essential dispatch tools and radio channels.</p>
      </div>
    </div>
  );
}; 