import { formatPrice, getPriceLevel } from '@/lib/utils';
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
