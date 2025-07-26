
import React, { useState } from 'react';
import { Card, CardHeader, Button } from './ui/Theme';
import { BarChart, Cog, Users, ShieldCheck, FileText, Trash2, Edit } from 'lucide-react';
import { MOCK_PENAL_CODES } from '../constants';
import type { PenalCode } from '../types';


const StatCard: React.FC<{ title: string, value: string, icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <Card className="flex items-center gap-4">
        <div className="p-3 bg-primary-600/20 rounded-lg">
            <Icon className="h-8 w-8 text-primary-400" />
        </div>
        <div>
            <p className="text-sm text-secondary-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </Card>
);

const ValueManager: React.FC = () => {
    // Mock data for penal codes is now imported
    const [penalCodes, setPenalCodes] = useState<PenalCode[]>(MOCK_PENAL_CODES);

    return (
        <Card>
            <CardHeader>Value Manager (Penal Codes)</CardHeader>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-secondary-300">
                    <thead className="text-xs text-secondary-400 uppercase bg-secondary-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Fine</th>
                            <th scope="col" className="px-6 py-3">Jail Time (min)</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {penalCodes.map(code => (
                            <tr key={code.id} className="bg-secondary-800 border-b border-secondary-700 hover:bg-secondary-700/50">
                                <td className="px-6 py-4 font-medium text-white">{code.title}</td>
                                <td className="px-6 py-4">${code.fine}</td>
                                <td className="px-6 py-4">{code.jailTime}</td>
                                <td className="px-6 py-4 flex gap-2">
                                    <Button variant="secondary" size="sm"><Edit size={16} /></Button>
                                    <Button variant="danger" size="sm"><Trash2 size={16} /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Button className="mt-4">Add New Penal Code</Button>
        </Card>
    );
}

export const AdminPortal: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value="1,245" icon={Users} />
                <StatCard title="Active Units" value="34" icon={ShieldCheck} />
                <StatCard title="Reports Filed Today" value="89" icon={FileText} />
                <StatCard title="CAD Version" value="4.1.0" icon={Cog} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>CAD Settings</CardHeader>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label htmlFor="bleeter-toggle" className="font-medium text-secondary-200">Enable Bleeter</label>
                            <input type="checkbox" id="bleeter-toggle" className="toggle-checkbox" defaultChecked />
                        </div>
                        <div className="flex justify-between items-center">
                           <label htmlFor="tow-toggle" className="font-medium text-secondary-200">Enable Tow/Taxi Calls</label>
                           <input type="checkbox" id="tow-toggle" className="toggle-checkbox" defaultChecked />
                        </div>
                         <div className="flex justify-between items-center">
                           <label htmlFor="panic-toggle" className="font-medium text-secondary-200">Enable Panic Button</label>
                           <input type="checkbox" id="panic-toggle" className="toggle-checkbox" defaultChecked />
                        </div>
                        <Button>Save Settings</Button>
                    </div>
                </Card>
                <Card>
                    <CardHeader>Recent Activity</CardHeader>
                    <p className="text-secondary-400">Activity log placeholder...</p>
                </Card>
            </div>
            <ValueManager />
        </div>
    );
};

// Basic toggle switch style for demo purposes
const style = document.createElement('style');
style.innerHTML = `
.toggle-checkbox {
  appearance: none;
  width: 3.5rem;
  height: 1.75rem;
  background-color: #475569; /* secondary-600 */
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}
.toggle-checkbox::before {
  content: '';
  width: 1.25rem;
  height: 1.25rem;
  background-color: white;
  border-radius: 9999px;
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  transition: transform 0.2s ease-in-out;
}
.toggle-checkbox:checked {
  background-color: #2563eb; /* primary-600 */
}
.toggle-checkbox:checked::before {
  transform: translateX(1.75rem);
}
`;
document.head.appendChild(style);
