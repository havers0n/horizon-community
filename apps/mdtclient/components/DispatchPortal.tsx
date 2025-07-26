
import React, { useState, useEffect } from 'react';
import type { MDTCall911, MDTUnit, Bolo } from '../types';
import { MOCK_CALLS, MOCK_UNITS, MOCK_BOLOS } from '../constants';
import { Card, CardHeader, Button } from './ui/Theme';
import { MapPin, Phone, Radio, Siren, ClipboardPlus, MessageSquare } from 'lucide-react';
import { UnitStatus } from '../types';

const getStatusColor = (status: UnitStatus) => {
    switch (status) {
        case UnitStatus.AVAILABLE: return 'bg-green-500';
        case UnitStatus.BUSY: return 'bg-yellow-500';
        case UnitStatus.EN_ROUTE:
        case UnitStatus.ON_SCENE:
            return 'bg-blue-500';
        case UnitStatus.UNAVAILABLE: return 'bg-gray-500';
        case UnitStatus.PANIC: return 'bg-red-500 animate-pulse';
        default: return 'bg-gray-500';
    }
}

const CallQueue: React.FC<{calls: MDTCall911[]}> = ({ calls }) => (
    <Card className="flex flex-col h-full">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Phone /><span>911 Call Queue</span>
            </div>
        </CardHeader>
        <div className="space-y-3 overflow-y-auto flex-grow pr-2">
            {calls.map(call => (
                <div key={call.id} className="p-3 bg-secondary-900 rounded-lg border-l-4 border-primary-500">
                    <p className="font-bold text-secondary-200">{call.location}</p>
                    <p className="text-sm text-secondary-300">{call.description}</p>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-secondary-500">{new Date(call.timestamp).toLocaleTimeString()}</p>
                        <div className="flex gap-2">
                            <Button size="sm" variant="secondary">Assign</Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

const UnitManagement: React.FC<{units: MDTUnit[]}> = ({ units }) => (
     <Card className="flex flex-col h-full">
        <CardHeader>
            <div className="flex items-center gap-2">
                <Radio /><span>Unit Management</span>
            </div>
        </CardHeader>
        <div className="space-y-2 overflow-y-auto flex-grow pr-2">
            {units.map(unit => (
                <div key={unit.id} className="p-3 bg-secondary-900 rounded-md flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <span className={`w-3 h-3 rounded-full ${getStatusColor(unit.status)}`}></span>
                       <div>
                            <p className="font-bold">{unit.name} <span className="text-xs text-secondary-400">({unit.department})</span></p>
                            <p className={`text-xs ${unit.status === UnitStatus.PANIC ? 'text-red-400 font-bold' : 'text-secondary-400'}`}>{unit.status}</p>
                       </div>
                    </div>
                    <Button size="sm" variant="secondary"><MessageSquare size={16}/></Button>
                </div>
            ))}
        </div>
    </Card>
);


export const DispatchPortal: React.FC = () => {
    const [calls, setCalls] = useState<MDTCall911[]>(MOCK_CALLS);
    const [units, setUnits] = useState<MDTUnit[]>(MOCK_UNITS);

    useEffect(() => {
      // Simulate new call coming in
      const interval = setInterval(() => {
        setCalls(prev => {
          if (prev.length > 5) return [...prev];
          const newCall: MDTCall911 = {
            id: `call_${Date.now()}`,
            caller: 'New Caller',
            location: 'Random Street',
            description: 'A new emergency just happened.',
            timestamp: new Date().toISOString(),
            assignedUnits: []
          };
          return [newCall, ...prev];
        });
      }, 15000);
      return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-[calc(100vh-8rem)] grid grid-cols-12 grid-rows-6 gap-6">
            <div className="col-span-12 row-span-1 flex gap-4">
                 <Button className="flex-1"><Siren className="mr-2"/> Create Incident</Button>
                 <Button className="flex-1"><ClipboardPlus className="mr-2"/> Create BOLO</Button>
                 <Button variant="danger" className="flex-1"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>Signal 100</Button>
            </div>
            <div className="col-span-8 row-span-5">
                <Card className="h-full">
                    <CardHeader>Command Map</CardHeader>
                     <div className="w-full h-[calc(100%-4rem)] bg-secondary-900 rounded-md flex items-center justify-center">
                        <div className="text-center text-secondary-500">
                            <MapPin size={64}/>
                            <p className="mt-4 text-lg">Dispatch Map Placeholder</p>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="col-span-4 row-span-5 flex flex-col gap-6">
                <div className="flex-1 min-h-0">
                    <CallQueue calls={calls} />
                </div>
                 <div className="flex-1 min-h-0">
                    <UnitManagement units={units} />
                </div>
            </div>
        </div>
    );
};
