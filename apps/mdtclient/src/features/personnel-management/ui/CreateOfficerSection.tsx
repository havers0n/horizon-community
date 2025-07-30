import React, { useState } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { Plus } from 'lucide-react';
import CreateOfficerForm from './CreateOfficerForm';

const CreateOfficerSection: React.FC = () => {
    const [showForm, setShowForm] = useState(false);

    const handleCreateOfficer = (officerData: any) => {
        console.log('Creating officer:', officerData);
        // Здесь будет логика создания офицера
        setShowForm(false);
    };

    const handleCloseForm = () => {
        setShowForm(false);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Создать офицера</h3>
                    <Button
                        onClick={() => setShowForm(true)}
                        size="sm"
                    >
                        <Plus size={16} className="mr-2" />
                        Новый офицер
                    </Button>
                </CardHeader>
                <div className="p-6">
                    <p className="text-secondary-400">
                        Создайте нового офицера для системы MDT. Заполните все необходимые поля для регистрации.
                    </p>
                </div>
            </Card>

            {showForm && (
                <CreateOfficerForm
                    onSubmit={handleCreateOfficer}
                    onClose={handleCloseForm}
                />
            )}
        </>
    );
};

export default CreateOfficerSection;
