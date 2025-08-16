// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,   // no experimental.appDir needed on modern Next
  webpack: (config) => {
        config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'pino-pretty': false,
      'colorette': false,
      'on-exit-leak-free': false,
    };
    return config;
  },
};

module.exports = nextConfig;
