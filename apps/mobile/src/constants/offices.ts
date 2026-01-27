/**
 * Configurações visuais para ofícios eclesiásticos.
 * 
 * IMPORTANTE: Os labels e valores dos ofícios vêm da API via useMetadata().
 * Este arquivo contém APENAS configurações de UI (cores, gradientes).
 * 
 * Uso:
 * ```tsx
 * import { useOfficeOptions } from '@/hooks/useMetadata';
 * import { OFFICE_THEME } from '@/constants/offices';
 * 
 * const offices = useOfficeOptions(); // dados da API
 * const theme = OFFICE_THEME['PASTOR']; // cores locais
 * ```
 */

export interface OfficeTheme {
    bg: string;
    text: string;
    gradient: [string, string];
}

export const OFFICE_THEME: Record<string, OfficeTheme> = {
    PASTOR: {
        bg: '#f3e8ff',
        text: '#7c3aed',
        gradient: ['#8b5cf6', '#7c3aed'],
    },
    PRESBITERO: {
        bg: '#dbeafe',
        text: '#2563eb',
        gradient: ['#3b82f6', '#2563eb'],
    },
    DIACONO: {
        bg: '#fef3c7',
        text: '#d97706',
        gradient: ['#f59e0b', '#d97706'],
    },
    MEMBRO: {
        bg: '#d1fae5',
        text: '#059669',
        gradient: ['#10b981', '#059669'],
    },
};

export const DEFAULT_OFFICE_THEME: OfficeTheme = OFFICE_THEME.MEMBRO;

export function getOfficeTheme(office?: string | null): OfficeTheme {
    if (!office) return DEFAULT_OFFICE_THEME;
    return OFFICE_THEME[office.toUpperCase()] || DEFAULT_OFFICE_THEME;
}
