/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Required for Cloudflare Pages
  output: 'standalone',

  // Enable Edge Runtime compatibility
  experimental: {
    runtime: 'edge',
    edge: {
      // If you're using Next.js 14.1.4+
      runtimeVersion: '1',
    },
    // Enable the Edge compiler
    edgeCompiler: true,
  },

  // Optional but recommended for Cloudflare
  swcMinify: true,
  productionBrowserSourceMaps: false,
};

export default nextConfig;
