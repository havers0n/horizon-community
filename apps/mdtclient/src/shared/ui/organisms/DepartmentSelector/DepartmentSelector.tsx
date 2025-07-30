import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Shield, Phone, Stethoscope, Flame, User, Building } from 'lucide-react';

export interface Department {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const departments: Department[] = [
  { id: 'pd', name: 'Police Department', shortName: 'PD', icon: Shield, color: 'text-blue-400' },
  { id: 'fd', name: 'Fire Department', shortName: 'FD', icon: Flame, color: 'text-red-400' },
  { id: 'md', name: 'Medical Department', shortName: 'MD', icon: Stethoscope, color: 'text-green-400' },
  { id: 'cc', name: 'Civilian Center', shortName: 'CC', icon: User, color: 'text-yellow-400' },
  { id: 'cd', name: 'Civil Department', shortName: 'CD', icon: Building, color: 'text-purple-400' },
  { id: 'dispatch', name: 'Dispatch', shortName: 'Dispatch', icon: Phone, color: 'text-orange-400' }
];

interface DepartmentSelectorProps {
  selectedDepartment: string;
  onDepartmentChange: (departmentId: string) => void;
}

export const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({
  selectedDepartment,
  onDepartmentChange
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [buttonRect, setButtonRect] = React.useState<DOMRect | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const selectedDept = departments.find(dept => dept.id === selectedDepartment) || departments[0];

  const handleButtonClick = () => {
    if (buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
    setIsOpen(!isOpen);
  };

  const handleDepartmentSelect = (departmentId: string) => {
    onDepartmentChange(departmentId);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-lg text-slate-100 transition-colors duration-200"
        >
          <selectedDept.icon className={`h-5 w-5 ${selectedDept.color}`} />
          <span className="font-medium">{selectedDept.shortName}</span>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && buttonRect && createPortal(
        <>
          <div 
            className="fixed w-64 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-xl"
            style={{ 
              zIndex: 999999,
              top: buttonRect.bottom + 8,
              left: buttonRect.left
            }}
          >
            <div className="p-2">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => handleDepartmentSelect(dept.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                    selectedDepartment === dept.id
                      ? 'bg-slate-600/50 text-slate-100'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                  }`}
                >
                  <dept.icon className={`h-5 w-5 ${dept.color}`} />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{dept.shortName}</span>
                    <span className="text-xs text-slate-400">{dept.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Backdrop для закрытия при клике вне */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 999998 }}
            onClick={() => setIsOpen(false)}
          />
        </>,
        document.body
      )}
    </>
  );
};

export { departments }; 
