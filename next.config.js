/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'tesseract.js']
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle Tesseract.js worker files
      config.resolve.alias = {
        ...config.resolve.alias,
      }
      
      // Copy worker files to output directory
      config.module.rules.push({
        test: /tesseract\.js$/,
        use: 'ignore-loader'
      })
    }
    
    return config
  },
}

module.exports = nextConfig 