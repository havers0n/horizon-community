import React from 'react';

export interface MDTModule {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export interface Department {
  id: string;
  name: string;
  modules: MDTModule[];
} 