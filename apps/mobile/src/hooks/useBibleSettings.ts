import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const SETTINGS_KEY = 'bible_settings';

export interface BibleSettings {
    version: string;
    fontSize: number;
    isDarkMode: boolean;
}

const defaultSettings: BibleSettings = {
    version: 'nvi',
    fontSize: 18,
    isDarkMode: false,
};

export function useBibleSettings() {
    const [settings, setSettingsState] = useState<BibleSettings>(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        SecureStore.getItemAsync(SETTINGS_KEY).then((saved) => {
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setSettingsState({ ...defaultSettings, ...parsed });
                } catch {
                    setSettingsState(defaultSettings);
                }
            }
            setIsLoaded(true);
        });
    }, []);

    const updateSettings = (partial: Partial<BibleSettings>) => {
        const newSettings = { ...settings, ...partial };
        setSettingsState(newSettings);
        SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(newSettings));
    };

    const setVersion = (version: string) => updateSettings({ version });
    const setFontSize = (fontSize: number) => updateSettings({ fontSize });
    const toggleDarkMode = () => updateSettings({ isDarkMode: !settings.isDarkMode });
    const increaseFontSize = () => updateSettings({ fontSize: Math.min(settings.fontSize + 2, 32) });
    const decreaseFontSize = () => updateSettings({ fontSize: Math.max(settings.fontSize - 2, 14) });

    return {
        settings,
        isLoaded,
        setVersion,
        setFontSize,
        toggleDarkMode,
        increaseFontSize,
        decreaseFontSize,
    };
}
