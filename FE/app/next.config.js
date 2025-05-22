const removeImports = require('next-remove-imports')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
};

module.exports = removeImports(nextConfig); 