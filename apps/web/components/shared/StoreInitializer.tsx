'use client';

import { useEffect, useRef } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import { useSettingStore } from '@/stores/settingStore';

interface StoreInitializerProps {
    exchangeRate: number;
    locale: string;
}

/**
 * 서버에서 가져온 데이터를 클라이언트 Zustand 스토어에 초기화하는 컴포넌트입니다.
 */
export function StoreInitializer({ exchangeRate, locale }: StoreInitializerProps) {
    const initialized = useRef(false);

    if (!initialized.current) {
        useSettingStore.getState().setExchangeRate(exchangeRate);
        initialized.current = true;
    }

    // 마운트 시에도 한 번 더 확인 (Client-side 업데이트 대비)
    useEffect(() => {
        const state = useSettingStore.getState();
        state.setExchangeRate(exchangeRate);
        
        // 프리미엄 경험 보강: 사용자의 명시적인 선택이 없는 경우, 영어 로케일이면 기본 통화를 USD로 설정
        // eslint-disable-next-line no-restricted-syntax
        const hasUserChoice = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (!hasUserChoice && locale === 'en' && state.currency === 'KRW') {
            state.setCurrency('USD');
        }
    }, [exchangeRate, locale]);

    return null;
}
