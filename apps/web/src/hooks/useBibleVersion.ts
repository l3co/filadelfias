import { useState, useEffect } from 'react';

const STORAGE_KEY = 'bible_version';
const DEFAULT_VERSION = 'nvi';

export function useBibleVersion() {
    const [version, setVersion] = useState<string>(() => {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT_VERSION;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, version);
        // Disparar evento para sincronizar abas/componentes se necessário
        // window.dispatchEvent(new Event('storage'));
    }, [version]);

    return { version, setVersion };
}
