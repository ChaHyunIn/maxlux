import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qiniu-uploads-cdn.charmdeer.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.hotellux.com.cn',
      },
      {
        protocol: 'https',
        hostname: 'hotel.hotelux.com',
      },
      {
        protocol: 'https',
        hostname: 'img.hotellux.com',
      },
      {
        protocol: 'https',
        hostname: 'img.hotellux.com.cn',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withSentryConfig(
  withNextIntl(nextConfig),
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during bundling
    silent: true,
    org: "maxlux",
    project: "web",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors.
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    automaticVercelMonitors: true,
  }
);
