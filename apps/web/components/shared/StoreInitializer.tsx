'use client';

import { useEffect, useRef } from 'react';
import { useSettingStore } from '@/stores/settingStore';

interface StoreInitializerProps {
    exchangeRate: number;
}

/**
 * 서버에서 가져온 데이터를 클라이언트 Zustand 스토어에 초기화하는 컴포넌트입니다.
 */
export function StoreInitializer({ exchangeRate }: StoreInitializerProps) {
    const initialized = useRef(false);

    if (!initialized.current) {
        useSettingStore.getState().setExchangeRate(exchangeRate);
        initialized.current = true;
    }

    // 마운트 시에도 한 번 더 확인 (Client-side 업데이트 대비)
    useEffect(() => {
        useSettingStore.getState().setExchangeRate(exchangeRate);
    }, [exchangeRate]);

    return null;
}
