import { useState, useCallback } from 'react';

interface ViaCEPResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
}

interface AddressData {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
}

interface UseViaCEPReturn {
    fetchAddress: (cep: string) => Promise<AddressData | null>;
    isLoading: boolean;
    error: string | null;
}

export function useViaCEP(): UseViaCEPReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAddress = useCallback(async (cep: string): Promise<AddressData | null> => {
        const cleanCep = cep.replace(/\D/g, '');
        
        if (cleanCep.length !== 8) {
            setError('CEP deve ter 8 dígitos');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data: ViaCEPResponse = await response.json();

            if (data.erro) {
                setError('CEP não encontrado');
                return null;
            }

            return {
                street: data.logradouro,
                neighborhood: data.bairro,
                city: data.localidade,
                state: data.uf,
            };
        } catch {
            setError('Erro ao buscar CEP');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { fetchAddress, isLoading, error };
}
