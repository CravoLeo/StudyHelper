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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://*.clerk.accounts.dev https://*.clerk.dev",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.openai.com https://*.supabase.co https://api.stripe.com https://*.clerk.accounts.dev https://*.clerk.dev",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
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