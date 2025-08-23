import { useState } from 'react';
import { ArrowRightLeft, UserPlus } from 'lucide-react';
import { 
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../shared/ui';
import { RequestJointPositionForm } from './RequestJointPositionForm';
import { RequestTransferForm } from './RequestTransferForm';

type RequestType = 'joint-position' | 'transfer';

export const RequestCareerChangeButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<RequestType>('joint-position');

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-auto p-3 flex flex-col items-center justify-center space-y-1 text-xs w-full"
        >
          <div className="flex items-center space-x-1">
            <UserPlus className="w-3 h-3" />
            <ArrowRightLeft className="w-3 h-3" />
          </div>
          <span className="text-center">🔄 Карьера</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Запрос изменений в карьере</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as RequestType)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="joint-position" className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Совмещение</span>
            </TabsTrigger>
            <TabsTrigger value="transfer" className="flex items-center space-x-2">
              <ArrowRightLeft className="w-4 h-4" />
              <span>Перевод</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="joint-position" className="mt-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Подайте заявку на совмещение должности в дополнительном департаменте. 
                Это позволит вам работать в двух департаментах одновременно.
              </div>
              <RequestJointPositionForm onSuccess={handleSuccess} onCancel={handleClose} />
            </div>
          </TabsContent>
          
          <TabsContent value="transfer" className="mt-6">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Подайте заявку на полный перевод в другой департамент. 
                Вы будете переведены из текущего департамента в выбранный.
              </div>
              <RequestTransferForm onSuccess={handleSuccess} onCancel={handleClose} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};