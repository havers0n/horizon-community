// @ts-nocheck - TODO: Remove after major refactoring is complete
import React, { useState } from 'react';
import { Call911 } from '@/shared/types';

interface Call911HandlerProps {
  call: Call911;
  onUpdate: (callId: string, updates: Partial<Call911>) => void;
  onAssign: (callId: string, unitId: string) => void;
}

export const Call911Handler: React.FC<Call911HandlerProps> = ({
  call,
  onUpdate,
  onAssign
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    onUpdate(call.id, { status: newStatus as any });
  };

  const handlePriorityChange = (newPriority: string) => {
    onUpdate(call.id, { priority: newPriority as any });
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            call.priority === 'high' ? 'bg-red-500' :
            call.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
          }`} />
          <span className="font-semibold text-white">Call #{call.id}</span>
          <span className={`px-2 py-1 rounded text-xs ${
            call.status === 'active' ? 'bg-red-500' :
            call.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'
          } text-white`}>
            {call.status}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      <div className="mt-2">
        <p className="text-white font-medium">{call.description}</p>
        <p className="text-slate-400 text-sm mt-1">{call.location}</p>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          <div className="flex space-x-2">
            <select
              value={call.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-slate-700 text-white px-3 py-1 rounded text-sm"
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
            </select>
            
            <select
              value={call.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="bg-slate-700 text-white px-3 py-1 rounded text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="text-sm text-slate-400">
            <p>Caller: {call.callerName || 'Anonymous'}</p>
            <p>Phone: {call.callerPhone || 'N/A'}</p>
            {/* @ts-expect-error - TODO: Fix after major refactoring. Property 'createdAt' might be undefined */}
            <p>Time: {new Date(call.createdAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 