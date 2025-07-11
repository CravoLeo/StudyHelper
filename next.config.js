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
  async headers() {
    return [
      {
        // Apply CSP headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https: data:",
              "style-src 'self' 'unsafe-inline' https: data:",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https:",
              "worker-src 'self' blob: data:",
              "child-src 'self' blob: data:",
              "frame-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'"
            ].join('; ')
          }
        ]
      }
    ]
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