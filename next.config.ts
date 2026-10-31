import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Live Google Ads ad (Registration 2027) points here; the page is /sponsorship.
      { source: '/sponsors', destination: '/sponsorship', permanent: false },
    ];
  },
};

export default nextConfig;
