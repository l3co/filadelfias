/**
 * Constantes de tema centralizadas para o app mobile
 * Inclui cores de features, categorias e estilos comuns
 */

export const FEATURE_COLORS = {
    blue: { bg: '#eff6ff', icon: '#3b82f6', gradient: ['#3b82f6', '#2563eb'] as const },
    purple: { bg: '#f5f3ff', icon: '#8b5cf6', gradient: ['#8b5cf6', '#7c3aed'] as const },
    red: { bg: '#fef2f2', icon: '#ef4444', gradient: ['#ef4444', '#dc2626'] as const },
    emerald: { bg: '#ecfdf5', icon: '#10b981', gradient: ['#10b981', '#059669'] as const },
    orange: { bg: '#fff7ed', icon: '#f97316', gradient: ['#f97316', '#ea580c'] as const },
    indigo: { bg: '#eef2ff', icon: '#6366f1', gradient: ['#6366f1', '#4f46e5'] as const },
    yellow: { bg: '#fefce8', icon: '#eab308', gradient: ['#eab308', '#ca8a04'] as const },
    pink: { bg: '#fdf2f8', icon: '#ec4899', gradient: ['#ec4899', '#db2777'] as const },
} as const;

export type FeatureColor = keyof typeof FEATURE_COLORS;

export const CATEGORY_COLORS = {
    health: { bg: '#fef2f2', text: '#b91c1c', label: 'Saúde' },
    family: { bg: '#eff6ff', text: '#1d4ed8', label: 'Família' },
    work: { bg: '#fffbeb', text: '#b45309', label: 'Trabalho' },
    spiritual: { bg: '#f5f3ff', text: '#7c3aed', label: 'Espiritual' },
    other: { bg: '#f3f4f6', text: '#374151', label: 'Outros' },
} as const;

export type CategoryKey = keyof typeof CATEGORY_COLORS;

export const STATUS_COLORS = {
    pending: { bg: '#fffbeb', text: '#b45309', label: 'Pendente' },
    approved: { bg: '#ecfdf5', text: '#059669', label: 'Aprovado' },
    rejected: { bg: '#fef2f2', text: '#dc2626', label: 'Rejeitado' },
} as const;

export const COMMON_STYLES = {
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    screenBackground: '#f8fafc',
    headerGradient: ['#059669', '#10b981'] as const,
} as const;
