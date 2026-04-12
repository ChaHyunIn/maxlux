import { formatPrice, getPriceLevel, getRelativeTime } from '@/lib/utils';
import { isValidEmail } from '@/lib/validation';
import type { useTranslations } from 'next-intl';

// 타입 안전한 mock 생성
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const mockT = ((key: string) => key) as unknown as ReturnType<typeof useTranslations>;

describe('formatPrice', () => {
    test('KRW 정상', () => expect(formatPrice(300000)).toBe('₩300,000'));
    // ko-KR locale에서 USD는 US$로 표기됨
    test('USD 변환', () => expect(formatPrice(1400000, 'USD')).toBe('US$1,000'));
    test('USD EN locale', () => expect(formatPrice(1400000, 'USD', 1400, 'en')).toBe('$1,000'));
    test('KRW EN locale', () => expect(formatPrice(300000, 'KRW', undefined, 'en')).toBe('₩300,000'));
    test('null 처리', () => expect(formatPrice(null)).toBe(''));
    test('undefined 처리', () => expect(formatPrice(undefined)).toBe(''));
    test('0원', () => expect(formatPrice(0)).toBe('₩0'));
    test('USD with custom rate', () => expect(formatPrice(1500000, 'USD', 1500)).toBe('US$1,000'));
    test('소수점 없음 KRW', () => expect(formatPrice(333333)).toBe('₩333,333'));
    test('소수점 없음 USD', () => expect(formatPrice(1400000, 'USD', 1400)).toBe('US$1,000'));
});

describe('getPriceLevel', () => {
    test('low', () => expect(getPriceLevel(200000, 300000, 600000)).toBe('low'));
    test('mid', () => expect(getPriceLevel(400000, 300000, 600000)).toBe('mid'));
    test('high', () => expect(getPriceLevel(700000, 300000, 600000)).toBe('high'));
    test('경계값 p25', () => expect(getPriceLevel(300000, 300000, 600000)).toBe('low'));
    test('경계값 p75', () => expect(getPriceLevel(600000, 300000, 600000)).toBe('high'));
    test('p25 === p75', () => expect(getPriceLevel(300000, 300000, 300000)).toBe('mid'));
});

describe('isValidEmail', () => {
    test('정상', () => expect(isValidEmail('test@example.com')).toBe(true));
    test('공백', () => expect(isValidEmail('te st@example.com')).toBe(false));
    test('빈값', () => expect(isValidEmail('')).toBe(false));
});

describe('getRelativeTime', () => {
    test('방금 전', () => {
        const now = new Date().toISOString();
        expect(getRelativeTime(now, mockT)).toBe('justNow');
    });
    test('분 전', () => {
        const d = new Date(Date.now() - 120000).toISOString();
        expect(getRelativeTime(d, mockT)).toBe('minutesAgo');
    });
    test('시간 전', () => {
        const d = new Date(Date.now() - 7200000).toISOString();
        expect(getRelativeTime(d, mockT)).toBe('hoursAgo');
    });
    test('일 전', () => {
        const d = new Date(Date.now() - 172800000).toISOString();
        expect(getRelativeTime(d, mockT)).toBe('daysAgo');
    });
    test('null 처리', () => {
        expect(getRelativeTime(null, mockT)).toBe('unknown');
    });
});
