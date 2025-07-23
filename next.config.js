/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'images.unsplash.com', "via.placeholder.com", "i.ibb.co"], 
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Note: The rewrite rule is not needed when using server.js as a unified server
  // The server.js file handles both API routes and Next.js serving
}

module.exports = nextConfig;
