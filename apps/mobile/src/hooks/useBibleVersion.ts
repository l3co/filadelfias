import { useState, useEffect } from 'react';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();
const VERSION_KEY = 'bible_version';

export function useBibleVersion() {
    const [version, setVersionState] = useState<string>('nvi');

    useEffect(() => {
        const saved = storage.getString(VERSION_KEY);
        if (saved) {
            setVersionState(saved);
        }
    }, []);

    const setVersion = (v: string) => {
        storage.set(VERSION_KEY, v);
        setVersionState(v);
    };

    return { version, setVersion };
}
