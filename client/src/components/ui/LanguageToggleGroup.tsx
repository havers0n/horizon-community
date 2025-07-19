import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';

const LanguageToggleGroup: React.FC = () => {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState<'en' | 'ru'>(i18n.language as 'en' | 'ru' || 'ru');

    useEffect(() => {
        // Update local state when i18n language changes
        setLanguage(i18n.language as 'en' | 'ru');
    }, [i18n.language]);

    const handleLanguageChange = (value: string) => {
        if (value && (value === 'en' || value === 'ru')) {
            setLanguage(value);
            i18n.changeLanguage(value);
            // Сохраняем выбор в localStorage
            localStorage.setItem('i18nextLng', value);
        }
    };

    return (
        <ToggleGroup
            type="single"
            value={language}
            onValueChange={handleLanguageChange}
            className="border rounded-md"
        >
            <ToggleGroupItem value="en" aria-label="Switch to English">
                EN
            </ToggleGroupItem>
            <ToggleGroupItem value="ru" aria-label="Switch to Russian">
                RU
            </ToggleGroupItem>
        </ToggleGroup>
    );
};

export default LanguageToggleGroup;
