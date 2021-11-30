
module.exports = {
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