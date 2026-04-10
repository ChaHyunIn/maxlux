import { formatPrice, getPriceLevel, getRelativeTime } from '@/lib/utils';
import { isValidEmail } from '@/lib/validation';

describe('formatPrice', () => {
    test('KRW 정상', () => expect(formatPrice(300000)).toBe('₩300,000'));
    test('USD 변환', () => expect(formatPrice(1400000, 'USD')).toBe('$1,000'));
    test('null 처리', () => expect(formatPrice(null)).toBeNull());
    test('0원', () => expect(formatPrice(0)).toBe('₩0'));
});

describe('getPriceLevel', () => {
    test('low', () => expect(getPriceLevel(200000, 300000, 600000)).toBe('low'));
    test('mid', () => expect(getPriceLevel(400000, 300000, 600000)).toBe('mid'));
    test('high', () => expect(getPriceLevel(700000, 300000, 600000)).toBe('high'));
    test('경계값 p25', () => expect(getPriceLevel(300000, 300000, 600000)).toBe('low'));
    test('경계값 p75', () => expect(getPriceLevel(600000, 300000, 600000)).toBe('high'));
});

describe('isValidEmail', () => {
    test('정상', () => expect(isValidEmail('test@example.com')).toBe(true));
    test('공백', () => expect(isValidEmail('te st@example.com')).toBe(false));
    test('빈값', () => expect(isValidEmail('')).toBe(false));
});

describe('getRelativeTime', () => {
    const mockT = (key: string) => key;

    test('방금 전', () => {
        const now = new Date().toISOString();
        // @ts-expect-error - mock function
        expect(getRelativeTime(now, mockT)).toBe('justNow');
    });
    test('분 전', () => {
        const d = new Date(Date.now() - 120000).toISOString();
        // @ts-expect-error - mock function
        expect(getRelativeTime(d, mockT)).toBe('minutesAgo');
    });
    test('시간 전', () => {
        const d = new Date(Date.now() - 7200000).toISOString();
        // @ts-expect-error - mock function
        expect(getRelativeTime(d, mockT)).toBe('hoursAgo');
    });
    test('일 전', () => {
        const d = new Date(Date.now() - 172800000).toISOString();
        // @ts-expect-error - mock function
        expect(getRelativeTime(d, mockT)).toBe('daysAgo');
    });
});
