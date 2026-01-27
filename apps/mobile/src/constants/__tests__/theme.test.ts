import { FEATURE_COLORS, CATEGORY_COLORS, STATUS_COLORS, COMMON_STYLES } from '../theme';

describe('theme constants', () => {
    describe('FEATURE_COLORS', () => {
        it('should have all required color keys', () => {
            const expectedKeys = ['blue', 'purple', 'red', 'emerald', 'orange', 'indigo', 'yellow', 'pink'];
            expect(Object.keys(FEATURE_COLORS)).toEqual(expect.arrayContaining(expectedKeys));
        });

        it('should have bg, icon, and gradient for each color', () => {
            Object.values(FEATURE_COLORS).forEach((color) => {
                expect(color).toHaveProperty('bg');
                expect(color).toHaveProperty('icon');
                expect(color).toHaveProperty('gradient');
                expect(color.gradient).toHaveLength(2);
            });
        });

        it('should have valid hex colors', () => {
            const hexRegex = /^#[0-9A-Fa-f]{6}$/;
            Object.values(FEATURE_COLORS).forEach((color) => {
                expect(color.bg).toMatch(hexRegex);
                expect(color.icon).toMatch(hexRegex);
                color.gradient.forEach((g) => expect(g).toMatch(hexRegex));
            });
        });
    });

    describe('CATEGORY_COLORS', () => {
        it('should have all required category keys', () => {
            const expectedKeys = ['health', 'family', 'work', 'spiritual', 'other'];
            expect(Object.keys(CATEGORY_COLORS)).toEqual(expect.arrayContaining(expectedKeys));
        });

        it('should have bg, text, and label for each category', () => {
            Object.values(CATEGORY_COLORS).forEach((category) => {
                expect(category).toHaveProperty('bg');
                expect(category).toHaveProperty('text');
                expect(category).toHaveProperty('label');
                expect(typeof category.label).toBe('string');
            });
        });
    });

    describe('STATUS_COLORS', () => {
        it('should have pending, approved, and rejected statuses', () => {
            expect(STATUS_COLORS).toHaveProperty('pending');
            expect(STATUS_COLORS).toHaveProperty('approved');
            expect(STATUS_COLORS).toHaveProperty('rejected');
        });
    });

    describe('COMMON_STYLES', () => {
        it('should have card styles', () => {
            expect(COMMON_STYLES.card).toHaveProperty('backgroundColor');
            expect(COMMON_STYLES.card).toHaveProperty('borderRadius');
            expect(COMMON_STYLES.card).toHaveProperty('padding');
        });

        it('should have screenBackground', () => {
            expect(COMMON_STYLES.screenBackground).toBe('#f8fafc');
        });

        it('should have headerGradient with two colors', () => {
            expect(COMMON_STYLES.headerGradient).toHaveLength(2);
        });
    });
});
