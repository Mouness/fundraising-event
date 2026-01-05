import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    return (
        <div className="relative flex items-center border rounded-md hover:bg-black/5 transition-colors">
            <Globe
                className="absolute left-2.5 h-4 w-4 opacity-70 pointer-events-none"
                style={{ color: 'var(--header-text)' }}
            />
            <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="h-9 w-[110px] appearance-none bg-transparent pl-9 pr-2 text-sm font-medium focus:outline-none cursor-pointer"
                style={{ color: 'var(--header-text)' }}
            >
                <option value="en">English</option>
                <option value="fr">Français</option>
            </select>
        </div>
    );
};
