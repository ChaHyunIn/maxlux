import * as Sentry from "@sentry/nextjs";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Tracing — production에서는 10%만 샘플링하여 비용과 성능 부하 최소화
  tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,

  debug: false,

  // 에러 발생 시 세션 리플레이는 100% 캡처 (에러 디버깅에 필수)
  replaysOnErrorSampleRate: 1.0,

  // 일반 세션 리플레이는 production에서 1%로 제한
  replaysSessionSampleRate: IS_PRODUCTION ? 0.01 : 0.1,

  // 브라우저 프로파일링도 production에서 10%만
  profilesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,
});
