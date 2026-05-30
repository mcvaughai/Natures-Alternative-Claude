/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ezryfycxfmtffobyfjfa.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
