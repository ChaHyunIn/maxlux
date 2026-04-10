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
};

export default withNextIntl(nextConfig);
