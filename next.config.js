/* eslint-disable @typescript-eslint/no-var-requires */
const isDev = process.env.NODE_ENV === 'development'

const defaultConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/home',
      },
    ]
  },
  plugins: [
    './common/plugins/axios.ts'
  ]
}

module.exports = (function () {
  if (isDev) {
    return {
      ...defaultConfig,
      ... {
        env: {
          requestUrl: 'http://127.0.0.1:3009'
        }
      }
    }
  } else {
    const { withSentryConfig } = require('@sentry/nextjs')
    const withPWA = require('next-pwa')
    const runtimeCaching = require('next-pwa/cache')
    return withSentryConfig(withPWA({
      ...defaultConfig,
      ... {
        env: {
          requestUrl: 'https://orangesolo.cn'
        },
        sentry: {
          hideSourceMaps: true,
        },
        pwa: {
          dest: 'public',
          runtimeCaching,
        },
      },
    }),{
      silent: true, // Suppresses all logs
    })
  }
})() 
