import React, { ReactNode } from 'react';

interface MDTLayoutProps {
  children: ReactNode;
}

export const MDTLayout: React.FC<MDTLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {children}
    </div>
  );
}; 
