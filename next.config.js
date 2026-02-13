/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'uploadthing.com',
      'utfs.io',
      'cloudinary.com',
      'res.cloudinary.com',
      'picsum.photos', // For demo images
      'extdvqbwnpsbvsxpeavj.supabase.co', // Supabase storage
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
}

module.exports = nextConfig
