/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['webtris.highwaysengland.co.uk'],
  },
}

module.exports = nextConfig 