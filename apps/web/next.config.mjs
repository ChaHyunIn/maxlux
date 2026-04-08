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
    ],
  },
};

export default nextConfig;
