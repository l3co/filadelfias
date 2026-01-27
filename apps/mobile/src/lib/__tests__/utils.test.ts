import { cn, formatDate, getInitials, formatRelativeDate } from '../utils';

describe('utils', () => {
    describe('cn', () => {
        it('should merge class names', () => {
            expect(cn('foo', 'bar')).toBe('foo bar');
        });

        it('should handle conditional classes', () => {
            expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
        });

        it('should handle undefined values', () => {
            expect(cn('foo', undefined, 'bar')).toBe('foo bar');
        });
    });

    describe('formatDate', () => {
        it('should format date string to pt-BR format', () => {
            const result = formatDate('2024-01-15T12:00:00');
            expect(result).toMatch(/15\/0?1\/2024/);
        });

        it('should format Date object to pt-BR format', () => {
            const date = new Date(2024, 0, 15, 12, 0, 0);
            const result = formatDate(date);
            expect(result).toMatch(/15\/0?1\/2024/);
        });
    });

    describe('getInitials', () => {
        it('should return first two initials', () => {
            expect(getInitials('João Silva')).toBe('JS');
        });

        it('should handle single name', () => {
            expect(getInitials('João')).toBe('J');
        });

        it('should handle multiple names', () => {
            expect(getInitials('João Pedro Silva Santos')).toBe('JP');
        });

        it('should return uppercase', () => {
            expect(getInitials('maria santos')).toBe('MS');
        });
    });

    describe('formatRelativeDate', () => {
        it('should return "Agora há pouco" for recent dates', () => {
            const now = new Date();
            const result = formatRelativeDate(now.toISOString());
            expect(result).toBe('Agora há pouco');
        });

        it('should return hours for same day', () => {
            const date = new Date();
            date.setHours(date.getHours() - 3);
            const result = formatRelativeDate(date.toISOString());
            expect(result).toBe('Há 3h');
        });

        it('should return "Ontem" for yesterday', () => {
            const date = new Date();
            date.setDate(date.getDate() - 1);
            date.setHours(date.getHours() - 1);
            const result = formatRelativeDate(date.toISOString());
            expect(result).toBe('Ontem');
        });

        it('should return days for older dates', () => {
            const date = new Date();
            date.setDate(date.getDate() - 5);
            const result = formatRelativeDate(date.toISOString());
            expect(result).toBe('Há 5 dias');
        });
    });
});
