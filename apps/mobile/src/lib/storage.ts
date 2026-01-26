import * as SecureStore from 'expo-secure-store';

export const storage = {
    getString: (key: string) => {
        // Sync não é possível com SecureStore, retorna null
        // Use getStringAsync para operações assíncronas
        return null;
    },
    set: (key: string, value: string) => {
        SecureStore.setItemAsync(key, value);
    },
    delete: (key: string) => {
        SecureStore.deleteItemAsync(key);
    },
    getStringAsync: (key: string) => SecureStore.getItemAsync(key),
};

export const mmkvStorage = {
    getItem: (key: string) => null,
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
