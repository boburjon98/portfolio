import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.PORTFOLIO_DIST_DIR || '.next',
  output: 'standalone', // <--- mana shu qatorni qo'shing
};

export default nextConfig;
