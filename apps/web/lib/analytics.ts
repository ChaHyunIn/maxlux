import { track } from '@vercel/analytics';

/**
 * 전역 분석 트래킹 유틸리티
 * 
 * 서비스의 핵심 비즈니스 이벤트를 추적합니다.
 * 분석 서버 장애 시에도 사용자 경험에 영향을 주지 않도록 안전하게 처리합니다.
 */

export type AnalyticsEventName = 
  | 'hotel_view' 
  | 'booking_click' 
  | 'alert_created' 
  | 'alert_deleted' 
  | 'ota_compare' 
  | 'filter_used' 
  | 'favorite_toggle' 
  | 'search_used';

export function trackEvent(
  name: AnalyticsEventName, 
  properties?: Record<string, string | number | boolean>
) {
  try {
    // Vercel Analytics track 호출
    track(name, properties);
  } catch (error) {
    // 분석 에러가 사용자 서비스 경험을 방해하지 않도록 swallow
  }
}
