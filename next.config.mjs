/** @type {import('next').NextConfig} */
const nextConfig = {
  // Needed for Cloudflare OpenNext bundling (jose/jwks-rsa in Firebase Admin deps)
  serverExternalPackages: ["jose"],
  experimental: {
    serverActions: {
      allowedOrigins: []
    }
  }
};

export default nextConfig;
