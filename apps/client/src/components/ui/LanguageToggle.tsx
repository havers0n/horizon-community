import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Languages } from 'lucide-react';

const LanguageToggle: React.FC = () => {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState<'en' | 'ru'>(i18n.language as 'en' | 'ru' || 'ru');

    useEffect(() => {
        // Update local state when i18n language changes
        setLanguage(i18n.language as 'en' | 'ru');
    }, [i18n.language]);

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ru' : 'en';
        setLanguage(newLang);
        i18n.changeLanguage(newLang);
        // Сохраняем выбор в localStorage
        localStorage.setItem('i18nextLng', newLang);
    };

    return (
        <Button
            onClick={toggleLanguage}
            variant="outline"
            size="sm"
            className="gap-2"
        >
            <Languages className="h-4 w-4" />
            {language === 'en' ? 'EN' : 'RU'}
        </Button>
    );
};

export default LanguageToggle;
