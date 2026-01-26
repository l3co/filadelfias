import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const VERSION_KEY = 'bible_version';

export function useBibleVersion() {
    const [version, setVersionState] = useState<string>('nvi');

    useEffect(() => {
        SecureStore.getItemAsync(VERSION_KEY).then((saved) => {
            if (saved) {
                setVersionState(saved);
            }
        });
    }, []);

    const setVersion = (v: string) => {
        SecureStore.setItemAsync(VERSION_KEY, v);
        setVersionState(v);
    };

    return { version, setVersion };
}
