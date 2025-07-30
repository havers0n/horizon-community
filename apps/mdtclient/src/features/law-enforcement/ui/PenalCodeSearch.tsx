import React, { useState } from 'react';
import { Card, CardHeader, Button } from '../../../shared/ui/atoms';
import { Search, Filter } from 'lucide-react';
import { useLocale } from '@/shared/contexts/LocaleContext';

export const PenalCodeSearch: React.FC = () => {
    const { t } = useLocale();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const handleSearch = () => {
        console.log('Searching for:', searchTerm, 'in category:', selectedCategory);
        // Здесь будет логика поиска
    };

    const handleFilter = (category: string) => {
        setSelectedCategory(category);
    };

    return (
        <Card>
            <CardHeader>{t('penalCodes.search')}</CardHeader>
            <div className="p-6 space-y-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder={t('penalCodes.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 p-2 bg-secondary-800 border border-secondary-600 rounded-md text-white"
                    />
                    <Button onClick={handleSearch}>
                        <Search size={16} className="mr-2" />
                        {t('common.search')}
                    </Button>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={selectedCategory === '' ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => handleFilter('')}
                    >
                        {t('common.all')}
                    </Button>
                    <Button
                        variant={selectedCategory === 'felony' ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => handleFilter('felony')}
                    >
                        {t('penalCodes.categories.felony')}
                    </Button>
                    <Button
                        variant={selectedCategory === 'misdemeanor' ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => handleFilter('misdemeanor')}
                    >
                        {t('penalCodes.categories.misdemeanor')}
                    </Button>
                    <Button
                        variant={selectedCategory === 'infraction' ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => handleFilter('infraction')}
                    >
                        {t('penalCodes.categories.infraction')}
                    </Button>
                </div>
            </div>
        </Card>
    );
};
