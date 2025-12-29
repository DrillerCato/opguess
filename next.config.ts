/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // This is required for Cloudflare Pages static hosting
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;