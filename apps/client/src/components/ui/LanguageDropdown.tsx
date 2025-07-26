import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './dropdown-menu';
import { Languages, Check } from 'lucide-react';

interface Language {
    code: 'en' | 'ru';
    name: string;
    nativeName: string;
}

const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

const LanguageDropdown: React.FC = () => {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState<'en' | 'ru'>(i18n.language as 'en' | 'ru' || 'ru');

    console.log('LanguageDropdown render:', {
        i18nLanguage: i18n.language,
        stateLanguage: language,
        isInitialized: i18n.isInitialized
    });

    useEffect(() => {
        // Update local state when i18n language changes
        setLanguage(i18n.language as 'en' | 'ru');
    }, [i18n.language]);

    const handleLanguageChange = (langCode: 'en' | 'ru') => {
        console.log('Changing language to:', langCode);
        setLanguage(langCode);
        i18n.changeLanguage(langCode);
        // Сохраняем выбор в localStorage
        localStorage.setItem('i18nextLng', langCode);
    };

    const currentLanguage = languages.find(lang => lang.code === language);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Languages className="h-4 w-4" />
                    <span className="hidden sm:inline-block">
                        {currentLanguage?.nativeName || language.toUpperCase()}
                    </span>
                    <span className="sm:hidden">
                        {language.toUpperCase()}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="gap-2"
                    >
                        {language === lang.code && (
                            <Check className="h-4 w-4" />
                        )}
                        <span className={language !== lang.code ? 'ml-6' : ''}>
                            {lang.nativeName}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LanguageDropdown;
