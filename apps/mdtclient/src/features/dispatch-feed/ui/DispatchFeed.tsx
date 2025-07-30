import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/atoms/Tabs';
import { ActiveCallsList } from './ActiveCallsList';
import { UnitStatusList } from './UnitStatusList';
import { ActiveBolosList } from './ActiveBolosList';

export const DispatchFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState('calls');

  return (
    <div className="h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="calls" className="text-xs">
            Вызовы 911
          </TabsTrigger>
          <TabsTrigger value="units" className="text-xs">
            Юниты
          </TabsTrigger>
          <TabsTrigger value="bolos" className="text-xs">
            BOLO
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="calls" className="h-full m-0">
            <ActiveCallsList />
          </TabsContent>
          
          <TabsContent value="units" className="h-full m-0">
            <UnitStatusList />
          </TabsContent>
          
          <TabsContent value="bolos" className="h-full m-0">
            <ActiveBolosList />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
