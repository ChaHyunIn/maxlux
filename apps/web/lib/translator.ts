export const CHINESE_DICT: Record<string, { ko: string; en: string }> = {
    '大床': { ko: '킹/퀸 베드', en: 'King/Queen Bed' },
    '双床': { ko: '트윈 베드', en: 'Twin Bed' },
    '单人': { ko: '싱글 베드', en: 'Single Bed' },
    '套房': { ko: '스위트', en: 'Suite' },
    '标准': { ko: '스탠다드', en: 'Standard' },
    '高级': { ko: '슈페리어', en: 'Superior' },
    '豪华': { ko: '디럭스', en: 'Deluxe' },
    '行政': { ko: '이그제큐티브', en: 'Executive' },
    '尊贵': { ko: '프리미엄', en: 'Premium' },
    '总统': { ko: '프레지덴셜', en: 'Presidential' },
    '海景': { ko: '오션뷰', en: 'Ocean View' },
    '江景': { ko: '리버뷰', en: 'River View' },
    '湖景': { ko: '레이크뷰', en: 'Lake View' },
    '山景': { ko: '마운틴뷰', en: 'Mountain View' },
    '城景': { ko: '시티뷰', en: 'City View' },
    '市景': { ko: '시티뷰', en: 'City View' },
    '园景': { ko: '가든뷰', en: 'Garden View' },
    '景观': { ko: '뷰', en: 'View' },
    '无窗': { ko: '창문 없음', en: 'No Window' },
    '一居室': { ko: '1베드룸', en: '1 Bedroom' },
    '两居室': { ko: '2베드룸', en: '2 Bedroom' },
    '三居室': { ko: '3베드룸', en: '3 Bedroom' },
    '房': { ko: '룸 ', en: 'Room' },
    '双早': { ko: '2인 조식', en: 'Breakfast for 2' },
    '单早': { ko: '1인 조식', en: 'Breakfast for 1' },
    '无早': { ko: '조식 불포함', en: 'Room Only' },
    '含早': { ko: '조식 포함', en: 'Breakfast Included' },
    '含': { ko: '포함', en: 'Included' },
    '早餐': { ko: '조식', en: 'Breakfast' },
    '会员专属': { ko: '회원 전용', en: 'Member Exclusive' },
    '会员专享': { ko: '회원 전용', en: 'Member Exclusive' },
    '会员价': { ko: '회원 특가', en: 'Member Rate' },
    '会员': { ko: '회원', en: 'Member' },
    '特惠': { ko: '특가', en: 'Special Offer' },
    '促销': { ko: '프로모션', en: 'Promotion' },
    '连住': { ko: '연박', en: 'Consecutive Nights' },
    '提前预订': { ko: '얼리버드', en: 'Early Bird' },
    '早鸟': { ko: '얼리버드', en: 'Early Bird' },
    '尊享': { ko: '스페셜', en: 'Special' },
    '礼遇': { ko: '혜택', en: 'Benefit' },
    '免费': { ko: '무료', en: 'Free' },
    '取消': { ko: '취소', en: 'Cancel' },
    '灵活': { ko: '플렉시블', en: 'Flexible' },
    '不可': { ko: '불가', en: 'Non-' },
    '预付': { ko: '사전결제', en: 'Prepaid' }
};

export function getLocalizedText(en: string | null, local: string | null, locale: string): string {
    const hasChinese = (str: string | null) => str ? /[\u4e00-\u9fa5]/.test(str) : false;

    // Valid English name available
    if (en && !hasChinese(en)) {
        return en;
    }

    // Only Chinese is left. Translate it.
    const textToTranslate = local || en || '';
    if (!textToTranslate) return '';

    let result = textToTranslate;
    Object.entries(CHINESE_DICT).forEach(([cnText, translations]) => {
        const replacement = locale === 'en' ? translations.en + ' ' : translations.ko;
        result = result.split(cnText).join(replacement);
    });
    return result.replace(/\s+/g, ' ').trim();
}
