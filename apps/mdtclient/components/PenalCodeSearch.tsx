
import React, { useState, useMemo } from 'react';
import { MOCK_PENAL_CODES } from '../constants';
import type { PenalCode } from '../types';
import { Card, CardHeader } from './ui/Theme';
import { Search, Gavel } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';

export const PenalCodeSearch: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { t, formatNumber } = useLocale();

    const filteredCodes = useMemo(() => {
        if (!searchTerm) {
            return MOCK_PENAL_CODES;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return MOCK_PENAL_CODES.filter(code =>
            code.title.toLowerCase().includes(lowercasedTerm) ||
            code.description.toLowerCase().includes(lowercasedTerm)
        );
    }, [searchTerm]);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>{t('penalCodes.title')}</CardHeader>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
                    <input
                        type="text"
                        placeholder={t('penalCodes.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary-700 border border-secondary-600 rounded-md pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </Card>

            <div className="space-y-3">
                {filteredCodes.length > 0 ? (
                    filteredCodes.map(code => (
                        <Card key={code.id}>
                            <h4 className="font-bold text-primary-400 text-lg flex items-center gap-2">
                                <Gavel size={18} />
                                {code.title}
                            </h4>
                            <p className="text-secondary-300 mt-2">{code.description}</p>
                            <div className="flex gap-4 mt-3 pt-3 border-t border-secondary-700/50 text-sm">
                                <p><span className="font-semibold text-secondary-400">{t('penalCodes.fine')}:</span> ${formatNumber(code.fine)}</p>
                                <p><span className="font-semibold text-secondary-400">{t('penalCodes.jailTime')}:</span> {code.jailTime} {t('time.minutes')}</p>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <p className="text-center text-secondary-400">{t('common.noResults')}</p>
                    </Card>
                )}
            </div>
        </div>
    );
};
